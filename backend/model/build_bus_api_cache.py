import argparse
import calendar
import csv
import gzip
import json
import re
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[2]
CSV_DIR = ROOT_DIR / "csv"
API_CACHE_PATH = Path(__file__).resolve().parent / "bus_api_cache.json"
API_CACHE_GZIP_PATH = Path(__file__).resolve().parent / "bus_api_cache.json.gz"

FILE_MONTH_PATTERN = re.compile(r"(\d{4})년_.*\((\d{2})월\)\.csv$")
BOARDING_PATTERN = re.compile(r"0?(\d{1,2})시승차총승객수")
ALIGHTING_PATTERN = re.compile(r"0?(\d{1,2})시하차총승객수")


def label_crowding(passengers):
    if passengers <= 20:
        return "여유"
    if passengers <= 50:
        return "보통"
    if passengers <= 80:
        return "혼잡"
    return "매우 혼잡"


def month_days(month_key):
    year = int(month_key[:4])
    month = int(month_key[4:])
    return calendar.monthrange(year, month)[1]


def read_csv(path):
    try:
        file = path.open(newline="", encoding="utf-8-sig")
        reader = csv.DictReader(file)
        rows = list(reader)
        file.close()
        return rows
    except UnicodeDecodeError:
        file = path.open(newline="", encoding="cp949")
        reader = csv.DictReader(file)
        rows = list(reader)
        file.close()
        return rows


def parse_month(path, rows):
    match = FILE_MONTH_PATTERN.search(path.name)
    if match:
        return f"{match.group(1)}{match.group(2)}"
    if rows and rows[0].get("사용년월"):
        return str(rows[0]["사용년월"])
    return ""


def build_cache(month_limit=1):
    csv_files = sorted(CSV_DIR.glob("*.csv"))
    if not csv_files:
        raise RuntimeError(f"CSV 파일을 찾지 못했습니다: {CSV_DIR}")

    if month_limit > 0:
        csv_files = csv_files[-month_limit:]

    series = {}
    month_route_stations = {}
    months = []
    routes = set()
    route_stations = {}
    hours = set(range(24))

    for csv_path in csv_files:
        rows = read_csv(csv_path)
        month_key = parse_month(csv_path, rows)
        if not month_key:
            continue

        days = month_days(month_key)
        months.append(month_key)
        month_route_stations.setdefault(month_key, {})

        for row in rows:
            route = str(row.get("노선번호") or row.get("RTE_NO") or "").strip()
            station = str(row.get("역명") or row.get("정류장명") or row.get("SBWY_STNS_NM") or "").strip()
            if not route or not station:
                continue

            routes.add(route)
            route_stations.setdefault(route, set()).add(station)
            month_route_stations[month_key].setdefault(route, set()).add(station)

            points = []
            for column, value in row.items():
                boarding_match = BOARDING_PATTERN.fullmatch(str(column))
                if not boarding_match:
                    continue

                hour = int(boarding_match.group(1))
                boarding = round((float(value or 0) / days))
                alighting_column = f"{hour}시하차총승객수"
                if hour == 0:
                    alighting_column = "00시하차총승객수"
                alighting = round((float(row.get(alighting_column) or 0) / days))
                points.append([hour, boarding, alighting, label_crowding(boarding)])

            key = f"{month_key}|||{route}|||{station}|||all"
            series[key] = sorted(points, key=lambda point: point[0])

    months = sorted(set(months))
    latest_month = months[-1] if months else ""
    payload = {
        "months": [
            {
                "value": month,
                "label": f"{month[:4]}년 {int(month[4:])}월",
            }
            for month in months
        ],
        "defaultMonth": latest_month,
        "routes": sorted(routes),
        "routeStations": {route: sorted(stations) for route, stations in route_stations.items()},
        "monthRouteStations": {
            month: {route: sorted(stations) for route, stations in routes_by_month.items()}
            for month, routes_by_month in month_route_stations.items()
        },
        "dayTypes": ["all"],
        "hours": sorted(hours),
        "series": series,
    }

    serialized = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    with gzip.open(API_CACHE_GZIP_PATH, "wb", compresslevel=9) as file:
        file.write(serialized)
    return payload


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Build the JSON cache used by the bus API.")
    parser.add_argument(
        "--months",
        type=int,
        default=1,
        help="Number of recent monthly CSV files to include. Use 0 to include every month.",
    )
    args = parser.parse_args()
    cache = build_cache(max(0, args.months))
    print(f"months: {len(cache['months'])}")
    print(f"routes: {len(cache['routes'])}")
    print(f"series: {len(cache['series'])}")
    print(f"saved: {API_CACHE_GZIP_PATH}")
