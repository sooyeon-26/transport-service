# 타도될까

A Seoul bus data explorer that turns monthly public CSVs into an API and hourly boarding charts.

[Demo](https://transport-service-omega.vercel.app/) · [Portfolio](https://sooyeon-developer-portfolio.vercel.app/)

## Overview

Bus arrival times do not show how boarding patterns differ throughout the day. 타도될까 uses monthly Seoul bus boarding and alighting data to compare hours for a selected route and stop. A Python script prepares the data for an Express API, and a React interface presents hourly averages and rule-based crowding labels.

The repository remains named `transport-service`; the service name is **타도될까**.

## Features

- Select an available month, route, stop, and hour.
- View average daily boardings for each hour of the day.
- Show crowding labels and a simple suggestion to travel later when the selected hour is busy.
- Convert monthly CSVs into a compressed JSON cache for API queries.
- Index the cache by month, route, stop, day type, and hour in memory.

The live API uses historical averages, not a trained prediction model. Each hourly boarding total is divided by the number of calendar days in its month and rounded. The resulting daily average is assigned a label:

| Average boardings | Display label |
| ---: | --- |
| 0–20 | 여유 (Low) |
| 21–50 | 보통 (Moderate) |
| 51–80 | 혼잡 (Busy) |
| 81+ | 매우 혼잡 (Very busy) |

These figures describe boardings at a stop, not real-time occupancy inside one bus. The later-travel suggestion is a rule, not a comparison proving that the next hour is less crowded.

## Tech Stack

| Layer | Technologies | Purpose |
| --- | --- | --- |
| Data preparation | Python standard library | CSV decoding, monthly averages, and gzip cache generation |
| API | Node.js, Express | Cache lookup and crowding labels |
| UI | React, Vite, Recharts, styled-components | Route/stop selection and hourly charts |
| Tests | Node.js test runner | Crowding thresholds and recommendation text |

## Architecture

```text
Monthly Seoul CSVs → Python cache builder → gzip JSON cache
                                                 ↓
                                         Express memory indexes
                                                 ↓
                                        React charts and guidance
```

The default cache contains the latest available CSV month. Express loads it once into memory and uses indexed lookups for API requests; the deployed request path does not run Python or query a live public API.

Code entry points:

- [CSV processing and cache generation](backend/model/build_bus_api_cache.py)
- [API routes, memory indexes, and crowding rules](backend/routes/bus.js)
- [Bus explorer screen](frontend/src/pages/BusCrowdingPage.jsx)

## Getting Started

Use Node.js 22.12+ and Python 3.10+ with `python` available on your PATH.

```bash
npm ci --prefix backend
npm ci --prefix frontend
```

A compressed cache is checked in. To regenerate it from the latest CSV:

```bash
npm run build:cache
```

Start the API and frontend in separate terminals, both from the repository root:

```bash
# Terminal 1
npm run server

# Terminal 2
npm run dev
```

The API defaults to `http://localhost:4000` and the UI to `http://localhost:5173`. Vite proxies `/api` requests to the backend.

## Checks

```bash
npm test
npm run build
```

The tests cover crowding thresholds and recommendation text. They do not validate the accuracy of the underlying public data or train a model.

## Deployment and Data Scope

The Vercel configuration defines separate React and Express services and routes `/api/*` to the backend. The deployment includes `backend/model/bus_api_cache.json.gz` and excludes the raw CSVs. Express prefers the gzip cache and can fall back to an uncompressed JSON cache locally.

The `csv/` directory contains monthly source files from June 2025 through May 2026. To rebuild the cache with every available month:

```bash
npm run build:cache:all
```

The entire expanded cache is loaded into memory, so including more months increases startup work and memory use. Source CSVs remain in the repository for reproducibility; older generated assets also remain in Git history.

Selected API routes:

```text
GET /health
GET /api/bus/options
GET /api/bus/stations?route=0017&month=202605
GET /api/bus/hourly?route=0017&station=남이장군사당(00017)&month=202605
GET /api/bus/predict?route=0017&station=남이장군사당(00017)&month=202605&hour=8
```

The `/predict` route name is retained from the existing API; its current result comes from cached averages and threshold rules.

## Separate Modeling Experiment

`backend/model/preprocess.py`, `train_model.py`, and `predict.py` contain a separate Random Forest experiment. They are not called by the current Express request path and are not required to run the service.

To reproduce the experiment:

```bash
python -m pip install -r backend/model/requirements.txt
npm run train
```

The scripts default to the latest CSV filename; set `BUS_DATA_PATH` to select another file. Generated `.pkl` artifacts are not included in the current checkout.

## Screenshots

![타도될까 route and stop selection screen](docs/preview.png)

## Limitations

- Labels are based on historical average boardings, not real-time vehicle occupancy.
- Weekday and weekend selections fall back to the same `all` data in the current cache.
- Bus frequency, vehicle capacity, events, and weather are not included.
- The service's data freshness depends on the checked-in CSVs and cache rebuilds.

## Links

[Demo](https://transport-service-omega.vercel.app/) · [Portfolio](https://sooyeon-developer-portfolio.vercel.app/)
