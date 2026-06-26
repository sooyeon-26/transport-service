import React from 'react';
import styled from 'styled-components';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const COLORS = {
  여유: '#9be8d7',
  보통: '#a9d8ff',
  혼잡: '#ffc680',
  '매우 혼잡': '#ff9b9b'
};

const SELECTED_COLORS = {
  여유: '#00a884',
  보통: '#4ba3f2',
  혼잡: '#ff9f43',
  '매우 혼잡': '#ff6b6b'
};

function CurrentHourLabel(props) {
  const { x, y, width, index, data, selectedHour } = props;
  const payload = data?.[index];
  if (!payload || Number(payload.hour) !== Number(selectedHour)) return null;

  const labelWidth = 88;
  const labelHeight = 28;
  const labelX = x + width / 2 - labelWidth / 2;
  const labelY = Math.max(0, y - 36);
  const color = SELECTED_COLORS[payload.crowding] || '#4ba3f2';

  return (
    <g>
      <rect x={labelX} y={labelY} width={labelWidth} height={labelHeight} rx={14} fill={color} />
      <path d={`M${x + width / 2 - 6} ${labelY + labelHeight - 1} L${x + width / 2} ${labelY + labelHeight + 7} L${x + width / 2 + 6} ${labelY + labelHeight - 1} Z`} fill={color} />
      <text x={x + width / 2} y={labelY + 18} fill="#ffffff" fontSize="12" fontWeight="800" textAnchor="middle">
        현재 {String(payload?.hour).padStart(2, '0')}:00
      </text>
    </g>
  );
}

function PeakHourLabel(props) {
  const { x, y, width, index, data, selectedHour } = props;
  const payload = data?.[index];
  if (!payload || Number(payload.hour) === Number(selectedHour)) return null;

  const peakPercent = Math.max(...data.map((item) => Number(item.percent || 0)));
  if (Number(payload.percent) !== peakPercent || peakPercent <= 0) return null;

  return (
    <g>
      <circle cx={x + width / 2} cy={Math.max(12, y - 12)} r="4" fill="#10182f" opacity="0.72" />
      <text x={x + width / 2} y={Math.max(10, y - 18)} fill="#10182f" fontSize="11" fontWeight="850" textAnchor="middle">
        피크
      </text>
    </g>
  );
}

const Panel = styled.section`
  border: ${({ $embedded }) => ($embedded ? '0' : '1px solid var(--border-soft, #ddeaf5)')};
  border-radius: 8px;
  background: ${({ $embedded }) => ($embedded ? 'transparent' : 'rgba(255, 255, 255, 0.82)')};
  padding: ${({ $embedded }) => ($embedded ? '0' : '18px')};
  box-shadow: ${({ $embedded }) => ($embedded ? 'none' : 'var(--shadow-card, 0 10px 28px rgba(16, 24, 47, 0.06))')};
  backdrop-filter: ${({ $embedded }) => ($embedded ? 'none' : 'blur(20px)')};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 16px;

  @media (max-width: 620px) {
    display: grid;
  }
`;

const ChartCallouts = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: -2px 0 14px;
`;

const CalloutPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 1px solid ${({ $color }) => $color || '#ddeaf5'};
  border-radius: 999px;
  background: ${({ $soft }) => $soft || 'rgba(247, 251, 255, 0.86)'};
  color: ${({ $color }) => $color || '#5d6b82'};
  padding: 7px 10px;
  font-size: 12px;
  font-weight: 850;

  &::before {
    content: '';
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${({ $color }) => $color || '#4ba3f2'};
  }
`;

const Title = styled.h2`
  margin: 0;
  color: #27253d;
  font-size: 22px;
`;

const Subtitle = styled.p`
  margin: 5px 0 0;
  color: #69718d;
  font-size: 13px;
`;

const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
`;

const LegendItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #464b65;
  font-size: 11px;
  font-weight: 800;

  &::before {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
  }
`;

const Empty = styled.div`
  height: 260px;
  display: grid;
  place-items: center;
  color: #69718d;
  background: #fafbff;
  border: 1px dashed #dae0f1;
  border-radius: 8px;
`;

