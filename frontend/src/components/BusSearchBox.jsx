import React from 'react';
import styled from 'styled-components';
import { Search } from 'lucide-react';

const dayTypeLabel = {
  all: '월 전체',
  weekday: '평일',
  weekend: '주말'
};

const Panel = styled.form`
  display: grid;
  grid-template-columns: 1fr 1.3fr 0.8fr 0.8fr auto;
  gap: 12px;
  align-items: end;
  padding: 18px;
  border: 1px solid #d8e2ea;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(26, 48, 64, 0.07);

  @media (max-width: 980px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.label`
  display: grid;
  gap: 7px;
  color: #415466;
  font-size: 13px;
  font-weight: 700;
`;

const inputStyles = `
  width: 100%;
  min-height: 44px;
  border: 1px solid #cbd8e3;
  border-radius: 6px;
  background: #f9fbfd;
  color: #15212c;
  font-size: 15px;
  padding: 0 12px;
  outline: none;

  &:focus {
    border-color: #2177c7;
    box-shadow: 0 0 0 3px rgba(33, 119, 199, 0.14);
    background: #ffffff;
  }
`;

const Select = styled.select`${inputStyles}`;

const Button = styled.button`
  min-height: 44px;
  border: 0;
  border-radius: 6px;
  background: #1167b1;
  color: white;
  font-weight: 800;
  font-size: 15px;
  padding: 0 18px;
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  white-space: nowrap;

  &:disabled {
    cursor: wait;
    opacity: 0.7;
  }

  @media (max-width: 980px) {
    width: 100%;
  }
`;

function BusSearchBox({ form, setForm, onSubmit, loading, options }) {
  const stationOptions = options.stations || [];

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => {
      if (name === 'route') {
        return { ...current, route: value, station: '' };
      }
      return { ...current, [name]: value };
    });
  };

  return (
    <Panel onSubmit={onSubmit}>
      <Field>
        버스 번호
        <Select name="route" value={form.route} onChange={update}>
          {(options.routes?.length ? options.routes : [form.route]).map((route) => (
            <option key={route} value={route}>
              {route}
            </option>
          ))}
        </Select>
      </Field>
      <Field>
        정류장명
        <Select name="station" value={form.station} onChange={update}>
          {(stationOptions.length ? stationOptions : [form.station]).map((station) => (
            <option key={station} value={station}>
              {station}
            </option>
          ))}
        </Select>
      </Field>
      <Field>
        요일 구분
        <Select name="dayType" value={form.dayType} onChange={update}>
          {(options.dayTypes?.length ? options.dayTypes : ['weekday', 'weekend']).map((dayType) => (
            <option key={dayType} value={dayType}>
              {dayTypeLabel[dayType] || dayType}
            </option>
          ))}
        </Select>
      </Field>
      <Field>
        시간대
        <Select name="hour" value={form.hour} onChange={update}>
          {(options.hours?.length ? options.hours : [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]).map((hour) => (
            <option key={hour} value={hour}>
              {hour}시
            </option>
          ))}
        </Select>
      </Field>
      <Button type="submit" disabled={loading}>
        <Search size={18} aria-hidden="true" />
        예측하기
      </Button>
    </Panel>
  );
}

export default BusSearchBox;
