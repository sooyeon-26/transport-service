from pathlib import Path
import calendar
import re
import pandas as pd

# 실제 서울시 공공데이터 CSV로 교체할 때 가장 먼저 수정할 영역입니다.
# 예: "노선번호"가 "버스노선번호", "정류장명"이 "역명"처럼 다르면 여기만 바꾸면 됩니다.
DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "bus_passenger.csv"
ROUTE_COL_CANDIDATES = ["노선번호", "RTE_NO"]
STATION_COL_CANDIDATES = ["정류장명", "역명", "SBWY_STNS_NM"]
DAY_TYPE_COL_CANDIDATES = ["요일구분", "DAY_TYPE", "dayType"]
USE_YM_COL_CANDIDATES = ["USE_YM", "사용년월"]

# 서울시 CardBusTimeNew는 월별 집계 데이터라 요일 컬럼이 없습니다.
DEFAULT_DAY_TYPE = "all"
CONVERT_MONTH_TOTAL_TO_DAILY_AVERAGE = True

# 시간대 컬럼명이 실제 CSV와 다르면 이 패턴 또는 아래 자동 수집 로직을 조정하세요.
# 현재 샘플: 06시승차, 07시승차 ... / 06시하차, 07시하차 ...
BOARDING_PATTERNS = [
    re.compile(r"(\d{1,2})시승차"),
    re.compile(r"(\d{1,2})시승차총승객수"),
    re.compile(r"HR_(\d{1,2})_GET_ON_(?:TNOPE|NOPE)"),
]
ALIGHTING_PATTERNS = [
    re.compile(r"(\d{1,2})시하차"),
    re.compile(r"(\d{1,2})시하차총승객수"),
    re.compile(r"HR_(\d{1,2})_GET_OFF_(?:TNOPE|NOPE)"),
]

CROWDING_LABELS = ["여유", "보통", "혼잡", "매우 혼잡"]


def label_crowding(passengers: float) -> str:
    """승차 인원 기반 기본 라벨링입니다. 추후 분위수 기준 함수로 교체하기 쉽게 분리했습니다."""
    if passengers <= 20:
        return "여유"
    if passengers <= 50:
        return "보통"
    if passengers <= 80:
        return "혼잡"
    return "매우 혼잡"


def label_crowding_by_quantile(df: pd.DataFrame, value_col: str = "passengers") -> pd.Series:
    """확장용 예시: 노선/정류장별 분위수 기준 라벨링이 필요할 때 사용할 수 있습니다."""
    quantiles = df[value_col].quantile([0.25, 0.5, 0.75]).to_dict()

    def _label(value: float) -> str:
        if value <= quantiles[0.25]:
            return "여유"
        if value <= quantiles[0.5]:
            return "보통"
        if value <= quantiles[0.75]:
            return "혼잡"
        return "매우 혼잡"

    return df[value_col].apply(_label)


def _first_existing(columns, candidates, required=True):
    for candidate in candidates:
        if candidate in columns:
            return candidate
    if required:
        raise ValueError(f"필수 컬럼을 찾지 못했습니다. 후보: {', '.join(candidates)}")
    return None


def _hour_columns(columns, patterns):
    matched = []
    for column in columns:
        for pattern in patterns:
            match = pattern.fullmatch(str(column))
            if match:
                matched.append((column, int(match.group(1))))
                break
    return matched


def _month_days(value) -> int:
    text = str(value)
    if not re.fullmatch(r"\d{6}", text):
        return 1
    year = int(text[:4])
    month = int(text[4:])
    return calendar.monthrange(year, month)[1]


def load_raw_data(csv_path: Path = DATA_PATH) -> pd.DataFrame:
    # 실제 공공데이터가 cp949로 제공되는 경우가 많아 utf-8 실패 시 cp949로 재시도합니다.
    try:
        return pd.read_csv(csv_path, low_memory=False)
    except UnicodeDecodeError:
        return pd.read_csv(csv_path, encoding="cp949", low_memory=False)


