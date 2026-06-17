import React from 'react';
import styled from 'styled-components';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const COLORS = {
  여유: '#bff3de',
  보통: '#8fd8ff',
  혼잡: '#ffbd8a',
  '매우 혼잡': '#9a8cff'
};

const Panel = styled.section`
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.84);
  padding: 18px;
  box-shadow: 0 18px 48px rgba(45, 54, 82, 0.12);
  backdrop-filter: blur(20px);
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

const Title = styled.h2`
  margin: 0;
  color: #27253d;
  font-size: 17px;
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

function CrowdingChart({ data, selectedHour, onSelectHour }) {
  return (
    <Panel>
      <Header>
        <div>
          <Title>시간대별 흐름</Title>
          <Subtitle>막대를 눌러 다른 시간대를 확인하세요.</Subtitle>
        </div>
        <Legend>
          {Object.entries(COLORS).map(([label, color]) => (
            <LegendItem key={label} $color={color}>
              {label}
            </LegendItem>
          ))}
        </Legend>
      </Header>
      {data.length ? (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 8, right: 10, bottom: 0, left: -18 }}>
            <CartesianGrid stroke="rgba(218, 224, 241, 0.72)" vertical={false} />
            <XAxis dataKey="hour" tickFormatter={(value) => `${value}시`} tick={{ fill: '#69718d', fontSize: 12 }} />
            <YAxis tick={{ fill: '#69718d', fontSize: 12 }} />
            <Tooltip
              formatter={(value, _name, props) => [`${value}명`, props.payload.crowding]}
              labelFormatter={(label) => `${label}시`}
              cursor={{ fill: '#f7fbff' }}
            />
            <Bar
              dataKey="passengers"
              radius={[6, 6, 0, 0]}
              cursor="pointer"
              onClick={(entry) => onSelectHour?.(entry.hour)}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.hour}
                  fill={COLORS[entry.crowding] || '#8fd8ff'}
                  stroke={Number(entry.hour) === Number(selectedHour) ? '#2f8df4' : 'transparent'}
                  strokeWidth={Number(entry.hour) === Number(selectedHour) ? 3 : 0}
                  opacity={Number(entry.hour) === Number(selectedHour) ? 1 : 0.78}
                />
              ))}
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
