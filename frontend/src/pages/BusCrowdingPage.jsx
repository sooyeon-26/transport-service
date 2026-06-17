import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { MapPinned, Navigation, Route } from 'lucide-react';
import { fetchHourly, fetchOptions, fetchStations } from '../api/busApi.js';
import BusSearchBox from '../components/BusSearchBox.jsx';
import CrowdingChart from '../components/CrowdingChart.jsx';
import CrowdingResult from '../components/CrowdingResult.jsx';

const Shell = styled.main`
  min-height: 100vh;
  background:
    radial-gradient(circle at 18% 12%, rgba(255, 255, 255, 0.64), transparent 34%),
    radial-gradient(circle at 84% 16%, rgba(219, 240, 255, 0.48), transparent 32%),
    linear-gradient(135deg, ${({ $tone }) => $tone?.overlayStart || 'rgba(251, 248, 255, 0.72)'}, ${({ $tone }) => $tone?.overlayMid || 'rgba(228, 246, 255, 0.62)'} 48%, ${({ $tone }) => $tone?.overlayEnd || 'rgba(247, 242, 255, 0.74)'}),
    url(${({ $background }) => $background});
  background-size: cover;
  background-position: ${({ $position }) => $position};
  background-attachment: fixed;
  color: #27253d;
  transition: background-position 500ms ease, background-image 500ms ease;
`;

const Content = styled.div`
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px;

  @media (max-width: 720px) {
    padding: 12px;
  }
`;

const IntroLayer = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: start center;
  padding: clamp(36px, 7vh, 60px) 24px 32px;

  @media (max-width: 720px) {
    padding: 18px 12px;
  }
`;

const IntroCard = styled.section`
  width: min(1040px, 100%);
  display: grid;
  grid-template-columns: minmax(0, 1fr) 310px;
  gap: 18px 22px;
  border: 1px solid rgba(255, 255, 255, 0.94);
  border-radius: 8px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.985), rgba(248, 251, 255, 0.94)),
    rgba(255, 255, 255, 0.96);
  padding: 26px;
  box-shadow: 0 54px 150px rgba(45, 54, 82, 0.35);
  backdrop-filter: blur(28px);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const IntroMain = styled.div`
  min-width: 0;
  align-self: center;
`;

const IntroEyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 1px solid rgba(218, 224, 241, 0.9);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  color: #464b65;
  padding: 8px 11px;
  font-size: 12px;
  font-weight: 900;
`;

const IntroTitle = styled.h1`
  max-width: 680px;
  margin: 18px 0 10px;
  color: #27253d;
  font-size: clamp(36px, 5.2vw, 62px);
  line-height: 1.05;
  letter-spacing: 0;
`;

const IntroCopy = styled.p`
  max-width: 560px;
  margin: 0;
  color: #414c68;
  line-height: 1.6;
`;

const IntroFormWrap = styled.div`
  grid-column: 1 / -1;
  margin-top: 0;
  border: 1px solid rgba(218, 224, 241, 0.86);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
  padding: 14px;
  box-shadow: 0 16px 38px rgba(45, 54, 82, 0.1);
`;

const IntroPreview = styled.aside`
  min-height: 190px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(218, 224, 241, 0.64);
  border-radius: 8px;
  background:
    radial-gradient(circle at 72% 18%, rgba(143, 216, 255, 0.24), transparent 32%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.6), rgba(237, 248, 255, 0.68));
  opacity: 0.82;
  padding: 16px;
  display: grid;
  align-content: space-between;

  @media (max-width: 900px) {
    display: none;
  }
`;

const PreviewMap = styled.div`
  position: absolute;
  inset: 0;
  opacity: 0.56;

  svg {
    width: 100%;
    height: 100%;
    display: block;
  }
`;

const PreviewContent = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  gap: 10px;
`;

const PreviewChip = styled.span`
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 1px solid rgba(218, 224, 241, 0.9);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.76);
  color: #464b65;
  padding: 8px 11px;
  font-size: 12px;
  font-weight: 900;
`;

const PreviewTitle = styled.strong`
  color: #27253d;
  font-size: 28px;
  line-height: 1.1;
`;

