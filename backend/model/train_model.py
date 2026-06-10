from pathlib import Path
import joblib
import json
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

from preprocess import preprocess

MODEL_PATH = Path(__file__).resolve().parent / "bus_crowding_model.pkl"
PROCESSED_DATA_PATH = Path(__file__).resolve().parent / "processed_bus_data.pkl"
API_CACHE_PATH = Path(__file__).resolve().parent / "bus_api_cache.json"
MAX_TRAIN_ROWS = 50_000


def train():
    df = preprocess()
    full_df = df.copy()
    full_rows = len(df)
    if len(df) > MAX_TRAIN_ROWS:
        df = df.sample(MAX_TRAIN_ROWS, random_state=42)

    features = ["route", "station", "dayType", "hour", "isWeekend", "passengers", "alightPassengers"]
    target = "crowding"

    x = df[features]
    y = df[target]

    preprocessor = ColumnTransformer(
        transformers=[
            ("category", OneHotEncoder(handle_unknown="ignore"), ["route", "station", "dayType"]),
            ("number", "passthrough", ["hour", "isWeekend", "passengers", "alightPassengers"]),
        ]
    )

    model = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            (
                "classifier",
                RandomForestClassifier(
                    n_estimators=60,
                    max_depth=18,
                    random_state=42,
                    class_weight="balanced",
                    n_jobs=-1,
                ),
            ),
        ]
    )

    if len(df) >= 20 and y.nunique() > 1:
        x_train, x_test, y_train, y_test = train_test_split(
            x,
            y,
            test_size=0.25,
            random_state=42,
            stratify=y,
        )
        model.fit(x_train, y_train)
        report = classification_report(y_test, model.predict(x_test), zero_division=0)
    else:
        model.fit(x, y)
        report = "샘플 데이터가 작아 전체 데이터로 학습했습니다."

    artifact = {
        "model": model,
        "features": features,
        "trainingRows": len(df),
        "sourceRows": full_rows,
        "routes": sorted(df["route"].unique().tolist()),
        "stations": sorted(df["station"].unique().tolist()),
    }
    joblib.dump(artifact, MODEL_PATH)
    joblib.dump(full_df, PROCESSED_DATA_PATH)
    api_rows = full_df.copy()
    api_rows["route"] = api_rows["route"].astype(str)
    api_rows["station"] = api_rows["station"].astype(str)
    api_rows["dayType"] = api_rows["dayType"].astype(str)
    api_rows["passengers"] = api_rows["passengers"].round(0).astype(int)
    api_rows["alightPassengers"] = api_rows["alightPassengers"].round(0).astype(int)
    api_rows["hour"] = api_rows["hour"].astype(int)
    route_stations = {
        route: sorted(group["station"].unique().tolist())
        for route, group in api_rows.groupby("route", sort=True)
    }
    series = {}
    for (route, station, day_type), group in api_rows.groupby(["route", "station", "dayType"], sort=False):
        key = f"{route}|||{station}|||{day_type}"
        series[key] = [
            [int(row.hour), int(row.passengers), int(row.alightPassengers), row.crowding]
            for row in group.sort_values("hour").itertuples(index=False)
        ]
    api_payload = {
        "routes": sorted(api_rows["route"].unique().tolist()),
        "routeStations": route_stations,
        "dayTypes": sorted(api_rows["dayType"].unique().tolist()),
        "hours": sorted(api_rows["hour"].unique().tolist()),
        "series": series,
    }
    API_CACHE_PATH.write_text(json.dumps(api_payload, ensure_ascii=False), encoding="utf-8")
    return report


if __name__ == "__main__":
    print(train())
    print(f"saved: {MODEL_PATH}")
