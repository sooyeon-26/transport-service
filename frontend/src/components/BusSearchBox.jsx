import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { ChevronDown, Search } from 'lucide-react';

const Panel = styled.form`
  position: relative;
  z-index: 50;
  display: grid;
  grid-template-columns: ${({ $showHour }) => ($showHour ? '1fr 1.45fr 0.75fr auto' : '1fr 1.5fr auto')};
  gap: 12px;
  align-items: end;
  height: 100%;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 18px 48px rgba(45, 54, 82, 0.12);
  backdrop-filter: blur(20px);

  @media (max-width: 760px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.label`
  display: grid;
  gap: 7px;
  color: #464b65;
  font-size: 13px;
  font-weight: 700;
`;

const inputStyles = `
  width: 100%;
  min-height: 44px;
  border: 1px solid #dae0f1;
  border-radius: 6px;
  background: rgba(250, 251, 255, 0.78);
  color: #27253d;
  font-size: 15px;
  padding: 0 12px;
  outline: none;

  &:focus {
    border-color: #7fbfff;
    box-shadow: 0 0 0 3px rgba(127, 191, 255, 0.2);
    background: #ffffff;
  }
`;

const Select = styled.select`${inputStyles}`;

const Input = styled.input`${inputStyles}`;

const ComboWrap = styled.div`
  position: relative;
  z-index: ${({ $open }) => ($open ? 100 : 1)};
`;

const ComboInput = styled(Input)`
  padding-right: 38px;
`;

const ComboToggle = styled.button`
  position: absolute;
  top: 50%;
  right: 8px;
  width: 28px;
  height: 28px;
  display: inline-grid;
  place-items: center;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #69718d;
  cursor: pointer;
  transform: translateY(-50%);
`;

const OptionList = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 120;
  max-height: 230px;
  overflow-y: auto;
  border: 1px solid #dae0f1;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 18px 44px rgba(45, 54, 82, 0.18);
  padding: 6px;
`;

const OptionButton = styled.button`
  width: 100%;
  min-height: 36px;
  border: 0;
  border-radius: 6px;
  background: ${({ $active }) => ($active ? '#edf8ff' : 'transparent')};
  color: #27253d;
  padding: 8px 10px;
  text-align: left;
  font-weight: 800;
  cursor: pointer;

  &:hover {
    background: #f3f8ff;
  }
`;

const EmptyOption = styled.div`
  padding: 10px;
  color: #69718d;
  font-size: 13px;
  font-weight: 800;
`;

const Button = styled.button`
  min-height: 44px;
  border: 0;
  border-radius: 6px;
  background: #2f8df4;
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

  @media (max-width: 760px) {
    width: 100%;
    grid-column: 1 / -1;
  }
`;

function SearchableField({ label, name, value, options, placeholder, inputMode, onChange }) {
  const [open, setOpen] = useState(false);
  const normalizedValue = String(value || '');
  const normalizedOptions = useMemo(
    () => Array.from(new Set((options || []).filter(Boolean).map(String))),
    [options]
  );
  const filteredOptions = useMemo(() => {
    const query = normalizedValue.trim().toLowerCase();
    if (!query) return normalizedOptions.slice(0, 80);
    return normalizedOptions.filter((option) => option.toLowerCase().includes(query)).slice(0, 80);
  }, [normalizedOptions, normalizedValue]);

  const selectValue = (nextValue) => {
    onChange({ target: { name, value: nextValue } });
    setOpen(false);
  };

  return (
    <Field>
      {label}
      <ComboWrap $open={open}>
        <ComboInput
          name={name}
          value={normalizedValue}
          onChange={(event) => {
            onChange(event);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          inputMode={inputMode}
          placeholder={placeholder}
          autoComplete="off"
        />
        <ComboToggle
          type="button"
          aria-label={`${label} 선택지 열기`}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setOpen((current) => !current)}
        >
          <ChevronDown size={17} aria-hidden="true" />
        </ComboToggle>
        {open && (
          <OptionList>
            {filteredOptions.length ? (
              filteredOptions.map((option) => (
                <OptionButton
                  key={option}
                  type="button"
                  $active={option === normalizedValue}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectValue(option)}
                >
                  {option}
                </OptionButton>
              ))
            ) : (
              <EmptyOption>검색 결과가 없습니다.</EmptyOption>
            )}
          </OptionList>
        )}
      </ComboWrap>
    </Field>
  );
}

function BusSearchBox({ form, setForm, onSubmit, loading, options, showHour = false, submitLabel = '예측하기' }) {
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
    <Panel onSubmit={onSubmit} $showHour={showHour}>
      <SearchableField
        label="버스 번호"
        name="route"
        value={form.route}
        options={options.routes?.length ? options.routes : [form.route]}
        inputMode="numeric"
        placeholder="노선 검색"
        onChange={update}
      />
      <SearchableField
        label="정류장명"
        name="station"
        value={form.station}
        options={stationOptions.length ? stationOptions : [form.station]}
        placeholder="정류장 검색"
        onChange={update}
      />
      {showHour && (
        <Field>
          시간대
          <Select name="hour" value={form.hour} onChange={update}>
            {(options.hours?.length ? options.hours : Array.from({ length: 24 }, (_, hour) => hour)).map((hour) => (
              <option key={hour} value={hour}>
                {hour}시
              </option>
            ))}
          </Select>
        </Field>
      )}
      <Button type="submit" disabled={loading}>
        <Search size={18} aria-hidden="true" />
        {submitLabel}
      </Button>
    </Panel>
  );
}

export default BusSearchBox;