const PreviewResult = styled.div`
  position: relative;
  z-index: 1;
  border: 1px solid rgba(143, 216, 255, 0.44);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.6);
  padding: 12px;
`;

const PreviewResultMeta = styled.div`
  color: #2878d8;
  font-size: 12px;
  font-weight: 950;
`;

const PreviewResultText = styled.div`
  margin-top: 6px;
  color: #27253d;
  font-size: 19px;
  font-weight: 950;
`;

const PreviewResultSub = styled.div`
  margin-top: 4px;
  color: #59627f;
  font-size: 13px;
  font-weight: 800;
`;

const DashboardFrame = styled.div`
  display: grid;
  gap: 12px;
  min-height: calc(100vh - 48px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.48);
  padding: 12px;
  box-shadow: 0 34px 100px rgba(45, 54, 82, 0.22);
  backdrop-filter: blur(26px);

  @media (max-width: 720px) {
    min-height: auto;
    padding: 10px;
  }
`;

const ControlDeck = styled.section`
  position: relative;
  z-index: 30;
  display: grid;
  grid-template-columns: minmax(260px, 0.45fr) minmax(0, 1fr);
  gap: 18px;
  align-items: end;
  border: 1px solid rgba(255, 255, 255, 0.76);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.86);
  padding: 16px;
  box-shadow: 0 18px 48px rgba(45, 54, 82, 0.12);
  backdrop-filter: blur(22px);

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const LocationPlate = styled.article`
  min-height: 94px;
  border: 1px solid rgba(218, 224, 241, 0.76);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  display: grid;
  align-content: end;
  padding: 16px;
  color: #27253d;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.68), rgba(239, 247, 255, 0.56)),
    linear-gradient(150deg, #f8fbff 0%, #eef7ff 46%, #f8f4ff 100%);
  box-shadow: none;
  backdrop-filter: none;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.82));
    pointer-events: none;
  }
`;

const SeoulMap = styled.div`
  position: absolute;
  inset: 0;
  color: #9ba8c5;
  opacity: 0.95;

  svg {
    width: 100%;
    height: 100%;
    display: block;
  }
`;

const MapMarker = styled.div`
  position: absolute;
  left: ${({ $x }) => $x}%;
  top: ${({ $y }) => $y}%;
  width: 18px;
  height: 18px;
  border: 4px solid white;
  border-radius: 999px;
  background: #2f8df4;
  box-shadow: 0 10px 28px rgba(47, 141, 244, 0.42);
  transform: translate(-50%, -50%);
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    inset: -12px;
    border-radius: inherit;
    background: rgba(47, 141, 244, 0.16);
  }
`;

const LocationContent = styled.div`
  position: relative;
  z-index: 2;
`;

const StationMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
`;

const MetaChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid rgba(218, 224, 241, 0.9);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  padding: 7px 10px;
  color: #464b65;
  font-size: 12px;
  font-weight: 900;
  backdrop-filter: blur(8px);
`;

const StationTitle = styled.h2`
  margin: 0;
  font-size: clamp(22px, 2.5vw, 32px);
  line-height: 1.12;
  letter-spacing: 0;
`;

const SearchPlate = styled.div`
  position: relative;
  z-index: 40;
  align-self: stretch;
  display: grid;
`;

const ErrorBox = styled.div`
  border: 1px solid #efb1aa;
  border-radius: 8px;
  background: #fff4f2;
  color: #9e2d26;
  padding: 12px 14px;
  font-weight: 700;
`;

const TimeExplorePanel = styled.section`
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.88);
  padding: 18px;
  box-shadow: 0 18px 48px rgba(45, 54, 82, 0.12);
  backdrop-filter: blur(20px);
`;

const TimelineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;

  @media (max-width: 640px) {
    display: grid;
  }
`;

const SectionTitle = styled.h2`
  margin: 0;
  color: #27253d;
  font-size: 17px;
`;

const SelectedTime = styled.strong`
  display: inline-flex;
  align-items: center;
  min-width: 64px;
  justify-content: center;
  border-radius: 999px;
  background: #edf8ff;
  color: #1f72d8;
  padding: 8px 12px;
  font-size: 16px;
  font-weight: 950;
`;