def preprocess(csv_path: Path = DATA_PATH) -> pd.DataFrame:
    raw = load_raw_data(csv_path)
    route_col = _first_existing(raw.columns, ROUTE_COL_CANDIDATES)
    station_col = _first_existing(raw.columns, STATION_COL_CANDIDATES)
    day_type_col = _first_existing(raw.columns, DAY_TYPE_COL_CANDIDATES, required=False)
    use_ym_col = _first_existing(raw.columns, USE_YM_COL_CANDIDATES, required=False)

    if day_type_col is None:
        day_type_col = "__dayType"
        raw[day_type_col] = DEFAULT_DAY_TYPE

    boarding_columns = _hour_columns(raw.columns, BOARDING_PATTERNS)
    alighting_columns = dict(_hour_columns(raw.columns, ALIGHTING_PATTERNS))

    if not boarding_columns:
        raise ValueError("시간대별 승차 컬럼을 찾지 못했습니다. preprocess.py의 BOARDING_PATTERN을 확인하세요.")

    id_vars = [route_col, station_col, day_type_col]
    if use_ym_col:
        id_vars.append(use_ym_col)
    board_col_names = [column for column, _hour in boarding_columns]

    # 서울시 데이터가 시간대별 승차 인원을 가로 컬럼으로 제공할 때 세로 형태로 바꿉니다.
    melted = raw.melt(
        id_vars=id_vars,
        value_vars=board_col_names,
        var_name="hourColumn",
        value_name="passengers",
    )
    melted["hour"] = melted["hourColumn"].str.extract(r"(\d{1,2})").astype(int)
    melted["route"] = melted[route_col].astype(str)
    melted["station"] = melted[station_col].astype(str)
    melted["dayType"] = melted[day_type_col].astype(str)
    melted["passengers"] = pd.to_numeric(melted["passengers"], errors="coerce").fillna(0)
    if use_ym_col and CONVERT_MONTH_TOTAL_TO_DAILY_AVERAGE:
        melted["passengers"] = melted["passengers"] / melted[use_ym_col].apply(_month_days)

    long_df = melted[["route", "station", "dayType", "hour", "passengers"]].copy()

    if alighting_columns:
        alight_names = list(alighting_columns.keys())
        alighted = raw.melt(
            id_vars=id_vars,
            value_vars=alight_names,
            var_name="hourColumn",
            value_name="alightPassengers",
        )
        alighted["hour"] = alighted["hourColumn"].str.extract(r"(\d{1,2})").astype(int)
        alighted["route"] = alighted[route_col].astype(str)
        alighted["station"] = alighted[station_col].astype(str)
        alighted["dayType"] = alighted[day_type_col].astype(str)
        alighted["alightPassengers"] = pd.to_numeric(alighted["alightPassengers"], errors="coerce").fillna(0)
        if use_ym_col and CONVERT_MONTH_TOTAL_TO_DAILY_AVERAGE:
            alighted["alightPassengers"] = alighted["alightPassengers"] / alighted[use_ym_col].apply(_month_days)
        long_df = long_df.merge(
            alighted[["route", "station", "dayType", "hour", "alightPassengers"]],
            on=["route", "station", "dayType", "hour"],
            how="left",
        )
    else:
        long_df["alightPassengers"] = 0

    grouped = (
        long_df.groupby(["route", "station", "dayType", "hour"], as_index=False)
        .agg(passengers=("passengers", "mean"), alightPassengers=("alightPassengers", "mean"))
    )
    grouped["crowding"] = grouped["passengers"].apply(label_crowding)
    grouped["isWeekend"] = grouped["dayType"].str.lower().isin(["weekend", "sat", "sun", "주말"]).astype(int)
    return grouped


if __name__ == "__main__":
    print(preprocess().head(20).to_string(index=False))
