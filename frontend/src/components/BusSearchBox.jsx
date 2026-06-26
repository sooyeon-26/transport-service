import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { BusFront, CalendarDays, ChevronDown, MapPin, Search } from 'lucide-react';

const Panel = styled.form`
  position: relative;
  z-index: 50;
  display: grid;
  grid-template-columns: ${({ $showHour, $showMonth }) => {
    if ($showHour && $showMonth) return 'minmax(112px, 0.8fr) minmax(220px, 1.4fr) minmax(132px, 0.72fr) minmax(132px, 0.72fr) auto';
    if ($showMonth) return 'minmax(190px, 1fr) minmax(210px, 1fr) minmax(180px, 0.72fr)';
    if ($showHour) return '1fr 1.45fr 0.75fr auto';
    return '1fr 1.5fr auto';
  }};
  gap: 16px;
  align-items: end;
  height: 100%;
  padding: ${({ $flat }) => ($flat ? '0' : '16px')};
  border: ${({ $flat }) => ($flat ? '0' : '1px solid rgba(255, 255, 255, 0.7)')};
  border-radius: 8px;
  background: ${({ $flat }) => ($flat ? 'transparent' : 'rgba(255, 255, 255, 0.84)')};
  box-shadow: ${({ $flat }) => ($flat ? 'none' : '0 18px 48px rgba(45, 54, 82, 0.12)')};
  backdrop-filter: ${({ $flat }) => ($flat ? 'none' : 'blur(20px)')};

  ${({ $showMonth, $showHour }) =>
    $showMonth && !$showHour
      ? `
        > label:nth-of-type(1) {
          grid-column: 1 / 2;
        }

        > label:nth-of-type(2) {
          grid-column: 2 / 3;
        }

        > label:nth-of-type(3) {
          grid-column: 3 / 4;
        }

        > button {
          grid-column: 1 / -1;
        }
      `
      : ''}

  @media (max-width: 1100px) {
    grid-template-columns: ${({ $showHour, $showMonth }) => ($showHour || $showMonth ? '1fr 1fr' : '1fr 1.5fr auto')};
  }

  @media (max-width: 760px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;

    > label,
    > button {
      grid-column: 1 / -1;
    }
  }
`;

const Field = styled.label`
  min-width: 0;
  display: grid;
  gap: 7px;
  color: #11172f;
  font-size: 15px;
  font-weight: 950;
`;

const inputStyles = `
  width: 100%;
  min-height: 58px;
  border: 2px solid #d4deee;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.78);
  color: #27253d;
  font-size: 18px;
  padding: 0 48px 0 18px;
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
  padding-right: 76px;
`;

const ComboToggle = styled.button`
  position: absolute;
  top: 50%;
  right: 12px;
  width: 28px;
  height: 28px;
  display: inline-grid;
  place-items: center;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #9ca7bb;
  cursor: pointer;
  transform: translateY(-50%);
`;

const FieldIcon = styled.span`
  position: absolute;
  right: 48px;
  top: 50%;
  display: inline-grid;
  place-items: center;
  color: #9ca7bb;
  transform: translateY(-50%);
  pointer-events: none;
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
  min-height: 62px;
  border: 0;
  border-radius: 14px;
  background: linear-gradient(135deg, #1f8fff, #0f63d8);
  color: white;
  font-weight: 900;
  font-size: 22px;
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

function SearchableField({ label, name, value, options, placeholder, inputMode, onChange, icon: Icon }) {
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
        {Icon && (
          <FieldIcon>
            <Icon size={21} aria-hidden="true" />
          </FieldIcon>
        )}
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

function BusSearchBox({ form, setForm, onSubmit, loading, options, showHour = false, showMonth = false, submitLabel = '예측하기', variant = 'card' }) {
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
    <Panel onSubmit={onSubmit} $showHour={showHour} $showMonth={showMonth} $flat={variant === 'flat'}>
      <SearchableField
        label="버스 번호"
        name="route"
        value={form.route}
        options={options.routes?.length ? options.routes : [form.route]}
        inputMode="numeric"
        placeholder="예) 160"
        onChange={update}
        icon={BusFront}
      />
      <SearchableField
        label="정류장명"
        name="station"
        value={form.station}
        options={stationOptions.length ? stationOptions : [form.station]}
        placeholder="예) 강남역"
        onChange={update}
        icon={MapPin}
      />
      {showMonth && (
        <Field>
          기준 월 (선택)
          <ComboWrap>
            <Select name="month" value={form.month || ''} onChange={update}>
              <option value="" disabled>
                2024-05
              </option>
              {(options.months?.length ? options.months : []).map((month) => (
                <option key={month.value} value={month.value}>
                  {String(month.value || month.label).replace(/^(\d{4})(\d{2})$/, '$1-$2')}
                </option>
              ))}
            </Select>
            <FieldIcon>
              <CalendarDays size={21} aria-hidden="true" />
            </FieldIcon>
          </ComboWrap>
        </Field>
      )}
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
