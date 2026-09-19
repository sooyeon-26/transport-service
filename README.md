# 타도될까

서울시 버스 승하차 자료를 노선·정류장·시간대별로 조회하고, 평균 승차 인원을 기준으로 혼잡 구간을 보여주는 웹 서비스입니다.

[배포된 데모 보기](https://transport-service-omega.vercel.app/)

![타도될까 노선과 정류장 선택 화면](docs/preview.png)

## 문제

버스 도착 정보만으로는 어느 시간대가 덜 붐비는지 비교하기 어렵습니다. 공개된 월별 승하차 자료를 사용해 같은 노선과 정류장의 시간대별 차이를 한 화면에서 확인할 수 있도록 만들었습니다.

## 해결 방식

Python으로 최근 월 CSV를 노선·정류장·시간대 조회 구조의 gzip JSON 캐시로 만들었습니다. Express는 캐시를 메모리 인덱스로 구성해 선택 조건에 맞는 데이터만 반환하고, React 화면은 일평균 승차 인원을 혼잡 단계와 이용 안내로 바꿉니다.

## 주요 기능

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

`build:cache`는 가장 최근 월의 CSV만 읽어 `backend/model/bus_api_cache.json.gz`를 만듭니다. 배포 환경에서는 이 압축 캐시를 읽고, 로컬에 기존 JSON 캐시가 있으면 폴백으로 사용할 수 있습니다.

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

## 배포

- Production: [transport-service-omega.vercel.app](https://transport-service-omega.vercel.app/)
- Vercel에서 React 프론트엔드와 Express API를 각각 서비스로 빌드합니다.
- 배포에는 최근 월의 `bus_api_cache.json.gz`만 포함하고 원본 CSV와 12개월 전체 캐시는 제외합니다.
- `/api/*` 요청은 Express 서비스가 처리합니다.

## 여러 달의 데이터를 확인하려면

기본 캐시는 실행 속도와 파일 크기를 고려해 최근 1개월만 포함합니다. 저장된 모든 CSV를 포함하려면 아래 명령을 사용합니다.

```bash
npm run build:cache:all
```

현재 12개월 데이터를 압축 전 JSON으로 모두 구성하면 약 317MB까지 커지고, 서버가 시작할 때 전체 내용을 메모리에 올립니다. 배포 환경에서는 최근 월만 사용하거나 데이터베이스로 옮기는 편이 안전합니다.

## 데이터와 실험 파일

- `csv/`: 2025년 6월부터 2026년 5월까지의 월별 원본 자료
- `backend/model/preprocess.py`: 가장 최근 월 CSV를 실험용 학습 데이터로 변환
- `backend/model/train_model.py`: Random Forest 실험 모델과 전처리 결과 생성

`processed_bus_data.pkl`과 `bus_crowding_model.pkl`은 생성 파일이라 Git에 포함하지 않습니다. 실험을 다시 실행하려면 아래 명령을 사용합니다.

```bash
python -m pip install -r backend/model/requirements.txt
npm run train
```

기본값은 `csv/`에서 파일명이 가장 최신인 월을 사용합니다. 다른 파일을 쓰려면 `BUS_DATA_PATH`에 경로를 지정합니다. 모델과 `predict.py`는 별도의 실험 코드이며 현재 Express API 요청 경로에서는 사용하지 않습니다.

월별 원본 CSV는 데이터 출처를 재현하기 위해 현재 저장소에 남겨 두었습니다. Git 기록에는 과거의 중복 CSV와 생성 모델도 남아 있으므로 공개 저장소 크기를 실질적으로 줄이려면 Git LFS로 이전하거나 코드 중심의 새 저장소를 만드는 과정이 추가로 필요합니다.

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
