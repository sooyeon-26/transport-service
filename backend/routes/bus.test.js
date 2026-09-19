import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

import { labelCrowding, recommendation } from './bus.js';
import { popularRoutes } from '../../frontend/src/pages/popularRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('승차 인원 구간에 따라 혼잡도를 분류한다', () => {
  assert.equal(labelCrowding(20), '여유');
  assert.equal(labelCrowding(21), '보통');
  assert.equal(labelCrowding(51), '혼잡');
  assert.equal(labelCrowding(81), '매우 혼잡');
});

test('23시 혼잡 안내는 다음 시간을 23시로 제한한다', () => {
  assert.match(recommendation('매우 혼잡', 23), /23시 이후/);
});

test('여유 시간대에는 현재 시간 이용을 안내한다', () => {
  assert.match(recommendation('여유', 9), /현재 시간대 이용/);
});

test('인기 노선 예시는 기본 월 캐시에 실제로 존재하는 정류장을 사용한다', () => {
  const cachePath = path.resolve(__dirname, '../model/bus_api_cache.json.gz');
  const payload = JSON.parse(gunzipSync(fs.readFileSync(cachePath)).toString('utf-8'));
  const monthStations = payload.monthRouteStations[payload.defaultMonth];

  for (const example of popularRoutes) {
    assert.equal(monthStations[example.route]?.includes(example.station), true, `${example.route} ${example.station}`);
  }
});
