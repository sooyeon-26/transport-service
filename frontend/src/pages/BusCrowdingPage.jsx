import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Database, MapPinned } from 'lucide-react';
import { fetchHourly, fetchOptions, fetchPrediction } from '../api/busApi.js';
import BusSearchBox from '../components/BusSearchBox.jsx';
import CrowdingChart from '../components/CrowdingChart.jsx';
import CrowdingResult from '../components/CrowdingResult.jsx';

const Shell = styled.main`
  min-height: 100vh;
  background: #eef4f8;
  color: #172634;
`;

const HeaderBand = styled.header`
  background: #12344d;
  color: white;
  border-bottom: 4px solid #2cae74;
`;

const HeaderInner = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  padding: 28px 20px 32px;
`;

const Kicker = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #b7d7e9;
  font-size: 13px;
  font-weight: 800;
`;

const Title = styled.h1`
  margin: 10px 0 8px;
  font-size: clamp(28px, 4vw, 42px);
  line-height: 1.18;
  letter-spacing: 0;
`;

const Summary = styled.p`
  max-width: 760px;
  margin: 0;
  color: #d9e8f2;
  line-height: 1.65;
`;

const Content = styled.div`
  max-width: 1180px;
  margin: -18px auto 0;
  padding: 0 20px 44px;
  display: grid;
  gap: 16px;
`;

const StatusLine = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  color: #4d6072;
  font-size: 13px;
`;

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 1px solid #cbd8e3;
  border-radius: 999px;
  background: #ffffff;
  padding: 8px 11px;
  font-weight: 800;
`;

const ErrorBox = styled.div`
  border: 1px solid #efb1aa;
  border-radius: 8px;
  background: #fff4f2;
  color: #9e2d26;
  padding: 12px 14px;
  font-weight: 700;
`;

const defaultForm = {
  route: '143',
  station: '강남역',
  dayType: 'all',
  hour: '8'
};

const dayTypeLabel = {
  all: '월 전체',
  weekday: '평일',
  weekend: '주말'
};

function BusCrowdingPage() {
  const [form, setForm] = useState(defaultForm);
  const [options, setOptions] = useState({ routes: [], stations: [], routeStations: {}, hours: [] });
  const [result, setResult] = useState(null);
  const [hourly, setHourly] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const topHours = useMemo(
    () => [...hourly].sort((a, b) => b.passengers - a.passengers).slice(0, 3),
    [hourly]
  );

  const runSearch = async (event) => {
    event?.preventDefault();
    setLoading(true);
    setError('');

    try {
      const params = {
        route: form.route.trim(),
        station: form.station.trim(),
        hour: form.hour,
        dayType: form.dayType
      };
      const [predictionData, hourlyData] = await Promise.all([
        fetchPrediction(params),
        fetchHourly({ route: params.route, station: params.station, dayType: params.dayType })
      ]);
      setResult(predictionData);
      setHourly(hourlyData);
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || '예측 요청에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions()
      .then((data) => {
        setOptions(data);
        const firstRoute = data.routes?.[0] || defaultForm.route;
        const firstStation = data.routeStations?.[firstRoute]?.[0] || data.stations?.[0] || defaultForm.station;
        setForm((current) => ({
          ...current,
          ...(() => {
            const nextRoute = data.routes?.includes(current.route) ? current.route : firstRoute;
            const nextStations = data.routeStations?.[nextRoute] || [];
            const nextDayType = data.dayTypes?.includes(current.dayType)
              ? current.dayType
              : data.dayTypes?.[0] || defaultForm.dayType;
            return {
              route: nextRoute,
              station: nextStations.includes(current.station) ? current.station : firstStation,
              dayType: nextDayType
            };
          })()
        }));
      })
      .catch(() => setOptions({ routes: [], stations: [], routeStations: {}, hours: [] }));
  }, []);

  useEffect(() => {
    runSearch();
    // 첫 로딩에서 샘플 조건을 자동 조회합니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Shell>
      <HeaderBand>
        <HeaderInner>
          <Kicker>
            <Database size={17} aria-hidden="true" />
            서울시 공공데이터 기반 MVP
          </Kicker>
          <Title>공공데이터 기반 시간대별 버스 혼잡도 예측 서비스</Title>
          <Summary>
            노선번호, 정류장, 요일, 시간대를 선택하면 과거 승하차 패턴을 기반으로 예상 승차 인원과 혼잡도를 보여줍니다.
          </Summary>
        </HeaderInner>
      </HeaderBand>

      <Content>
        <BusSearchBox form={form} setForm={setForm} onSubmit={runSearch} loading={loading} options={options} />

        <StatusLine>
          <Pill>
            <MapPinned size={15} aria-hidden="true" />
            {form.route} · {form.station}
          </Pill>
          <Pill>{dayTypeLabel[form.dayType] || form.dayType} {form.hour}시 기준</Pill>
          <Pill>RandomForestClassifier</Pill>
        </StatusLine>

        {error && <ErrorBox>{error}</ErrorBox>}

        <CrowdingResult result={result} topHours={topHours} />
        <CrowdingChart data={hourly} />
      </Content>
    </Shell>
  );
}

export default BusCrowdingPage;
