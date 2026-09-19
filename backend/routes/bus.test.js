import assert from 'node:assert/strict';
import test from 'node:test';

import { labelCrowding, recommendation } from './bus.js';

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