const Slider = styled.input.attrs({ type: 'range' })`
  --track-height: 8px;
  --thumb-size: 22px;
  width: 100%;
  height: var(--thumb-size);
  appearance: none;
  background: transparent;
  accent-color: #2f8df4;
  cursor: pointer;

  &::-webkit-slider-runnable-track {
    height: var(--track-height);
    border-radius: 999px;
    background: linear-gradient(90deg, #dff4ff 0%, #8fd8ff 38%, #2f8df4 68%, #252943 100%);
  }

  &::-webkit-slider-thumb {
    appearance: none;
    width: var(--thumb-size);
    height: var(--thumb-size);
    margin-top: calc((var(--track-height) - var(--thumb-size)) / 2);
    border: 4px solid white;
    border-radius: 50%;
    background: #2f8df4;
    box-shadow: 0 7px 18px rgba(47, 141, 244, 0.34);
  }

  &::-moz-range-track {
    height: var(--track-height);
    border-radius: 999px;
    background: linear-gradient(90deg, #dff4ff 0%, #8fd8ff 38%, #2f8df4 68%, #252943 100%);
  }

  &::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border: 4px solid white;
    border-radius: 50%;
    background: #2f8df4;
    box-shadow: 0 7px 18px rgba(47, 141, 244, 0.34);
  }
`;

const RhythmPanel = styled.section`
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.88);
  padding: 18px;
  box-shadow: 0 18px 48px rgba(45, 54, 82, 0.12);
  backdrop-filter: blur(20px);
`;

const RhythmHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 14px;

  @media (max-width: 640px) {
    display: grid;
  }
`;

const RhythmNote = styled.p`
  margin: 4px 0 0;
  color: #69718d;
  font-size: 13px;
`;

const RhythmScroll = styled.div`
  overflow-x: auto;
`;

const TimeStrip = styled.div`
  min-width: 760px;
  display: grid;
  grid-template-columns: repeat(24, minmax(24px, 1fr));
  gap: 5px;
  align-items: end;
`;

const TimeStripButton = styled.button`
  display: grid;
  grid-template-rows: 52px auto;
  gap: 7px;
  min-width: 0;
  min-height: 82px;
  border: 1px solid ${({ $active }) => ($active ? '#2f8df4' : 'transparent')};
  border-radius: 8px;
  background: ${({ $active }) => ($active ? '#ffffff' : 'transparent')};
  color: #27253d;
  padding: 6px 3px;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  box-shadow: ${({ $active }) => ($active ? '0 12px 26px rgba(47, 141, 244, 0.18)' : 'none')};
  opacity: ${({ disabled }) => (disabled ? 0.48 : 1)};
`;

const DensityTrack = styled.span`
  display: grid;
  align-items: end;
  height: 52px;
  border-radius: 999px;
  background: rgba(234, 239, 250, 0.9);
  overflow: hidden;
`;

const DensityFill = styled.span`
  display: block;
  min-height: 8px;
  height: ${({ $height }) => $height}%;
  border-radius: 999px;
  background: ${({ $level }) => {
    if ($level === '매우 혼잡') return '#7b6cf6';
    if ($level === '혼잡') return '#ffae73';
    if ($level === '보통') return '#7fc8ff';
    if ($level === '여유') return '#bff3de';
    return '#dae0f1';
  }};
`;

const HourLabel = styled.span`
  color: #464b65;
  font-size: 11px;
  font-weight: 900;
  text-align: center;
`;

const ExploreGrid = styled.section`
  position: relative;
  z-index: 1;
  display: grid;
  gap: 12px;
