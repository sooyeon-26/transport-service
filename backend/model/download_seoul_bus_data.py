import csv
import json
import os
import sys
import time
from pathlib import Path
from urllib.error import URLError
from urllib.request import urlopen

API_NAME = "CardBusTimeNew"
API_BASE_URL = "http://openapi.seoul.go.kr:8088"
DEFAULT_USE_YM = "202605"
DEFAULT_BATCH_SIZE = 1000
OUTPUT_PATH = Path(__file__).resolve().parents[1] / "data" / "bus_passenger.csv"


def fetch_json(url: str) -> dict:
    with urlopen(url, timeout=30) as response:
        payload = response.read().decode("utf-8")
    try:
        return json.loads(payload)
    except json.JSONDecodeError:
        raise RuntimeError(payload[:500])


def fetch_rows(api_key: str, use_ym: str, batch_size: int = DEFAULT_BATCH_SIZE) -> list[dict]:
    rows = []
    start = 1
    total_count = None

    while total_count is None or start <= total_count:
        end = start + batch_size - 1
        url = f"{API_BASE_URL}/{api_key}/json/{API_NAME}/{start}/{end}/{use_ym}"
        data = fetch_json(url)

        if API_NAME not in data:
            raise RuntimeError(json.dumps(data, ensure_ascii=False))

        body = data[API_NAME]
        result = body.get("RESULT", {})
        if result.get("CODE") not in [None, "INFO-000"]:
            raise RuntimeError(result.get("MESSAGE", "서울시 API 요청에 실패했습니다."))

        total_count = int(body.get("list_total_count", 0))
        chunk = body.get("row", [])
        rows.extend(chunk)
        print(f"downloaded {len(rows):,}/{total_count:,} rows", file=sys.stderr)

        if not chunk:
            break
        start = end + 1
        time.sleep(0.08)

    return rows


def write_csv(rows: list[dict], output_path: Path = OUTPUT_PATH):
    if not rows:
        raise RuntimeError("저장할 데이터가 없습니다.")

    fieldnames = list(rows[0].keys())
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", newline="", encoding="utf-8-sig") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def main():
    api_key = os.getenv("SEOUL_API_KEY", "").strip()
    use_ym = os.getenv("SEOUL_USE_YM", DEFAULT_USE_YM).strip()
    batch_size = int(os.getenv("SEOUL_BATCH_SIZE", str(DEFAULT_BATCH_SIZE)))

    if not api_key or api_key == "sample":
        print(
            "SEOUL_API_KEY 환경변수에 서울 열린데이터광장 인증키를 넣어주세요. "
            "sample 키는 5건까지만 허용되어 전체 실제 데이터 다운로드가 불가능합니다.",
            file=sys.stderr,
        )
        sys.exit(1)

    try:
        rows = fetch_rows(api_key, use_ym, batch_size)
        write_csv(rows)
    except (RuntimeError, URLError) as error:
        print(f"download failed: {error}", file=sys.stderr)
        sys.exit(1)

    print(f"saved {len(rows):,} rows to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
