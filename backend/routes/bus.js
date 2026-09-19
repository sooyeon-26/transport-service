import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MODEL_DIR = path.resolve(__dirname, '../model');
const API_CACHE_PATH = path.join(MODEL_DIR, 'bus_api_cache.json');
const API_CACHE_GZIP_PATH = path.join(MODEL_DIR, 'bus_api_cache.json.gz');
let cache = null;
const FALLBACK_DAY_TYPES = ['all', 'weekday', 'weekend'];

export function labelCrowding(passengers) {
  if (passengers <= 20) return '여유';
  if (passengers <= 50) return '보통';
  if (passengers <= 80) return '혼잡';
  return '매우 혼잡';
}

export function recommendation(label, hour) {
  if (label === '혼잡' || label === '매우 혼잡') {
    return `${Number(hour)}시는 혼잡도가 높습니다. 가능하면 ${Math.min(Number(hour) + 1, 23)}시 이후 이용을 추천합니다.`;
  }
  if (label === '보통') {
    return `${Number(hour)}시는 보통 수준입니다. 여유로운 이동을 원하면 피크 시간대를 피해 주세요.`;
  }
  return `${Number(hour)}시는 비교적 여유롭습니다. 현재 시간대 이용을 추천합니다.`;
}

function getCache() {
  if (!cache) {
    const cacheContents = fs.existsSync(API_CACHE_GZIP_PATH)
      ? gunzipSync(fs.readFileSync(API_CACHE_GZIP_PATH)).toString('utf-8')
      : fs.readFileSync(API_CACHE_PATH, 'utf-8');
    const payload = JSON.parse(cacheContents);
    const byKey = new Map();
    const byRouteStationDay = new Map();
    const defaultMonth = payload.defaultMonth || payload.months?.at?.(-1)?.value || 'default';

    for (const [groupKey, points] of Object.entries(payload.series)) {
      const parts = groupKey.split('|||');
      const [month, route, station, dayType] = parts.length === 4 ? parts : [defaultMonth, ...parts];
      const rows = points.map(([hour, passengers, alightPassengers, crowding]) => ({
        month,
        route,
        station,
        dayType,
        hour,
        passengers,
        alightPassengers,
        crowding
      }));
      const normalizedGroupKey = `${month}|||${route}|||${station}|||${dayType}`;
      byRouteStationDay.set(normalizedGroupKey, rows);
      for (const row of rows) {
        byKey.set(`${normalizedGroupKey}|||${row.hour}`, row);
      }
    }

    cache = {
      byRouteStationDay,
      byKey,
      months: payload.months || [],
      defaultMonth,
      routes: payload.routes,
      routeStations: payload.routeStations,
      monthRouteStations: payload.monthRouteStations || {},
      dayTypes: payload.dayTypes,
      hours: payload.hours
    };
  }
  return cache;
}

function resolveMonth(month) {
  const data = getCache();
  const monthValue = String(month || data.defaultMonth || '');
  const knownMonths = new Set((data.months || []).map((item) => String(item.value)));
  if (!knownMonths.size || knownMonths.has(monthValue)) return monthValue;
  return data.defaultMonth || monthValue;
}

function findRows(month, route, station, dayType) {
  const data = getCache();
  const selectedMonth = resolveMonth(month);
  return (
    data.byRouteStationDay.get(`${selectedMonth}|||${route}|||${station}|||${dayType}`) ||
    data.byRouteStationDay.get(`${selectedMonth}|||${route}|||${station}|||all`) ||
    []
  );
}

router.get('/predict', async (req, res) => {
  const { route, station, hour, dayType = 'all', month } = req.query;

  if (!route || !station || hour === undefined) {
    res.status(400).json({ error: 'route, station, hour는 필수입니다.' });
    return;
  }

  try {
    const data = getCache();
    const selectedMonth = resolveMonth(month);
    const key = `${selectedMonth}|||${String(route)}|||${String(station)}|||${String(dayType)}|||${Number(hour)}`;
    const fallbackKey = `${selectedMonth}|||${String(route)}|||${String(station)}|||all|||${Number(hour)}`;
    const row = data.byKey.get(key) || data.byKey.get(fallbackKey);
    const expectedPassengers = row?.passengers || 0;
    const predictedCrowding = labelCrowding(expectedPassengers);
    res.json({
      route: String(route),
      station: String(station),
      month: selectedMonth,
      hour: Number(hour),
      dayType: String(dayType),
      predictedCrowding,
      expectedPassengers,
      recommendation: recommendation(predictedCrowding, hour)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/hourly', async (req, res) => {
  const { route, station, dayType = 'all', month } = req.query;

  if (!route || !station) {
    res.status(400).json({ error: 'route, station은 필수입니다.' });
    return;
  }

  try {
    const rows = findRows(month, String(route), String(station), String(dayType))
      .sort((a, b) => a.hour - b.hour)
      .map((row) => ({ hour: row.hour, passengers: row.passengers, crowding: row.crowding }));
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/options', async (_req, res) => {
  try {
    const data = getCache();
    const dayTypes = Array.from(new Set([...(data.dayTypes || []), ...FALLBACK_DAY_TYPES]));
    res.json({ routes: data.routes, months: data.months, defaultMonth: data.defaultMonth, dayTypes, hours: data.hours });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stations', async (req, res) => {
  const { route, month } = req.query;
  if (!route) {
    res.status(400).json({ error: 'route는 필수입니다.' });
    return;
  }

  try {
    const data = getCache();
    const selectedMonth = resolveMonth(month);
    const monthlyStations = data.monthRouteStations?.[selectedMonth]?.[String(route)];
    res.json({ route: String(route), month: selectedMonth, stations: monthlyStations || data.routeStations[String(route)] || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