`;

const defaultForm = {
  route: '143',
  station: '',
  hour: String(new Date().getHours())
};

const stationGeoMap = {
  강남역: { lat: 37.4979, lng: 127.0276 },
  홍대입구: { lat: 37.5572, lng: 126.9245 },
  시청역: { lat: 37.5657, lng: 126.9769 },
  개포도서관: { lat: 37.4838, lng: 127.0634 }
};

const seoulBounds = {
  minLat: 37.42,
  maxLat: 37.7,
  minLng: 126.76,
  maxLng: 127.18
};

const timeToneMap = {
  morning: {
    background: '/images/stations/time-morning.png',
    overlayStart: 'rgba(255, 250, 242, 0.68)',
    overlayMid: 'rgba(224, 244, 255, 0.56)',
    overlayEnd: 'rgba(247, 242, 255, 0.68)'
  },
  day: {
    background: '/images/stations/time-day.png',
    overlayStart: 'rgba(249, 252, 255, 0.7)',
    overlayMid: 'rgba(222, 245, 255, 0.58)',
    overlayEnd: 'rgba(246, 248, 255, 0.7)'
  },
  evening: {
    background: '/images/stations/time-evening.png',
    overlayStart: 'rgba(255, 246, 238, 0.64)',
    overlayMid: 'rgba(232, 243, 255, 0.58)',
    overlayEnd: 'rgba(255, 239, 229, 0.68)'
  },
  night: {
    background: '/images/stations/time-night.png',
    overlayStart: 'rgba(244, 246, 255, 0.62)',
    overlayMid: 'rgba(220, 232, 255, 0.54)',
    overlayEnd: 'rgba(238, 234, 255, 0.66)'
  }
};

function labelCrowding(passengers) {
  if (passengers <= 20) return '여유';
  if (passengers <= 50) return '보통';
  if (passengers <= 80) return '혼잡';
  return '매우 혼잡';
}

function getStationLabel(station) {
  return String(station || '').replace(/\(\d+\)/, '').trim();
}

function getTimePeriod(hour) {
  const numericHour = Number(hour);
  if (numericHour >= 5 && numericHour < 11) return 'morning';
  if (numericHour >= 11 && numericHour < 17) return 'day';
  if (numericHour >= 17 && numericHour < 21) return 'evening';
  return 'night';
}

function getStationVisual(station, hour) {
  const seed = [...String(station || 'station')].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const x = 30 + ((seed + Number(hour) * 7) % 36);
  const y = 36 + (Number(hour) % 18);
  const tone = timeToneMap[getTimePeriod(hour)];

  return {
    background: tone.background,
    position: `${x}% ${y}%`,
    tone
  };
}

function getStationMapPosition(station) {
  const key = Object.keys(stationGeoMap).find((name) => station?.includes(name));
  if (key) {
    const { lat, lng } = stationGeoMap[key];
    return {
      x: ((lng - seoulBounds.minLng) / (seoulBounds.maxLng - seoulBounds.minLng)) * 100,
      y: ((seoulBounds.maxLat - lat) / (seoulBounds.maxLat - seoulBounds.minLat)) * 100
    };
  }

  const seed = [...String(station || 'station')].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return {
    x: 28 + (seed % 44),
    y: 24 + ((seed * 7) % 48)
  };
}

function buildRecommendation({ row, hourly, route }) {
  if (!row) return null;

  const bestRows = [...hourly].sort((a, b) => a.passengers - b.passengers);
  const best = bestRows[0];
  const next = hourly.find((item) => item.hour > row.hour);
  const betterLater = hourly.find((item) => item.hour > row.hour && item.passengers < row.passengers);
  const predictedCrowding = row.crowding || labelCrowding(row.passengers);

  let action = '지금 이용을 추천합니다.';
  let mood = '앉아서 갈 가능성이 높아요.';
  if (predictedCrowding === '보통') {
    action = '조금 더 여유로운 시간도 함께 확인해보세요.';
    mood = '서서 갈 수도 있어요.';
  }
  if (predictedCrowding === '혼잡' || predictedCrowding === '매우 혼잡') {
    action = betterLater ? `${betterLater.hour}시 이후가 더 여유로울 가능성이 높아요.` : '가능하다면 다른 시간대를 확인해보세요.';
    mood = '많이 붐빌 가능성이 높아요.';
  }

  const waitInsight = next
    ? `${next.hour}시는 ${next.passengers}명으로 ${next.passengers < row.passengers ? '조금 더 여유로워요.' : next.passengers === row.passengers ? '비슷해요.' : '더 붐빌 수 있어요.'}`
    : '이후 시간대 데이터가 없습니다.';

  return {
    route,
    hour: row.hour,
    expectedPassengers: row.passengers,
    predictedCrowding,
    recommendation: action,
    mood,
    waitInsight,
    bestHour: best,
    betterLater
  };
}

function BusCrowdingPage() {
  const [form, setForm] = useState(defaultForm);
  const [options, setOptions] = useState({ routes: [], stations: [], hours: [] });
  const [hourly, setHourly] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [error, setError] = useState('');

  const peakHours = useMemo(
    () => [...hourly].sort((a, b) => b.passengers - a.passengers).slice(0, 3),
    [hourly]
  );
  const quietHours = useMemo(
    () => [...hourly].sort((a, b) => a.passengers - b.passengers).slice(0, 3),
    [hourly]
  );
  const selectedRow = useMemo(
    () => hourly.find((item) => Number(item.hour) === Number(form.hour)),
    [form.hour, hourly]
  );
  const result = useMemo(
    () => buildRecommendation({ row: selectedRow, hourly, route: form.route }),
    [form.route, hourly, selectedRow]
  );
  const stationVisual = useMemo(
    () => getStationVisual(form.station, form.hour),
    [form.hour, form.station]
  );
  const stationMapPosition = useMemo(
    () => getStationMapPosition(form.station),
    [form.station]
  );
  const maxPassengers = useMemo(
    () => Math.max(1, ...hourly.map((item) => item.passengers || 0)),
    [hourly]
  );
  const introStationLabel = useMemo(
    () => getStationLabel(form.station) || '정류장을 선택해주세요',
    [form.station]
  );
  const introPreviewStatus = result
    ? {
        meta: `${result.hour}:00 기준 · ${result.predictedCrowding}`,
        text: `예상 ${result.expectedPassengers}명`,
        sub: result.recommendation
      }
    : {
        meta: `${form.hour || new Date().getHours()}:00 기준`,
        text: form.station ? '현재 시간 기준으로 확인' : '정류장 선택 대기',
        sub: form.station ? '혼잡도 확인하기를 눌러 예측해보세요.' : '노선과 정류장을 먼저 골라주세요.'
      };

  const runSearch = async (event, overrideForm) => {
    event?.preventDefault();
    const searchForm = overrideForm || form;
    if (!searchForm.route || !searchForm.station) {
      setHourly([]);
      return false;
    }

    setLoading(true);
    setError('');

    try {
      const params = {
        route: searchForm.route.trim(),
        station: searchForm.station.trim(),
        hour: searchForm.hour
      };
      const hourlyData = await fetchHourly({ route: params.route, station: params.station, dayType: 'all' });
      setHourly(hourlyData);
      return true;
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || '예측 요청에 실패했습니다.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const startExperience = async (event) => {
    const ok = await runSearch(event);
    if (ok) setHasStarted(true);
  };

  useEffect(() => {
    let ignore = false;

    async function initialize() {
      try {
        const data = await fetchOptions();
        if (ignore) return;

        const firstRoute = data.routes?.includes(defaultForm.route) ? defaultForm.route : data.routes?.[0] || '';
        const stationData = firstRoute ? await fetchStations(firstRoute) : { stations: [] };
        if (ignore) return;

        const firstStation = stationData.stations?.[0] || '';
        const nextForm = {
          route: firstRoute,
          station: firstStation,
          hour: data.hours?.includes(new Date().getHours()) ? String(new Date().getHours()) : String(data.hours?.[0] || 8)
        };

        setOptions({ ...data, stations: stationData.stations || [] });
        setForm(nextForm);
      } catch (requestError) {
        if (!ignore) {
          setOptions({ routes: [], stations: [], hours: [] });
          setError(requestError.response?.data?.error || requestError.message || '초기 데이터를 불러오지 못했습니다.');
        }
      }
    }

    initialize();
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!form.route) return;
    if (options.routes?.length && !options.routes.includes(form.route)) {
      setOptions((current) => ({ ...current, stations: [] }));
      setForm((current) => (current.station ? { ...current, station: '' } : current));
      return;
    }

    let ignore = false;

    async function loadStationsForRoute() {
      try {
        const stationData = await fetchStations(form.route);
        if (ignore) return;
        const stations = stationData.stations || [];
        setOptions((current) => ({ ...current, stations }));
        setForm((current) => {
          if (current.route !== form.route || stations.includes(current.station)) return current;
          return { ...current, station: stations[0] || '' };
        });
      } catch (requestError) {
        if (!ignore) setError(requestError.response?.data?.error || requestError.message || '정류장 목록을 불러오지 못했습니다.');
      }
    }

    loadStationsForRoute();
    return () => {
      ignore = true;
    };
  }, [form.route, options.routes]);

  return (
    <Shell $background={stationVisual.background} $position={stationVisual.position} $tone={stationVisual.tone}>
      {!hasStarted ? (
        <IntroLayer>
          <IntroCard>
            <IntroMain>
              <IntroEyebrow>
                <MapPinned size={14} aria-hidden="true" />
                서울시 공공데이터 기반
              </IntroEyebrow>
              <IntroTitle>지금 타도 괜찮을까요?</IntroTitle>
              <IntroCopy>노선과 정류장을 고르면 현재 시간 기준 혼잡도를 바로 확인할 수 있어요.</IntroCopy>
            </IntroMain>
            <IntroPreview aria-hidden="true">
              <PreviewMap>
                <svg viewBox="0 0 320 220" preserveAspectRatio="none">
                  <path
                    d="M44 58 C81 32 126 44 159 61 C198 81 232 44 277 58 C301 66 311 98 291 124 C266 157 220 151 183 163 C139 177 84 162 48 132 C22 110 19 76 44 58 Z"
                    fill="rgba(255,255,255,0.66)"
                    stroke="rgba(151,164,194,0.42)"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M2 137 C53 112 91 146 139 127 C184 109 217 105 261 124 C288 136 307 128 322 114"
                    fill="none"
                    stroke="rgba(127,200,255,0.72)"
                    strokeWidth="15"
                    strokeLinecap="round"
                  />
                  <path d="M66 48 L88 172 M137 54 L124 180 M209 48 L231 174" stroke="rgba(151,164,194,0.22)" />
                  <circle cx="226" cy="121" r="10" fill="#2f8df4" stroke="white" strokeWidth="5" />
                </svg>
              </PreviewMap>
              <PreviewContent>
                <PreviewChip>
                  <Route size={14} aria-hidden="true" />
                  {form.route ? `${form.route}번` : '노선 선택'}
                </PreviewChip>
                <PreviewTitle>{introStationLabel}</PreviewTitle>
                <PreviewResult>
                  <PreviewResultMeta>{introPreviewStatus.meta}</PreviewResultMeta>
                  <PreviewResultText>{introPreviewStatus.text}</PreviewResultText>
                  <PreviewResultSub>{introPreviewStatus.sub}</PreviewResultSub>
                </PreviewResult>
              </PreviewContent>
            </IntroPreview>
            {error && <ErrorBox>{error}</ErrorBox>}
            <IntroFormWrap>
              <BusSearchBox
                form={form}
                setForm={setForm}
                onSubmit={startExperience}
                loading={loading}
                options={options}
                submitLabel="혼잡도 확인하기"
                variant="flat"
              />
            </IntroFormWrap>
          </IntroCard>
        </IntroLayer>
      ) : (
      <Content>
        <DashboardFrame>
          <ControlDeck>
            <LocationPlate>
              <SeoulMap aria-hidden="true">
                <svg viewBox="0 0 420 150" preserveAspectRatio="none">
                  <path
                    d="M58 28 C102 8 157 18 199 34 C251 54 300 16 358 28 C390 35 404 58 392 83 C379 112 330 125 281 119 C229 113 204 139 149 125 C92 111 44 96 34 68 C27 48 38 36 58 28 Z"
                    fill="rgba(255,255,255,0.58)"
                    stroke="rgba(151,164,194,0.42)"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M14 91 C80 74 120 108 180 92 C236 77 279 69 335 82 C371 90 397 85 418 73"
                    fill="none"
                    stroke="rgba(127,200,255,0.72)"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  <path
                    d="M14 91 C80 74 120 108 180 92 C236 77 279 69 335 82 C371 90 397 85 418 73"
                    fill="none"
                    stroke="rgba(255,255,255,0.72)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path d="M94 24 L128 124 M174 34 L153 128 M241 30 L268 121 M325 29 L301 122" stroke="rgba(151,164,194,0.22)" strokeWidth="1" />
                  <path d="M44 60 L376 46 M40 112 L366 105" stroke="rgba(151,164,194,0.2)" strokeWidth="1" />
                  <text x="38" y="37" fill="rgba(70,75,101,0.38)" fontSize="12" fontWeight="800">SEOUL</text>
                  <text x="292" y="77" fill="rgba(40,120,216,0.42)" fontSize="10" fontWeight="800">HAN RIVER</text>
                </svg>
              </SeoulMap>
              <MapMarker $x={stationMapPosition.x} $y={stationMapPosition.y} />
              <LocationContent>
                <StationMeta>
                  <MetaChip>
                    <MapPinned size={14} aria-hidden="true" />
                    {form.station || '정류장 선택'}
                  </MetaChip>
                  <MetaChip>
                    <Navigation size={14} aria-hidden="true" />
                    {form.route}번 · {form.hour}시
                  </MetaChip>
                </StationMeta>
                <StationTitle>{form.station || '정류장'}</StationTitle>
              </LocationContent>
            </LocationPlate>
            <SearchPlate>
              <BusSearchBox form={form} setForm={setForm} onSubmit={runSearch} loading={loading} options={options} variant="flat" />
            </SearchPlate>
          </ControlDeck>

          {error && <ErrorBox>{error}</ErrorBox>}

          <ExploreGrid>
            <CrowdingResult
              result={result}
              quietHours={quietHours}
              peakHours={peakHours}
              selectedHour={Number(form.hour)}
              onSelectHour={(hour) => setForm((current) => ({ ...current, hour: String(hour) }))}
            />

            <TimeExplorePanel>
              <TimelineHeader>
                <div>
                  <SectionTitle>시간대별 혼잡도 추이</SectionTitle>
                  <RhythmNote>슬라이더를 움직이거나 막대를 눌러 추천 기준을 바꿔보세요.</RhythmNote>
                </div>
                <SelectedTime>{form.hour}:00</SelectedTime>
              </TimelineHeader>
              <Slider
                min="0"
                max="23"
                step="1"
                value={form.hour}
                aria-label="탑승 시간 선택"
                onChange={(event) => setForm((current) => ({ ...current, hour: event.target.value }))}
              />
              <CrowdingChart
                data={hourly}
                selectedHour={Number(form.hour)}
                onSelectHour={(hour) => setForm((current) => ({ ...current, hour: String(hour) }))}
                embedded
              />
            </TimeExplorePanel>
          </ExploreGrid>

          <RhythmPanel>
            <RhythmHeader>
              <div>
                <SectionTitle>하루 시간대별 패턴</SectionTitle>
                <RhythmNote>색과 높이로 하루 전체 혼잡 흐름을 압축해서 보여줍니다.</RhythmNote>
              </div>
            </RhythmHeader>
            <RhythmScroll>
              <TimeStrip>
                {Array.from({ length: 24 }, (_, hour) => {
                  const cell = hourly.find((item) => Number(item.hour) === hour);
                  const active = Number(form.hour) === hour;
                  const height = cell ? Math.max(12, Math.round((cell.passengers / maxPassengers) * 100)) : 0;

                  return (
                    <TimeStripButton
                      key={hour}
                      type="button"
                      title={cell ? `${hour}시 / 예상 ${cell.passengers}명 / ${cell.crowding}` : `${hour}시 데이터 없음`}
                      $active={active}
                      $clickable={Boolean(cell)}
                      disabled={!cell}
                      onClick={() => {
                        if (!cell) return;
                        setForm((current) => ({ ...current, hour: String(hour) }));
                      }}
                    >
                      <DensityTrack>
                        <DensityFill $height={height} $level={cell?.crowding} />
                      </DensityTrack>
                      <HourLabel>{hour}</HourLabel>
                    </TimeStripButton>
                  );
                })}
              </TimeStrip>
            </RhythmScroll>
          </RhythmPanel>
        </DashboardFrame>
      </Content>
      )}
    </Shell>
  );
}

export default BusCrowdingPage;