function CrowdingChart({ data, selectedHour, recommendedFromHour, onSelectHour, embedded = false }) {
  const selectedEntry = data.find((entry) => Number(entry.hour) === Number(selectedHour));
  const selectedColor = SELECTED_COLORS[selectedEntry?.crowding] || '#4ba3f2';
  const peakEntry = data.reduce(
    (peak, entry) => (Number(entry.percent || 0) > Number(peak?.percent || 0) ? entry : peak),
    data[0]
  );

  return (
    <Panel $embedded={embedded}>
      {!embedded && (
        <Header>
          <div>
            <Title>시간대별 혼잡도</Title>
            <Subtitle>05시~23시 예상 혼잡도(%)입니다. 현재 시간대는 강조 표시됩니다.</Subtitle>
          </div>
          <Legend>
            {Object.entries(COLORS).map(([label, color]) => (
              <LegendItem key={label} $color={color}>
                {label}
              </LegendItem>
            ))}
          </Legend>
        </Header>
      )}
      {!embedded && data.length ? (
        <ChartCallouts>
          <CalloutPill $color={selectedColor} $soft="rgba(247, 251, 255, 0.92)">
            현재 {String(selectedHour).padStart(2, '0')}:00
          </CalloutPill>
          {recommendedFromHour ? (
            <CalloutPill $color="#00a884" $soft="rgba(232, 248, 243, 0.78)">
              추천 {String(recommendedFromHour).padStart(2, '0')}:00 이후
            </CalloutPill>
          ) : null}
          {peakEntry ? (
            <CalloutPill $color="#10182f" $soft="rgba(234, 245, 252, 0.78)">
              피크 {String(peakEntry.hour).padStart(2, '0')}:00
            </CalloutPill>
          ) : null}
        </ChartCallouts>
      ) : null}
      {data.length ? (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 42, right: 10, bottom: 0, left: -18 }}>
            <defs>
              <filter id="selectedBarShadow" x="-30%" y="-30%" width="160%" height="170%">
                <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#1c4878" floodOpacity="0.18" />
              </filter>
            </defs>
            {recommendedFromHour ? (
              <ReferenceArea
                x1={recommendedFromHour}
                x2={23}
                y1={0}
                y2={100}
                fill="#e8f8f3"
                fillOpacity={0.5}
                strokeOpacity={0}
              />
            ) : null}
            <CartesianGrid stroke="rgba(196, 211, 236, 0.72)" vertical={false} strokeDasharray="4 4" />
            <XAxis dataKey="hour" tickFormatter={(value) => `${value}시`} tick={{ fill: '#69718d', fontSize: 12 }} />
            <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}`} tick={{ fill: '#69718d', fontSize: 12 }} />
            <Tooltip
              formatter={(value, _name, props) => [`${value}%`, props.payload.crowding]}
              labelFormatter={(label) => `${label}시`}
              cursor={{ fill: '#f7fbff' }}
            />
            <Bar
              dataKey="percent"
              radius={[6, 6, 0, 0]}
              cursor="pointer"
              onClick={(entry) => onSelectHour?.(entry.hour)}
            >
              <LabelList content={(props) => <CurrentHourLabel {...props} data={data} selectedHour={selectedHour} />} />
              <LabelList content={(props) => <PeakHourLabel {...props} data={data} selectedHour={selectedHour} />} />
              {data.map((entry) => {
                const selected = Number(entry.hour) === Number(selectedHour);
                const recommended = recommendedFromHour && Number(entry.hour) >= Number(recommendedFromHour);
                return (
                  <Cell
                    key={entry.hour}
                    fill={selected ? SELECTED_COLORS[entry.crowding] || '#2f8df4' : COLORS[entry.crowding] || '#8fd8ff'}
                    opacity={selected ? 1 : recommended ? 0.9 : 0.56}
                    stroke={recommended && !selected ? SELECTED_COLORS[entry.crowding] || '#4ba3f2' : undefined}
                    strokeWidth={recommended && !selected ? 1 : 0}
                    strokeOpacity={recommended && !selected ? 0.32 : undefined}
                    filter={selected ? 'url(#selectedBarShadow)' : undefined}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <Empty>예측 조건을 입력하면 차트가 표시됩니다.</Empty>
      )}
    </Panel>
  );
}

export default CrowdingChart;
