# 공공데이터 기반 시간대별 버스 혼잡도 예측 서비스

서울시 버스노선별 정류장별 시간대별 승하차 CSV를 기반으로 노선, 정류장, 요일, 시간대별 혼잡도를 예측하는 MVP입니다.

## 구현 계획

1. `backend/data/bus_passenger.csv` 샘플 CSV를 읽습니다.
2. `preprocess.py`에서 실제 CSV 컬럼명을 상단 변수로 관리하고, `pandas.melt()`로 시간대별 가로 컬럼을 세로 형태로 변환합니다.
3. 승차 인원 기준으로 `여유 / 보통 / 혼잡 / 매우 혼잡` 라벨을 생성합니다.
4. `RandomForestClassifier`를 학습하고 `backend/model/bus_crowding_model.pkl`로 저장합니다.
5. Express API가 `predict.py`를 호출해 예측 결과와 시간대별 차트 데이터를 JSON으로 반환합니다.
6. React 대시보드에서 검색 패널, 결과 카드, TOP 3, 막대그래프를 표시합니다.

## Lazyweb UI 리서치 반영

- NJ Transit/WMATA: 노선, 정류장, 날짜/시간 입력을 한곳에 모은 검색 패널 구조를 반영했습니다.
- MBTA: 대중교통 서비스 상태를 빠르게 읽을 수 있는 색상 뱃지와 요약 카드 구조를 반영했습니다.
- Transit/Citymapper: 이동 서비스답게 현재 선택한 노선과 정류장을 중심 정보로 두고 시간대별 상태를 바로 비교하도록 구성했습니다.
- AI/분석 대시보드 사례: 예측 결과, 예상 인원, 피크 시간대를 분리된 카드와 차트로 배치했습니다.

## 실행 순서

```bash
npm run install:all
python3 -m venv backend/venv
backend/venv/bin/pip install -r backend/requirements.txt
backend/venv/bin/python backend/model/train_model.py
npm run server
```

다른 터미널에서:

```bash
cd bus-crowding-ai
npm run dev
```

- Backend: `http://localhost:4100`
- Frontend: `http://localhost:5173`

## API

```http
GET /api/bus/predict?route=143&station=강남역&hour=8&dayType=weekday
GET /api/bus/hourly?route=143&station=강남역&dayType=weekday
GET /api/bus/options
```

## 실제 서울시 데이터로 교체하기

이 프로젝트는 서울 열린데이터광장의 `CardBusTimeNew` 데이터를 지원합니다.

- 데이터명: 서울시 버스노선별 정류장별 시간대별 승하차 인원 정보
- API 서비스명: `CardBusTimeNew`
- 현재 확인한 최신 월: `202605`
- 주의: 원본은 월별 집계 데이터라 요일/평일/주말 정보가 없습니다. 앱에서는 `월 전체` 기준으로 표시합니다.

서울 열린데이터광장 인증키를 발급받은 뒤 아래처럼 실행합니다.

```bash
SEOUL_API_KEY=발급받은_인증키 SEOUL_USE_YM=202605 npm run download:data
npm run train
npm run server
npm run dev
```

다운로드가 완료되면 실제 데이터가 이 파일에 저장됩니다.

```text
backend/data/bus_passenger.csv
```

`sample` 키는 API 구조 확인용이라 한 번에 5건까지만 허용됩니다. 전체 데이터를 받으려면 개인 인증키가 필요합니다.

## 직접 CSV로 교체하기

1. 실제 CSV를 `backend/data/bus_passenger.csv`로 교체합니다.
2. `backend/model/preprocess.py` 상단의 컬럼명 설정을 실제 컬럼명에 맞게 수정합니다.
3. 시간대 승차/하차 컬럼 패턴이 다르면 `BOARDING_PATTERNS`, `ALIGHTING_PATTERNS`를 수정합니다.
4. `npm run train`으로 모델을 다시 학습합니다.
