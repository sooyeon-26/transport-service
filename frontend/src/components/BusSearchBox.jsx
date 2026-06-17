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
  padding: ${({ $flat }) => ($flat ? '0' : '16px')};
  border: ${({ $flat }) => ($flat ? '0' : '1px solid rgba(255, 255, 255, 0.7)')};
  border-radius: 8px;
  background: ${({ $flat }) => ($flat ? 'transparent' : 'rgba(255, 255, 255, 0.84)')};
  box-shadow: ${({ $flat }) => ($flat ? 'none' : '0 18px 48px rgba(45, 54, 82, 0.12)')};
  backdrop-filter: ${({ $flat }) => ($flat ? 'none' : 'blur(20px)')};

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
  background: ${({ $active, $focused }) => ($active || $focused ? '#edf8ff' : 'transparent')};
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
  min-height: 50px;
  border: 0;
  border-radius: 6px;
  background: linear-gradient(135deg, #1f8fff, #0f63d8);
  color: white;
  font-weight: 900;
  font-size: 15px;
  padding: 0 22px;
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 16px 34px rgba(31, 143, 255, 0.34);
  transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    background: linear-gradient(135deg, #147fea, #0b58c8);
    box-shadow: 0 20px 42px rgba(31, 143, 255, 0.44);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 12px 26px rgba(31, 143, 255, 0.32);
  }

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
  const [searching, setSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const normalizedValue = String(value || '');
  const normalizedOptions = useMemo(
    () => Array.from(new Set((options || []).filter(Boolean).map(String))),
    [options]
  );

  const visibleOptions = useMemo(() => {
    if (!searching) return normalizedOptions.slice(0, 80);
    const query = normalizedValue.trim().toLowerCase();
    if (!query) return normalizedOptions.slice(0, 80);
    return normalizedOptions.filter((option) => option.toLowerCase().includes(query)).slice(0, 80);
  }, [normalizedOptions, normalizedValue, searching]);

  const openOptions = (nextSearching = false) => {
    setSearching(nextSearching);
    setOpen(true);
    const selectedIndex = normalizedOptions.findIndex((option) => option === normalizedValue);
    setActiveIndex(selectedIndex >= 0 && selectedIndex < 80 ? selectedIndex : 0);
  };

  const selectValue = (nextValue) => {
    onChange({ target: { name, value: nextValue } });
    setSearching(false);
    setOpen(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open) {
        openOptions(false);
        return;
      }
      setActiveIndex((current) => Math.min(current + 1, Math.max(visibleOptions.length - 1, 0)));
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        openOptions(false);
        return;
      }
      setActiveIndex((current) => Math.max(current - 1, 0));
    }

    if (event.key === 'Enter' && open && visibleOptions[activeIndex]) {
      event.preventDefault();
      selectValue(visibleOptions[activeIndex]);
    }

    if (event.key === 'Escape') {
      setSearching(false);
      setOpen(false);
    }
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
            setSearching(true);
            setOpen(true);
            setActiveIndex(0);
          }}
          onFocus={() => openOptions(false)}
          onClick={() => openOptions(false)}
          onKeyDown={handleKeyDown}
          onBlur={() =>
            window.setTimeout(() => {
              setSearching(false);
              setOpen(false);
            }, 120)
          }
          inputMode={inputMode}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
        />
        <ComboToggle
          type="button"
          aria-label={`${label} 선택지 열기`}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            if (open) {
              setOpen(false);
              setSearching(false);
              return;
            }
            openOptions(false);
          }}
        >
          <ChevronDown size={17} aria-hidden="true" />
        </ComboToggle>
        {open && (
          <OptionList role="listbox">
            {visibleOptions.length ? (
              visibleOptions.map((option, index) => (
                <OptionButton
                  key={option}
                  type="button"
                  $active={option === normalizedValue}
                  $focused={index === activeIndex}
                  role="option"
                  aria-selected={option === normalizedValue}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
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

function BusSearchBox({ form, setForm, onSubmit, loading, options, showHour = false, submitLabel = '예측하기', variant = 'card' }) {
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
    <Panel onSubmit={onSubmit} $showHour={showHour} $flat={variant === 'flat'}>
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
