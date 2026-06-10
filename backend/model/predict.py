import argparse
import json
from pathlib import Path
import sys

import joblib
import pandas as pd

from preprocess import label_crowding, preprocess

MODEL_PATH = Path(__file__).resolve().parent / "bus_crowding_model.pkl"


def _json(data):
    print(json.dumps(data, ensure_ascii=False))


def _load_model():
    if not MODEL_PATH.exists():
        from train_model import train

        train()
    return joblib.load(MODEL_PATH)


def _subset(route, station, day_type):
    df = preprocess()
    matched = df[
        (df["route"].astype(str) == str(route))
        & (df["station"].astype(str) == str(station))
        & (df["dayType"].astype(str) == str(day_type))
    ]
    if matched.empty:
        matched = df[
            (df["route"].astype(str) == str(route))
            & (df["station"].astype(str) == str(station))
        ]
    return df, matched


def _expected_for_hour(matched, hour):
    exact = matched[matched["hour"] == int(hour)]
    if not exact.empty:
        row = exact.iloc[0]
        return float(row["passengers"]), float(row["alightPassengers"])

    if not matched.empty:
        return float(matched["passengers"].mean()), float(matched["alightPassengers"].mean())
    return 0.0, 0.0


def _recommendation(label, hour):
    if label in ["혼잡", "매우 혼잡"]:
        next_hour = min(int(hour) + 1, 23)
        return f"{int(hour)}시는 혼잡도가 높습니다. 가능하면 {next_hour}시 이후 이용을 추천합니다."
    if label == "보통":
        return f"{int(hour)}시는 보통 수준입니다. 여유로운 이동을 원하면 피크 시간대를 피해 주세요."
    return f"{int(hour)}시는 비교적 여유롭습니다. 현재 시간대 이용을 추천합니다."


def predict(route, station, hour, day_type):
    artifact = _load_model()
    model = artifact["model"]
    _df, matched = _subset(route, station, day_type)
    expected, alight = _expected_for_hour(matched, hour)

    input_df = pd.DataFrame(
        [
            {
                "route": str(route),
                "station": str(station),
                "dayType": str(day_type),
                "hour": int(hour),
                "isWeekend": 1 if str(day_type).lower() in ["weekend", "sat", "sun", "주말"] else 0,
                "passengers": expected,
                "alightPassengers": alight,
            }
        ]
    )
    predicted = model.predict(input_df)[0] if expected > 0 else label_crowding(expected)

    return {
        "route": str(route),
        "station": str(station),
        "hour": int(hour),
        "dayType": str(day_type),
        "predictedCrowding": predicted,
        "expectedPassengers": round(expected),
        "recommendation": _recommendation(predicted, hour),
    }


def hourly(route, station, day_type):
    _df, matched = _subset(route, station, day_type)
    rows = []
    for row in matched.sort_values("hour").to_dict("records"):
        rows.append(
            {
                "hour": int(row["hour"]),
                "passengers": round(float(row["passengers"])),
                "crowding": row["crowding"],
            }
        )
    return rows


def options():
    df = preprocess()
    route_stations = {
        route: sorted(group["station"].astype(str).unique().tolist())
        for route, group in df.groupby(df["route"].astype(str))
    }
    return {
        "routes": sorted(df["route"].astype(str).unique().tolist()),
        "stations": sorted(df["station"].astype(str).unique().tolist()),
        "routeStations": route_stations,
        "dayTypes": sorted(df["dayType"].astype(str).unique().tolist()),
        "hours": sorted(df["hour"].astype(int).unique().tolist()),
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=["predict", "hourly", "options"], required=True)
    parser.add_argument("--route", default="")
    parser.add_argument("--station", default="")
    parser.add_argument("--hour", type=int, default=8)
    parser.add_argument("--dayType", default="weekday")
    args = parser.parse_args()

    try:
        if args.mode == "predict":
            _json(predict(args.route, args.station, args.hour, args.dayType))
        elif args.mode == "hourly":
            _json(hourly(args.route, args.station, args.dayType))
        else:
            _json(options())
    except Exception as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
