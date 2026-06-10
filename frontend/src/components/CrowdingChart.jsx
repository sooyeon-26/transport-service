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
  여유: '#2da66f',
  보통: '#2f7fc1',
  혼잡: '#d28a21',
  '매우 혼잡': '#d94a3f'
};

const Panel = styled.section`
  border: 1px solid #d8e2ea;
  border-radius: 8px;
  background: #ffffff;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(26, 48, 64, 0.07);
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
  color: #172634;
  font-size: 19px;
`;

const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const LegendItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #4d6072;
  font-size: 12px;
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
  height: 320px;
  display: grid;
  place-items: center;
  color: #647789;
  background: #f9fbfd;
  border: 1px dashed #cbd8e3;
  border-radius: 8px;
`;

function CrowdingChart({ data }) {
  return (
    <Panel>
      <Header>
        <Title>시간대별 평균 승차 인원</Title>
        <Legend>
          {Object.entries(COLORS).map(([label, color]) => (
            <LegendItem key={label} $color={color}>
              {label}
            </LegendItem>
          ))}
        </Legend>
      </Header>
      {data.length ? (
        <ResponsiveContainer width="100%" height={330}>
          <BarChart data={data} margin={{ top: 8, right: 10, bottom: 0, left: -18 }}>
            <CartesianGrid stroke="#e6edf3" vertical={false} />
            <XAxis dataKey="hour" tickFormatter={(value) => `${value}시`} tick={{ fill: '#506476', fontSize: 12 }} />
            <YAxis tick={{ fill: '#506476', fontSize: 12 }} />
            <Tooltip
              formatter={(value, _name, props) => [`${value}명`, props.payload.crowding]}
              labelFormatter={(label) => `${label}시`}
              cursor={{ fill: '#edf5fb' }}
            />
            <Bar dataKey="passengers" radius={[6, 6, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.hour} fill={COLORS[entry.crowding] || '#2f7fc1'} />
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
