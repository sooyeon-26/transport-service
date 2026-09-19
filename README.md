# 서울 버스 시간대별 혼잡도

서울시 버스 승하차 자료를 노선·정류장·시간대별로 조회하고, 평균 승차 인원을 기준으로 혼잡 구간을 보여주는 웹 서비스입니다.

## 만든 이유

버스 도착 정보만으로는 어느 시간대가 덜 붐비는지 비교하기 어렵습니다. 공개된 월별 승하차 자료를 사용해 같은 노선과 정류장의 시간대별 차이를 한 화면에서 확인할 수 있도록 만들었습니다.

## 현재 동작하는 범위

- 데이터가 존재하는 월, 노선, 정류장 선택
- 시간대별 일평균 승차 인원 그래프 조회
- 선택한 시간의 예상 승차 인원과 혼잡 단계 표시
- 혼잡한 시간대에 다음 시간 이용 안내
- CSV에서 API용 JSON 캐시 생성
- 프론트엔드 개발 서버에서 Express API로 프록시

현재 서비스의 결과는 머신러닝 예측값이 아닙니다. 월별 총 승차 인원을 해당 월의 일수로 나눈 일평균 값에 구간 규칙을 적용한 추정치입니다.

| 일평균 승차 인원 | 표시 |
| ---: | --- |
| 0–20명 | 여유 |
| 21–50명 | 보통 |
| 51–80명 | 혼잡 |
| 81명 이상 | 매우 혼잡 |

## 데이터 흐름

```text
서울시 월별 CSV
  → build_bus_api_cache.py
  → 최근 월 API 캐시
  → Express API
  → React 그래프와 시간대 안내
```

## 기술 선택

| 구분 | 사용 기술 | 맡은 역할 |
| --- | --- | --- |
| Frontend | React, Vite, Recharts, styled-components | 조회 조건과 시간대 그래프 |
| Backend | Express | 캐시 조회와 혼잡 단계 계산 |
| Data pipeline | Python 표준 라이브러리 | CSV 인코딩 처리와 월별 캐시 생성 |
| Test | Node.js test runner | 혼잡 구간과 안내 문구 검증 |

## 실행 방법

요구 환경은 Node.js 20.19 이상 또는 22.12 이상과 Python 3.10 이상입니다.

```bash
npm run install:all
npm run build:cache
```

`build:cache`는 가장 최근 월의 CSV만 읽어 `backend/model/bus_api_cache.json`을 만듭니다. 캐시는 생성 파일이라 Git에 포함하지 않습니다.

서버 두 개를 각각 실행합니다.

```bash
# 터미널 1
npm run server

# 터미널 2
npm run dev
```

프론트엔드는 `http://localhost:5173`, API는 `http://localhost:4000`에서 실행됩니다. Vite 개발 서버는 `/api` 요청을 백엔드로 전달합니다.

## 테스트와 빌드

```bash
npm test
npm run build
npm audit --omit=dev --prefix frontend
npm audit --omit=dev --prefix backend
```

## 여러 달의 데이터를 확인하려면

기본 캐시는 실행 속도와 파일 크기를 고려해 최근 1개월만 포함합니다. 저장된 모든 CSV를 포함하려면 아래 명령을 사용합니다.

```bash
npm run build:cache:all
```

현재 12개월 데이터를 모두 포함하면 캐시가 약 317MB까지 커지고, 서버가 시작할 때 JSON 전체를 메모리에 올립니다. 배포 환경에서는 최근 월만 사용하거나 데이터베이스로 옮기는 편이 안전합니다.

## 데이터와 실험 파일

- `csv/`: 2025년 6월부터 2026년 5월까지의 월별 원본 자료
- `backend/data/bus_passenger.csv`: 2026년 5월 원본과 동일한 학습 파이프라인 입력 스냅샷
- `backend/model/processed_bus_data.pkl`: Python 실험용 전처리 결과
- `backend/model/bus_crowding_model.pkl`: Random Forest 실험 모델

모델 파일과 `predict.py`는 별도의 실험 흔적이며 현재 Express API 요청 경로에서는 사용하지 않습니다. 현재 저장소에는 원본과 동일한 15.8MB CSV가 한 번 더 들어 있고, 전처리 결과도 약 53.8MB이므로 공개 저장소로 정리할 때는 Git LFS나 외부 데이터 저장소로 옮기는 작업이 필요합니다. 기존 Git 기록의 크기는 파일을 현재 커밋에서 지우는 것만으로 줄어들지 않아 이번 정리에서는 원본을 보존했습니다.

## 주요 API

```text
GET /health
GET /api/bus/options
GET /api/bus/stations?route=0017&month=202605
GET /api/bus/hourly?route=0017&station=남이장군사당(00017)&month=202605
GET /api/bus/predict?route=0017&station=남이장군사당(00017)&month=202605&hour=8
```

## 현재 한계

- 승차 인원은 차량 한 대의 실시간 탑승자 수가 아니라 해당 정류장의 월별 집계에서 계산한 일평균입니다.
- 평일·주말이 원본 캐시에 분리되어 있지 않아 화면에서 선택하더라도 같은 `all` 데이터를 사용합니다.
- 배차 간격, 차량 정원, 행사와 날씨를 반영하지 않습니다.
- 전체 기간 캐시는 정적 JSON 구조라 기간이 늘어날수록 시작 시간과 메모리 사용량이 커집니다.
