import React, { useEffect, useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { BarChart3, BusFront, CalendarDays, Clock3, Database, Gauge, Heart, MapPin, RotateCcw, Smile, Target, TrendingDown, Users } from 'lucide-react';
import { fetchHourly, fetchOptions, fetchStations } from '../api/busApi.js';
import BusSearchBox from '../components/BusSearchBox.jsx';
import CrowdingChart from '../components/CrowdingChart.jsx';

const splashOut = keyframes`
  to {
    opacity: 0;
    visibility: hidden;
  }
`;

const logoReveal = keyframes`
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const busFloat = keyframes`
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) translateY(0) rotate(-0.4deg) scale(1);
  }

  28% {
    opacity: 1;
    transform: translate(-50%, -50%) translateY(-12px) rotate(0.35deg) scale(1.015);
  }

  52% {
    opacity: 1;
    transform: translate(-50%, -50%) translateY(0) rotate(-0.2deg) scale(1);
  }

  68% {
    opacity: 0.5;
    transform: translate(-50%, -50%) translateY(2px) rotate(0deg) scale(0.98);
  }

  86%,
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) translateY(6px) rotate(0deg) scale(0.92);
  }
`;

const roadLineDrift = keyframes`
  0% {
    transform: translate3d(300px, 0, 0);
    opacity: 0;
  }

  18%,
  82% {
    opacity: 0.68;
  }

  100% {
    transform: translate3d(-360px, 0, 0);
    opacity: 0;
  }
`;

const roadSceneFade = keyframes`
  0%,
  58% {
    opacity: 1;
  }

  100% {
    opacity: 0.24;
  }
`;

const landingBusFloat = keyframes`
  0%,
  100% {
    transform: translateY(0) rotate(-0.5deg);
  }

  50% {
    transform: translateY(-10px) rotate(0.4deg);
  }
`;

const landingLaneDrift = keyframes`
  0% {
    transform: translate3d(260px, 0, 0);
    opacity: 0;
  }

  16%,
  84% {
    opacity: 0.72;
  }

  100% {
    transform: translate3d(-360px, 0, 0);
    opacity: 0;
  }
`;

const Shell = styled.main`
  min-height: 100vh;
  min-height: 100svh;
  background:
    radial-gradient(circle at 8% 32%, rgba(255, 255, 255, 0.96), transparent 30%),
    radial-gradient(circle at 74% 8%, rgba(255, 255, 255, 0.64), transparent 26%),
    linear-gradient(145deg, #f6fbff 0%, #dff0ff 45%, #f7fbff 100%);
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  color: #27253d;
  transition: background-position 500ms ease, background-image 500ms ease;
`;

const SplashOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 200;
  display: grid;
  place-items: center;
  overflow: hidden;
  background:
    radial-gradient(circle at 26% 20%, rgba(255, 255, 255, 0.82), transparent 34%),
    linear-gradient(135deg, rgba(248, 252, 255, 0.96), rgba(227, 243, 255, 0.94) 48%, rgba(247, 244, 255, 0.96));
  animation: ${splashOut} 420ms ease 2400ms forwards;

  @media (prefers-reduced-motion: reduce) {
    animation-duration: 180ms;
    animation-delay: 720ms;
  }
`;

const SplashScene = styled.div`
  position: relative;
  width: min(900px, 90vw);
  min-height: 340px;
  display: grid;
  place-items: center;
`;

const SplashRoad = styled.div`
  position: absolute;
  left: 50%;
  top: 60%;
  width: clamp(430px, 48vw, 680px);
  height: 170px;
  pointer-events: none;
  overflow: hidden;
  transform: translateX(-50%) rotate(-24deg) skewX(-6deg);
  transform-origin: center;
  animation: ${roadSceneFade} 2200ms ease forwards;
  z-index: 0;

  &::before {
    content: '';
    position: absolute;
    left: 10%;
    right: 8%;
    top: 34%;
    height: 62%;
    border-radius: 50%;
    background: radial-gradient(ellipse at center, rgba(91, 151, 231, 0.16), rgba(91, 151, 231, 0) 68%);
    filter: blur(1px);
  }

  span {
    position: absolute;
    left: 50%;
    top: 52%;
    width: clamp(150px, 14vw, 210px);
    height: clamp(16px, 1.8vw, 22px);
    border-radius: 999px;
    background: linear-gradient(90deg, rgba(56, 134, 244, 0), rgba(72, 151, 255, 0.68) 14%, rgba(92, 168, 255, 0.76) 82%, rgba(56, 134, 244, 0));
    box-shadow:
      0 10px 18px rgba(48, 121, 222, 0.13),
      inset 0 1px 0 rgba(255, 255, 255, 0.45);
    animation: ${roadLineDrift} 1650ms linear infinite;
  }

  span:nth-child(2) {
    top: 68%;
    width: clamp(170px, 16vw, 240px);
    animation-delay: -550ms;
  }

  span:nth-child(3) {
    top: 36%;
    width: clamp(120px, 12vw, 180px);
    animation-delay: -1100ms;
  }

  @media (prefers-reduced-motion: reduce) {
    span {
      animation: none;
      opacity: 0.36;
    }
  }
`;

const SplashBusStage = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
`;

const BusImageWrapper = styled.div`
  position: absolute;
  left: 50%;
  top: 52%;
  width: clamp(250px, 34vw, 470px);
  animation: ${busFloat} 2200ms ease-in-out forwards;
  transform-origin: center;
  filter: drop-shadow(20px 28px 18px rgba(43, 103, 199, 0.18));
  z-index: 1;

  img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: contain;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transform: translate(-50%, -50%);
  }
`;

const SplashLogo = styled.div`
  position: relative;
  display: grid;
  justify-items: center;
  gap: 10px;
  opacity: 0;
  transform: translateY(16px) scale(0.98);
  animation: ${logoReveal} 680ms ease 1500ms forwards;
  z-index: 2;
`;

const SplashBrand = styled.div`
  color: #27253d;
  font-size: clamp(48px, 8vw, 86px);
  font-weight: 950;
  line-height: 1;
  letter-spacing: 0;
`;

const SplashTagline = styled.div`
  color: #2878d8;
  font-size: clamp(13px, 2.1vw, 16px);
  font-weight: 900;
`;

const SplashSkip = styled.button`
  position: absolute;
  right: 24px;
  top: 24px;
  min-height: 36px;
  border: 1px solid rgba(218, 224, 241, 0.86);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.74);
  color: #464b65;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
  backdrop-filter: blur(14px);

  &:hover {
    background: #ffffff;
  }

  @media (max-width: 640px) {
    right: 14px;
    top: 14px;
  }
`;

const Content = styled.div`
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px;

  @media (max-width: 720px) {
    padding: 12px;
  }
`;

const SectionAnchor = styled.span`
  display: block;
  height: 1px;
  scroll-margin-top: 88px;
`;

const IntroLayer = styled.div`
  min-height: 100vh;
  min-height: 100svh;
  display: grid;
  place-items: center;
  padding: 24px;

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
  min-height: 100px;
  border: 1px solid rgba(218, 224, 241, 0.82);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  display: grid;
  align-content: center;
  padding: 18px;
  color: #27253d;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(241, 248, 255, 0.72)),
    linear-gradient(150deg, #f8fbff 0%, #eef7ff 46%, #f8f4ff 100%);
  box-shadow: none;
  backdrop-filter: none;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(90deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.72) 52%, rgba(255, 255, 255, 0.18) 100%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.56));
    pointer-events: none;
  }
`;

const SeoulMap = styled.div`
  position: absolute;
  inset: 0;
  color: #9ba8c5;
  opacity: 0.7;

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
  width: 16px;
  height: 16px;
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
  display: grid;
  gap: 9px;
  max-width: 92%;
`;

const StationMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
`;

const MetaChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid rgba(218, 224, 241, 0.82);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.68);
  padding: 6px 9px;
  color: #464b65;
  font-size: 12px;
  font-weight: 900;
  backdrop-filter: blur(8px);
`;

const LocationKicker = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  color: #2878d8;
  font-size: 12px;
  font-weight: 950;
`;

const StationTitle = styled.h2`
  margin: 0;
  color: #27253d;
  font-size: clamp(24px, 2.8vw, 34px);
  line-height: 1.12;
  letter-spacing: 0;
  word-break: keep-all;
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
    if ($level === '매우 혼잡') return '#ff6b6b';
    if ($level === '혼잡') return '#ff9f43';
    if ($level === '보통') return '#4ba3f2';
    if ($level === '여유') return '#00a884';
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

const resultToneMap = {
  여유: {
    accent: '#00a884',
    accentSoft: '#e8f8f3',
    text: '#007a63',
    cardStart: '#ffffff',
    cardMid: '#f3fbff',
    cardEnd: '#e8f8f3',
    shadow: 'rgba(0, 168, 132, 0.12)',
    gaugeTrack: '#e7f0f7',
    caption: '여유로운 구간'
  },
  보통: {
    accent: '#4ba3f2',
    accentSoft: '#e8f3ff',
    text: '#2f80ed',
    cardStart: '#ffffff',
    cardMid: '#f5faff',
    cardEnd: '#e8f3ff',
    shadow: 'rgba(47, 128, 237, 0.12)',
    gaugeTrack: '#e7f0f7',
    caption: '보통 수준 구간'
  },
  혼잡: {
    accent: '#ff9f43',
    accentSoft: '#fff3e4',
    text: '#c66a16',
    cardStart: '#ffffff',
    cardMid: '#f5faff',
    cardEnd: '#fff2e3',
    shadow: 'rgba(255, 159, 67, 0.14)',
    gaugeTrack: '#edf3f8',
    caption: '주의가 필요한 구간'
  },
  '매우 혼잡': {
    accent: '#ff6b6b',
    accentSoft: '#ffecec',
    text: '#d94848',
    cardStart: '#ffffff',
    cardMid: '#fff7f7',
    cardEnd: '#ffecec',
    shadow: 'rgba(255, 107, 107, 0.14)',
    gaugeTrack: '#f0eef2',
    caption: '혼잡도가 높은 구간'
  }
};

const crowdingRules = [
  { label: '여유', color: '#00a884', range: '0~30%' },
  { label: '보통', color: '#4ba3f2', range: '31~60%' },
  { label: '혼잡', color: '#ff9f43', range: '61~80%' },
  { label: '매우 혼잡', color: '#ff6b6b', range: '81%+' }
];

const popularRoutes = [
  { route: '1218', station: '남대문중학교', note: '등하교·출퇴근' },
  { route: '160', station: '강남역', note: '도심 이동' },
  { route: '740', station: '홍대입구', note: '저녁 피크' }
];

const PageWrap = styled.div`
  width: min(1348px, calc(100% - 96px));
  margin: 0 auto;
  padding: 20px 0 38px;

  @media (max-width: 760px) {
    width: min(100% - 24px, 720px);
    padding-top: 12px;
  }
`;

const SiteHeader = styled.header`
  min-height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  border: 1px solid rgba(255, 255, 255, 0.82);
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.86);
  padding: 0 34px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(18px);

  @media (max-width: 820px) {
    align-items: flex-start;
    border-radius: 20px;
    display: grid;
  }
`;

const BrandGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 22px;
  min-width: 0;
`;

const BrandLogo = styled.div`
  display: inline-block;
  color: #0b1220;
  font-family: 'Do Hyeon', 'Black Han Sans', sans-serif;
  font-size: clamp(25px, 2.2vw, 29px);
  font-weight: 400;
  line-height: 0.95;
  letter-spacing: -0.045em;
  white-space: nowrap;
  text-shadow: none;
  filter: none;
  -webkit-text-stroke: 0;
  transform: scaleX(1.02) scaleY(0.9);
  transform-origin: left center;
  vertical-align: middle;
`;

const BrandMeta = styled.div`
  color: #59627f;
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
`;

const HeaderNav = styled.nav`
  display: flex;
  align-items: center;
  gap: clamp(28px, 3.2vw, 42px);

  a {
    color: #1f2743;
    font-size: 14px;
    font-weight: 800;
    text-decoration: none;
    white-space: nowrap;
  }

  @media (max-width: 760px) {
    flex-wrap: wrap;
    gap: 14px;
  }
`;

const SearchHero = styled.section`
  position: relative;
  min-height: 560px;
  display: grid;
  grid-template-columns: minmax(680px, 0.96fr) minmax(500px, 1fr);
  gap: 26px;
  align-items: center;
  padding: 54px 38px 18px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 11% 20%, rgba(255, 255, 255, 0.78), transparent 28%),
      radial-gradient(circle at 82% 18%, rgba(177, 217, 255, 0.24), transparent 32%);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 6% -4% 22% -5%;
    background:
      linear-gradient(28deg, transparent 0 48%, rgba(116, 171, 239, 0.17) 48% 49%, transparent 49% 100%),
      linear-gradient(155deg, transparent 0 54%, rgba(116, 171, 239, 0.13) 54% 55%, transparent 55% 100%);
    opacity: 0.18;
    pointer-events: none;
  }

  @media (max-width: 1040px) {
    grid-template-columns: 1fr;
    min-height: auto;
    padding-inline: 0;
  }
`;

const HeroText = styled.div`
  position: relative;
  z-index: 3;
`;

const HeroTitle = styled.h1`
  margin: 0;
  color: #11172f;
  font-size: clamp(54px, 5.1vw, 74px);
  line-height: 1.04;
  letter-spacing: 0;
  white-space: nowrap;

  @media (max-width: 1040px) {
    white-space: normal;
  }
`;

const HeroBadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-bottom: 18px;
`;

const HeroBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 1px solid rgba(187, 214, 242, 0.88);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  color: #1f72d8;
  padding: 9px 12px;
  font-size: 13px;
  font-weight: 950;
  box-shadow: 0 10px 24px rgba(45, 117, 210, 0.08);

  svg {
    flex: 0 0 auto;
  }
`;

const HeroCopy = styled.p`
  max-width: 600px;
  margin: 18px 0 0;
  color: #34405f;
  font-size: clamp(17px, 1.6vw, 22px);
  line-height: 1.72;
`;

const SearchCard = styled.div`
  position: relative;
  z-index: 10;
  margin-top: 26px;
  border: 1px solid rgba(255, 255, 255, 0.78);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.9);
  padding: 24px;
  box-shadow: 0 24px 80px rgba(76, 112, 170, 0.18);
  backdrop-filter: blur(22px);
`;

const HeroVisual = styled.div`
  position: relative;
  z-index: 1;
  min-height: 500px;
  overflow: visible;

  @media (max-width: 1040px) {
    min-height: 390px;
  }
`;

const RouteBackdrop = styled.div`
  position: absolute;
  inset: -3% -9% 10% -14%;
  opacity: 0.72;
  pointer-events: none;

  svg {
    width: 100%;
    height: 100%;
    display: block;
  }
`;

const HeroRoad = styled.div`
  position: absolute;
  left: 2%;
  right: -22%;
  bottom: 14%;
  height: 250px;
  overflow: hidden;
  transform: rotate(-20deg) skewX(-6deg);
  transform-origin: center;
  pointer-events: none;

  span {
    position: absolute;
    left: 42%;
    top: 44%;
    width: clamp(210px, 20vw, 330px);
    height: clamp(14px, 1.4vw, 19px);
    border-radius: 999px;
    background: linear-gradient(90deg, rgba(52, 132, 240, 0), rgba(68, 151, 255, 0.7) 14%, rgba(122, 195, 255, 0.8) 84%, rgba(52, 132, 240, 0));
    box-shadow: 0 12px 22px rgba(35, 111, 220, 0.14);
    animation: ${landingLaneDrift} 1900ms linear infinite;
  }

  span:nth-child(2) {
    top: 62%;
    width: clamp(260px, 24vw, 400px);
    animation-delay: -640ms;
  }

  span:nth-child(3) {
    top: 27%;
    width: clamp(140px, 15vw, 230px);
    animation-delay: -1280ms;
  }
`;

const BusHeroImage = styled.img`
  position: absolute;
  right: -2%;
  top: 9%;
  width: min(560px, 41vw);
  max-width: 100%;
  height: auto;
  display: block;
  object-fit: contain;
  filter: drop-shadow(28px 34px 24px rgba(36, 92, 181, 0.2));
  animation: ${landingBusFloat} 3600ms ease-in-out infinite;

  @media (max-width: 1040px) {
    left: 50%;
    right: auto;
    top: 8%;
    width: min(560px, 88vw);
    transform: translateX(-50%);
  }
`;

const FeatureGrid = styled.div`
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
  margin-top: 10px;
  border: 1px solid rgba(255, 255, 255, 0.82);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.9);
  padding: 28px 38px;
  box-shadow: 0 24px 80px rgba(76, 112, 170, 0.14);
  backdrop-filter: blur(22px);

  @media (max-width: 840px) {
    grid-template-columns: 1fr;
    padding-inline: 0;
    margin-top: 10px;
  }
`;

const FeatureCard = styled.article`
  min-height: 112px;
  display: grid;
  grid-template-columns: 76px 1fr;
  gap: 14px;
  align-items: center;
  border: 0;
  border-radius: 0;
  background: transparent;
  padding: 0 26px;
  box-shadow: none;
  backdrop-filter: none;

  & + & {
    border-left: 1px solid rgba(194, 211, 236, 0.78);
  }

  @media (max-width: 840px) {
    padding: 22px 28px;

    & + & {
      border-left: 0;
      border-top: 1px solid rgba(194, 211, 236, 0.78);
    }
  }
`;

const FeatureIcon = styled.span`
  width: 70px;
  height: 70px;
  display: inline-grid;
  place-items: center;
  border-radius: 22px;
  color: #1275ea;
  background: linear-gradient(145deg, #ffffff, #e6f4ff);
`;

const FeatureTitle = styled.strong`
  display: block;
  color: #11172f;
  font-size: 21px;
`;

const FeatureText = styled.span`
  display: block;
  margin-top: 5px;
  color: #59627f;
  font-size: 16px;
  font-weight: 750;
`;

const HomeStoryGrid = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1.06fr) minmax(330px, 0.7fr);
  gap: 16px;
  margin-top: 16px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const StoryPanel = styled.article`
  border: 1px solid rgba(221, 234, 245, 0.92);
  border-radius: 18px;
  background:
    radial-gradient(circle at 86% 14%, rgba(232, 243, 255, 0.78), transparent 28%),
    rgba(255, 255, 255, 0.88);
  padding: 24px;
  box-shadow: 0 16px 38px rgba(45, 117, 210, 0.1);
  backdrop-filter: blur(18px);

  h2 {
    margin: 0;
    color: #11172f;
    font-size: clamp(24px, 2.4vw, 34px);
    line-height: 1.18;
    letter-spacing: 0;
  }

  p {
    margin: 10px 0 0;
    color: #59627f;
    line-height: 1.62;
    font-weight: 760;
  }
`;

const StepList = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 18px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const StepCard = styled.div`
  min-height: 112px;
  border: 1px solid rgba(221, 234, 245, 0.88);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.74);
  padding: 16px;

  strong {
    display: block;
    color: #11172f;
    font-size: 17px;
  }

  span {
    display: block;
    margin-top: 8px;
    color: #59627f;
    font-size: 14px;
    line-height: 1.5;
    font-weight: 760;
  }
`;

const RoutePanel = styled(StoryPanel)`
  display: grid;
  align-content: start;
`;

const RouteList = styled.div`
  display: grid;
  gap: 10px;
  margin-top: 18px;
`;

const RouteItem = styled.button`
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  align-items: center;
  gap: 10px 12px;
  min-height: 64px;
  border: 1px solid rgba(221, 234, 245, 0.92);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.74);
  color: #11172f;
  padding: 12px 14px;
  text-align: left;
  cursor: pointer;

  strong {
    color: #1275ea;
    font-size: 18px;
  }

  span {
    color: #59627f;
    font-size: 13px;
    font-weight: 850;
  }

  small {
    grid-column: 2 / 3;
    color: #00a884;
    font-size: 12px;
    font-weight: 950;
  }
`;

const ExamplePreview = styled.section`
  margin-top: 16px;
  border: 1px solid rgba(221, 234, 245, 0.92);
  border-radius: 18px;
  background:
    radial-gradient(circle at 88% 18%, rgba(232, 248, 243, 0.88), transparent 30%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.94), rgba(247, 251, 255, 0.78));
  padding: 26px;
  box-shadow: 0 18px 42px rgba(28, 72, 120, 0.08);
`;

const ExamplePreviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  margin-bottom: 18px;

  @media (max-width: 720px) {
    display: grid;
  }

  h2 {
    margin: 0;
    color: #11172f;
    font-size: clamp(24px, 2.4vw, 34px);
    letter-spacing: 0;
  }

  p {
    max-width: 560px;
    margin: 8px 0 0;
    color: #59627f;
    line-height: 1.62;
    font-weight: 760;
  }
`;

const ColorRuleList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const ColorRule = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 1px solid rgba(221, 234, 245, 0.9);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.76);
  color: #34405f;
  padding: 8px 11px;
  font-size: 12px;
  font-weight: 900;

  &::before {
    content: '';
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
  }
`;

const MiniResultMock = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 0.52fr);
  gap: 14px;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const MiniResultCard = styled.div`
  border: 1px solid rgba(221, 234, 245, 0.88);
  border-radius: 16px;
  background: #ffffff;
  padding: 20px;

  small {
    color: #2878d8;
    font-weight: 950;
  }

  strong {
    display: block;
    margin-top: 8px;
    color: #11172f;
    font-size: clamp(30px, 4vw, 46px);
    line-height: 1.05;
  }

  p {
    margin: 12px 0 0;
    color: #59627f;
    font-weight: 780;
  }
`;

const MiniBars = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 7px;
  align-items: end;
  min-height: 178px;
  border: 1px solid rgba(221, 234, 245, 0.88);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.72);
  padding: 18px 16px;
`;

const MiniBar = styled.span`
  display: block;
  height: ${({ $height }) => $height}%;
  min-height: 22px;
  border-radius: 999px 999px 8px 8px;
  background: ${({ $color }) => $color};
`;

const ResultPage = styled.div`
  display: grid;
  gap: 14px;
  padding-top: 18px;
`;

const SummaryBar = styled.section`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  border: 1px solid rgba(255, 255, 255, 0.78);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.78);
  padding: 18px 20px;
  box-shadow: 0 18px 48px rgba(45, 117, 210, 0.12);
  backdrop-filter: blur(20px);

  @media (max-width: 760px) {
    display: grid;
  }
`;

const SummaryText = styled.strong`
  color: #11172f;
  font-size: clamp(20px, 2vw, 28px);
  line-height: 1.4;
`;

const SummaryMeta = styled.div`
  display: grid;
  gap: 8px;
`;

const SummaryLabel = styled.span`
  width: fit-content;
  border-radius: 999px;
  background: #edf8ff;
  color: #1f72d8;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 950;
`;

const SummaryChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const SummaryChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid rgba(221, 234, 245, 0.92);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  color: #34405f;
  padding: 8px 11px;
  font-size: 14px;
  font-weight: 900;
`;

const SecondaryButton = styled.button`
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid rgba(194, 212, 238, 0.9);
  border-radius: 8px;
  background: #ffffff;
  color: #1f72d8;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 950;
  cursor: pointer;
  box-shadow: 0 12px 26px rgba(45, 117, 210, 0.1);
`;

const ResultHeroCard = styled.section`
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(270px, 0.44fr);
  gap: clamp(22px, 3vw, 40px);
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 18px;
  background:
    radial-gradient(circle at 83% 48%, rgba(255, 255, 255, 0.92) 0%, transparent 28%),
    radial-gradient(circle at 90% 22%, ${({ $tone }) => $tone?.accentSoft || '#e3f2ff'} 0%, transparent 30%),
    radial-gradient(circle at 5% 96%, rgba(232, 243, 255, 0.72) 0%, transparent 34%),
    linear-gradient(135deg, ${({ $tone }) => $tone?.cardStart || '#ffffff'} 0%, ${({ $tone }) => $tone?.cardMid || '#f5faff'} 48%, ${({ $tone }) => $tone?.cardEnd || '#e8f3ff'} 100%);
  min-height: 390px;
  padding: clamp(38px, 4.8vw, 58px);
  box-shadow:
    0 34px 90px ${({ $tone }) => $tone?.shadow || 'rgba(45, 117, 210, 0.16)'},
    0 14px 34px rgba(28, 72, 120, 0.07);
  backdrop-filter: blur(22px);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    right: 21%;
    top: 17%;
    width: 330px;
    height: 132px;
    border-top: 2px dashed ${({ $tone }) => $tone?.accent || '#2f80ed'};
    border-radius: 50%;
    opacity: 0.13;
    transform: rotate(-10deg);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    right: 12%;
    bottom: 16%;
    width: 190px;
    height: 38px;
    border-bottom: 1px solid ${({ $tone }) => $tone?.accent || '#2f80ed'};
    border-radius: 50%;
    opacity: 0.1;
    transform: rotate(-12deg);
    pointer-events: none;
  }

  > * {
    position: relative;
    z-index: 1;
  }

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const ResultEyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  width: fit-content;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.58);
  padding: 9px 13px;
  color: ${({ $tone }) => $tone?.text || '#1267c9'};
  font-size: 15px;
  font-weight: 950;
`;

const ResultHeadline = styled.h1`
  margin: 18px 0 0;
  color: ${({ $tone }) => $tone?.text || '#1267c9'};
  font-size: clamp(44px, 5.4vw, 72px);
  line-height: 1.05;
  letter-spacing: 0;
`;

const ResultDescription = styled.p`
  max-width: 680px;
  margin: 18px 0 0;
  color: #34405f;
  font-size: 17px;
  line-height: 1.7;
`;

const PercentLine = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin-top: 18px;
`;

const PercentValue = styled.strong`
  color: ${({ $tone }) => $tone?.text || '#1267c9'};
  font-size: clamp(78px, 9.2vw, 118px);
  line-height: 0.95;
  letter-spacing: -0.035em;
`;

const GradeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  border: 1px solid ${({ $tone }) => $tone?.accent || '#1275ea'};
  background: ${({ $tone }) => $tone?.accentSoft || '#e0f2ff'};
  color: ${({ $tone }) => $tone?.text || '#1275ea'};
  padding: 12px 16px;
  font-size: 18px;
  font-weight: 950;
`;

const ResultSideStat = styled.div`
  min-height: 260px;
  display: grid;
  gap: 8px;
  place-items: center;
  border: 1px solid rgba(221, 234, 245, 0.82);
  border-radius: 16px;
  background:
    radial-gradient(circle at 50% 45%, rgba(255, 255, 255, 0.96), rgba(255, 255, 255, 0.52) 64%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.74), rgba(247, 251, 255, 0.58));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.86),
    0 10px 24px rgba(16, 24, 47, 0.035);
  padding: 26px;
`;

const GaugeLabel = styled.div`
  color: #59627f;
  font-size: 12px;
  font-weight: 950;
  letter-spacing: 0.02em;
`;

const GaugeCircle = styled.div`
  width: 178px;
  height: 178px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background:
    conic-gradient(${({ $tone }) => $tone?.accent || '#2f8df4'} ${({ $percent }) => $percent * 3.6}deg, ${({ $tone }) => $tone?.gaugeTrack || '#e7f0f7'} 0deg),
    #ffffff;
  box-shadow:
    inset 0 0 0 13px #ffffff,
    inset 0 0 0 14px rgba(221, 234, 245, 0.82),
    0 18px 34px ${({ $tone }) => $tone?.shadow || 'rgba(45, 117, 210, 0.16)'};
  color: #11172f;
  font-size: 34px;
  font-weight: 900;
`;

const GaugeCaption = styled.div`
  color: ${({ $tone }) => $tone?.text || '#2f80ed'};
  font-size: 13px;
  font-weight: 900;
  opacity: 0.86;
`;

const EvidenceGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const EvidenceCard = styled.article`
  min-height: 158px;
  display: grid;
  align-content: start;
  gap: 14px;
  border: 1px solid rgba(221, 234, 245, 0.92);
  border-radius: 16px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.94), rgba(247, 251, 255, 0.78)),
    rgba(255, 255, 255, 0.84);
  padding: 24px;
  box-shadow: 0 12px 28px rgba(16, 24, 47, 0.055);
  backdrop-filter: blur(12px);
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(186, 210, 236, 0.92);
    box-shadow: 0 18px 38px rgba(16, 24, 47, 0.08);
  }
`;

const EvidenceHead = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #59627f;
  font-size: 14px;
  font-weight: 900;
`;

const EvidenceIcon = styled.span`
  width: 50px;
  height: 50px;
  display: inline-grid;
  place-items: center;
  border: 1px solid rgba(221, 234, 245, 0.84);
  border-radius: 14px;
  color: ${({ $tone }) => $tone || '#1275ea'};
  background:
    radial-gradient(circle at 38% 22%, rgba(255, 255, 255, 0.9), transparent 48%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.96), rgba(232, 243, 255, 0.82));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.86);
`;

const EvidenceValue = styled.strong`
  color: #11172f;
  font-size: clamp(30px, 3.4vw, 42px);
  line-height: 1.1;
  letter-spacing: -0.045em;
`;

const EvidenceSub = styled.span`
  color: #6b7890;
  font-size: 14px;
  font-weight: 760;
`;

const ChartCard = styled.section`
  border: 1px solid rgba(221, 234, 245, 0.92);
  border-radius: 18px;
  background:
    radial-gradient(circle at 86% 18%, rgba(232, 243, 255, 0.62), transparent 28%),
    rgba(255, 255, 255, 0.88);
  padding: 24px;
  box-shadow: 0 18px 40px rgba(28, 72, 120, 0.08);
  backdrop-filter: blur(20px);
`;

const ChartHint = styled.div`
  display: inline-flex;
  align-items: center;
  width: fit-content;
  margin-bottom: 12px;
  border-radius: 999px;
  background: ${({ $tone }) => $tone?.accentSoft || '#e0f2ff'};
  color: ${({ $tone }) => $tone?.text || '#1275ea'};
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 950;
`;

const MethodSection = styled.section`
  display: grid;
  grid-template-columns: minmax(250px, 0.3fr) minmax(0, 1fr);
  gap: 24px;
  border: 1px solid rgba(221, 234, 245, 0.92);
  border-radius: 18px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.82), rgba(247, 251, 255, 0.66)),
    rgba(255, 255, 255, 0.66);
  padding: 30px;
  box-shadow: 0 14px 38px rgba(45, 117, 210, 0.08);
  backdrop-filter: blur(18px);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const MethodIntro = styled.div`
  h2 {
    margin: 0;
    color: #11172f;
    font-size: 32px;
    line-height: 1.14;
    letter-spacing: -0.02em;
  }

  p {
    margin: 12px 0 0;
    color: #59627f;
    line-height: 1.65;
    font-weight: 760;
  }
`;

const MethodGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 1060px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

const MethodCard = styled.article`
  position: relative;
  min-height: 188px;
  border: 1px solid rgba(221, 234, 245, 0.9);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.82);
  padding: 22px;
  box-shadow: 0 10px 28px rgba(16, 24, 47, 0.05);

  svg {
    padding: 9px;
    width: 42px;
    height: 42px;
    border-radius: 14px;
    background: #f7fbff;
    box-shadow: inset 0 0 0 1px rgba(221, 234, 245, 0.82);
  }

  strong {
    display: block;
    margin-top: 14px;
    color: #11172f;
    font-size: 17px;
    line-height: 1.2;
  }

  p {
    margin: 9px 0 0;
    color: #59627f;
    font-size: 14px;
    line-height: 1.58;
  }
`;

const MethodNumber = styled.span`
  position: absolute;
  right: 18px;
  top: 18px;
  color: rgba(18, 117, 234, 0.18);
  font-size: 30px;
  font-weight: 950;
`;

const defaultForm = {
  route: '',
  station: '',
  hour: String(new Date().getHours()),
  month: ''
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

function getMonthLabel(months, value) {
  return months?.find((month) => String(month.value) === String(value))?.label || value || '월 선택';
}

function getTimePeriod(hour) {
  const numericHour = Number(hour);
  if (numericHour >= 5 && numericHour < 11) return 'morning';
  if (numericHour >= 11 && numericHour < 17) return 'day';
  if (numericHour >= 17 && numericHour < 21) return 'evening';
  return 'night';
}

function getCrowdingPercent(passengers) {
  return Math.min(98, Math.max(6, Math.round(Number(passengers || 0) * 3.8)));
}

function getCrowdingLevelFromPercent(percent) {
  if (percent <= 30) return '여유';
  if (percent <= 60) return '보통';
  if (percent <= 80) return '혼잡';
  return '매우 혼잡';
}

function getResultHeadline(level) {
  if (level === '여유') return '지금 타도 괜찮아요';
  if (level === '보통') return '조금 붐빌 수 있어요';
  if (level === '혼잡') return '지금은 다소 붐빌 수 있어요';
  return '가능하면 피하는 게 좋아요';
}

function getResultDescription(level) {
  if (level === '여유') return '현재 예상 혼잡도는 낮은 편이에요. 지금 탑승해도 비교적 여유로울 가능성이 높습니다.';
  if (level === '보통') return '현재 예상 혼잡도는 보통 수준이에요. 좌석 여유는 제한적일 수 있어요.';
  if (level === '혼잡') return '현재 예상 혼잡도가 높은 편이에요. 가능하면 추천 시간대를 확인해보세요.';
  return '현재 예상 혼잡도가 매우 높아요. 가능하다면 다른 시간대 탑승을 추천합니다.';
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
  const [options, setOptions] = useState({ routes: [], stations: [], months: [], defaultMonth: '', hours: [] });
  const [hourly, setHourly] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
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
        sub: form.station ? '혼잡도 확인하기를 눌러 시간대 평균을 확인해보세요.' : '노선과 정류장을 먼저 골라주세요.'
      };
  const selectedMonthLabel = useMemo(
    () => getMonthLabel(options.months, form.month || options.defaultMonth),
    [form.month, options.defaultMonth, options.months]
  );
  const resultPercent = result ? getCrowdingPercent(result.expectedPassengers) : 0;
  const resultLevel = result ? getCrowdingLevelFromPercent(resultPercent) : '보통';
  const resultTone = resultToneMap[resultLevel];
  const averagePassengers = useMemo(
    () => (hourly.length ? hourly.reduce((sum, item) => sum + Number(item.passengers || 0), 0) / hourly.length : 0),
    [hourly]
  );
  const averageDiff = result && averagePassengers
    ? Math.round(((averagePassengers - result.expectedPassengers) / averagePassengers) * 100)
    : 0;
  const normalizedAverageDiff = Math.min(99, Math.max(0, Math.abs(averageDiff)));
  const averageDiffText = averageDiff > 0
    ? `평균보다 ${normalizedAverageDiff}% 낮음`
    : averageDiff < 0
      ? `평균보다 ${normalizedAverageDiff}% 높음`
      : '평균 수준';
  const recommendedTime = result?.betterLater ? `${result.betterLater.hour}시 이후` : '지금 또는 10분 후';
  const recommendedFromHour = result?.betterLater?.hour ? Number(result.betterLater.hour) : Number(form.hour) + 1;
  const resultSummary = `${form.route}번 · ${getStationLabel(form.station)} · ${selectedMonthLabel} · ${form.hour}:00 기준`;
  const chartData = useMemo(
    () => hourly
      .filter((item) => Number(item.hour) >= 5 && Number(item.hour) <= 23)
      .map((item) => {
        const percent = getCrowdingPercent(item.passengers);
        return { ...item, percent, crowding: getCrowdingLevelFromPercent(percent) };
      }),
    [hourly]
  );

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
        hour: searchForm.hour,
        month: searchForm.month || options.defaultMonth
      };
      const hourlyData = await fetchHourly({ route: params.route, station: params.station, month: params.month, dayType: 'all' });
      setHourly(hourlyData);
      return true;
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || '혼잡도 조회에 실패했습니다.');
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
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => setShowSplash(false), prefersReducedMotion ? 950 : 3100);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let ignore = false;

    async function initialize() {
      try {
        const data = await fetchOptions();
        if (ignore) return;

        const selectedMonth = data.defaultMonth || data.months?.at?.(-1)?.value || '';
        const nextForm = {
          route: '',
          station: '',
          hour: data.hours?.includes(new Date().getHours()) ? String(new Date().getHours()) : String(data.hours?.[0] || 8),
          month: ''
        };

        setOptions({ ...data, stations: [] });
        setForm(nextForm);
      } catch (requestError) {
        if (!ignore) {
          setOptions({ routes: [], stations: [], months: [], defaultMonth: '', hours: [] });
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
        const stationData = await fetchStations(form.route, form.month || options.defaultMonth);
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
  }, [form.month, form.route, options.defaultMonth, options.routes]);

  return (
    <Shell $background={stationVisual.background} $position={stationVisual.position} $tone={stationVisual.tone}>
      {showSplash && (
        <SplashOverlay role="presentation">
          <SplashSkip type="button" onClick={() => setShowSplash(false)}>
            건너뛰기
          </SplashSkip>
          <SplashScene aria-hidden="true">
            <SplashRoad>
              <span />
              <span />
              <span />
            </SplashRoad>
            <SplashBusStage>
              <BusImageWrapper>
                <img src="/assets/bus-3d.png" alt="3D bus" />
              </BusImageWrapper>
            </SplashBusStage>
            <SplashLogo>
              <SplashBrand>타도될까</SplashBrand>
              <SplashTagline>서울 버스 시간대별 혼잡도</SplashTagline>
            </SplashLogo>
          </SplashScene>
        </SplashOverlay>
      )}
      <PageWrap>
        <SiteHeader>
          <BrandGroup>
            <BrandLogo>타도될까</BrandLogo>
            <BrandMeta>서울시 공공데이터 기반</BrandMeta>
          </BrandGroup>
          <HeaderNav aria-label="주요 메뉴">
            <a href="#project">프로젝트 소개</a>
            <a href="#method">계산 방식</a>
            <a href="#example">결과 예시</a>
          </HeaderNav>
        </SiteHeader>

        {!hasStarted ? (
          <>
            <SearchHero>
              <HeroText>
                <HeroBadgeRow aria-label="서비스 핵심 정보">
                  <HeroBadge>
                    <Database size={15} aria-hidden="true" />
                    서울시 공공데이터 기반
                  </HeroBadge>
                  <HeroBadge>
                    <BarChart3 size={15} aria-hidden="true" />
                    노선·정류장별 시간대 비교
                  </HeroBadge>
                  <HeroBadge>
                    <Clock3 size={15} aria-hidden="true" />
                    현재 시간 기준 제공
                  </HeroBadge>
                </HeroBadgeRow>
                <HeroTitle>지금 타도 괜찮을까요?</HeroTitle>
                <HeroCopy>노선과 정류장을 선택하면 공공 교통 데이터를 바탕으로 지금 버스를 타도 괜찮을지 바로 판단해드려요.</HeroCopy>
                {error && <ErrorBox>{error}</ErrorBox>}
                <SearchCard>
                  <BusSearchBox
                    form={form}
                    setForm={setForm}
                    onSubmit={startExperience}
                    loading={loading}
                    options={options}
                    showMonth
                    submitLabel="혼잡도 확인하기"
                    variant="flat"
                  />
                </SearchCard>
              </HeroText>

              <HeroVisual aria-hidden="true">
                <RouteBackdrop>
                  <svg viewBox="0 0 640 460" preserveAspectRatio="none">
                    <path d="M31 278 C112 214 183 245 253 210 C331 171 411 174 495 124 C555 88 598 107 626 145" fill="none" stroke="rgba(123, 181, 245, 0.28)" strokeWidth="8" strokeLinecap="round" />
                    <path d="M21 316 C99 286 152 323 232 294 C325 261 399 274 492 234 C555 207 602 220 638 246" fill="none" stroke="rgba(123, 181, 245, 0.2)" strokeWidth="4" strokeLinecap="round" />
                    <path d="M83 152 C174 80 251 96 321 132 C394 170 470 88 572 120" fill="none" stroke="rgba(156, 170, 199, 0.18)" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="116" cy="245" r="12" fill="rgba(47, 141, 244, 0.18)" stroke="rgba(47, 141, 244, 0.34)" strokeWidth="5" />
                    <circle cx="349" cy="179" r="8" fill="#ffffff" stroke="rgba(47, 141, 244, 0.34)" strokeWidth="5" />
                    <circle cx="515" cy="123" r="16" fill="rgba(255,255,255,0.74)" stroke="rgba(47, 141, 244, 0.18)" strokeWidth="6" />
                    <path d="M515 141 L515 186" stroke="rgba(47, 141, 244, 0.2)" strokeWidth="5" strokeLinecap="round" />
                  </svg>
                </RouteBackdrop>
                <HeroRoad>
                  <span />
                  <span />
                  <span />
                </HeroRoad>
                <BusHeroImage src="/assets/bus-3d.png" alt="" />
              </HeroVisual>
            </SearchHero>

            <SectionAnchor id="project" />
            <FeatureGrid>
              <FeatureCard>
                <FeatureIcon><Clock3 size={24} aria-hidden="true" /></FeatureIcon>
                <div>
                  <FeatureTitle>빠른 확인</FeatureTitle>
                  <FeatureText>노선과 정류장 선택 후 바로 결과 확인</FeatureText>
                </div>
              </FeatureCard>
              <FeatureCard>
                <FeatureIcon><Database size={24} aria-hidden="true" /></FeatureIcon>
                <div>
                  <FeatureTitle>데이터 기반</FeatureTitle>
                  <FeatureText>서울시 승하차·노선·정류장 데이터 활용</FeatureText>
                </div>
              </FeatureCard>
              <FeatureCard>
                <FeatureIcon><Gauge size={24} aria-hidden="true" /></FeatureIcon>
                <div>
                  <FeatureTitle>직관적 판단</FeatureTitle>
                  <FeatureText>혼잡도 수치와 추천 시간대로 안내</FeatureText>
                </div>
              </FeatureCard>
            </FeatureGrid>

            <HomeStoryGrid>
              <StoryPanel id="method">
                <h2>사용 방법 3단계</h2>
                <p>노선, 정류장, 기준 월을 고르면 시간대별 승차 패턴을 바탕으로 지금 타도 괜찮은지 판단합니다.</p>
                <StepList>
                  <StepCard>
                    <strong>1. 노선 선택</strong>
                    <span>서울 버스 번호를 입력하거나 목록에서 고릅니다.</span>
                  </StepCard>
                  <StepCard>
                    <strong>2. 정류장 선택</strong>
                    <span>해당 노선이 지나는 정류장을 기준으로 좁힙니다.</span>
                  </StepCard>
                  <StepCard>
                    <strong>3. 결과 확인</strong>
                    <span>혼잡도, 예상 인원, 추천 시간대를 한 화면에서 봅니다.</span>
                  </StepCard>
                </StepList>
              </StoryPanel>

              <RoutePanel>
                <h2>많이 찾는 노선</h2>
                <p>예시 조건을 눌러 검색 폼에 빠르게 채워볼 수 있습니다.</p>
                <RouteList>
                  {popularRoutes.map((item) => (
                    <RouteItem
                      key={`${item.route}-${item.station}`}
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, route: item.route, station: item.station }))}
                    >
                      <strong>{item.route}</strong>
                      <span>{item.station}</span>
                      <small>{item.note}</small>
                    </RouteItem>
                  ))}
                </RouteList>
              </RoutePanel>
            </HomeStoryGrid>

            <ExamplePreview id="example">
              <ExamplePreviewHeader>
                <div>
                  <h2>결과 예시</h2>
                  <p>캡처했을 때 서비스 성격이 드러나도록 혼잡도 수치, 상태 색상, 그래프 흐름을 함께 보여줍니다.</p>
                </div>
                <ColorRuleList aria-label="혼잡도 색상 기준">
                  {crowdingRules.map((rule) => (
                    <ColorRule key={rule.label} $color={rule.color}>
                      {rule.label} {rule.range}
                    </ColorRule>
                  ))}
                </ColorRuleList>
              </ExamplePreviewHeader>
              <MiniResultMock>
                <MiniResultCard>
                  <small>1218번 · 남대문중학교 · 2026년 5월 · 15:00 기준</small>
                  <strong>지금은 다소 붐빌 수 있어요</strong>
                  <p>혼잡도 68% · 예상 18명 · 평균보다 24% 높음</p>
                </MiniResultCard>
                <MiniBars aria-hidden="true">
                  <MiniBar $height={34} $color="#00a884" />
                  <MiniBar $height={42} $color="#00a884" />
                  <MiniBar $height={58} $color="#4ba3f2" />
                  <MiniBar $height={76} $color="#ff9f43" />
                  <MiniBar $height={68} $color="#ff9f43" />
                  <MiniBar $height={46} $color="#4ba3f2" />
                  <MiniBar $height={88} $color="#ff6b6b" />
                  <MiniBar $height={54} $color="#4ba3f2" />
                </MiniBars>
              </MiniResultMock>
            </ExamplePreview>
          </>
        ) : (
          <ResultPage>
            <SummaryBar id="project">
              <SummaryMeta>
                <SummaryLabel>선택 조건</SummaryLabel>
                <SummaryText>{resultSummary}</SummaryText>
                <SummaryChips aria-label="현재 조회 조건 상세">
                  <SummaryChip><BusFront size={14} aria-hidden="true" />{form.route}번</SummaryChip>
                  <SummaryChip><MapPin size={14} aria-hidden="true" />{getStationLabel(form.station)}</SummaryChip>
                  <SummaryChip><CalendarDays size={14} aria-hidden="true" />{selectedMonthLabel}</SummaryChip>
                  <SummaryChip><Clock3 size={14} aria-hidden="true" />{String(form.hour).padStart(2, '0')}:00 기준</SummaryChip>
                </SummaryChips>
              </SummaryMeta>
              <SecondaryButton type="button" onClick={() => setHasStarted(false)}>
                <RotateCcw size={16} aria-hidden="true" />
                조건 수정하기
              </SecondaryButton>
            </SummaryBar>

            {error && <ErrorBox>{error}</ErrorBox>}

            <ResultHeroCard id="example" $tone={resultTone}>
              <div>
                <ResultEyebrow $tone={resultTone}>현재 시간 기준 판단</ResultEyebrow>
                <ResultHeadline $tone={resultTone}>{getResultHeadline(resultLevel)}</ResultHeadline>
                <PercentLine>
                  <PercentValue $tone={resultTone}>{resultPercent}%</PercentValue>
                  <GradeBadge $tone={resultTone}>
                    <Smile size={18} aria-hidden="true" />
                    {resultLevel}
                  </GradeBadge>
                </PercentLine>
                <ResultDescription>{getResultDescription(resultLevel)}</ResultDescription>
              </div>
              <ResultSideStat aria-label={`예상 혼잡도 ${resultPercent}%`}>
                <GaugeLabel>예상 혼잡도</GaugeLabel>
                <GaugeCircle $percent={resultPercent} $tone={resultTone}>{resultPercent}%</GaugeCircle>
                <GaugeCaption $tone={resultTone}>{resultTone.caption}</GaugeCaption>
              </ResultSideStat>
            </ResultHeroCard>

            <EvidenceGrid>
              <EvidenceCard>
                <EvidenceHead>
                  <EvidenceIcon $tone={resultTone.text}><Users size={22} aria-hidden="true" /></EvidenceIcon>
                  예상 승차 인원
                </EvidenceHead>
                <EvidenceValue>{result?.expectedPassengers ?? 0}명</EvidenceValue>
                <EvidenceSub>현재 시간 기준 예상 인원</EvidenceSub>
              </EvidenceCard>
              <EvidenceCard>
                <EvidenceHead>
                  <EvidenceIcon $tone="#00a884"><TrendingDown size={22} aria-hidden="true" /></EvidenceIcon>
                  평균 대비
                </EvidenceHead>
                <EvidenceValue>{averageDiffText}</EvidenceValue>
                <EvidenceSub>하루 평균 승차 패턴 기준</EvidenceSub>
              </EvidenceCard>
              <EvidenceCard>
                <EvidenceHead>
                  <EvidenceIcon $tone="#4ba3f2"><Clock3 size={22} aria-hidden="true" /></EvidenceIcon>
                  추천 시간대
                </EvidenceHead>
                <EvidenceValue>{recommendedTime}</EvidenceValue>
                <EvidenceSub>혼잡도가 내려가는 다음 구간</EvidenceSub>
              </EvidenceCard>
            </EvidenceGrid>

            <ChartCard>
              <ExamplePreviewHeader>
                <div>
                  <h2>시간대별 혼잡도 그래프</h2>
                  <p>선택한 시간대와 추천 구간을 함께 표시해 포트폴리오 캡처에서도 판단 기준이 드러납니다.</p>
                </div>
                <ColorRuleList aria-label="혼잡도 색상 기준">
                  {crowdingRules.map((rule) => (
                    <ColorRule key={rule.label} $color={rule.color}>
                      {rule.label} {rule.range}
                    </ColorRule>
                  ))}
                </ColorRuleList>
              </ExamplePreviewHeader>
              <ChartHint $tone={resultTone}>추천 구간: {recommendedTime}</ChartHint>
              <CrowdingChart
                data={chartData}
                selectedHour={Number(form.hour)}
                recommendedFromHour={recommendedFromHour}
                showHeader={false}
                onSelectHour={(hour) => setForm((current) => ({ ...current, hour: String(hour) }))}
              />
            </ChartCard>

            <MethodSection id="method">
              <MethodIntro>
                <h2>어떻게 계산했나요?</h2>
                <p>공공 교통 데이터를 사용자가 이해하기 쉬운 판단 문장과 그래프로 바꿉니다.</p>
              </MethodIntro>
              <MethodGrid>
                <MethodCard>
                  <MethodNumber>01</MethodNumber>
                  <Target size={24} color="#1275ea" aria-hidden="true" />
                  <strong>문제 정의</strong>
                  <p>버스를 탈 때 특정 노선과 정류장이 지금 얼마나 붐비는지 알기 어렵습니다.</p>
                </MethodCard>
                <MethodCard>
                  <MethodNumber>02</MethodNumber>
                  <Database size={24} color="#12a46f" aria-hidden="true" />
                  <strong>사용 데이터</strong>
                  <p>서울시 승하차 자료를 월의 일수로 나눠 시간대별 일평균 기준을 만듭니다.</p>
                </MethodCard>
                <MethodCard>
                  <MethodNumber>03</MethodNumber>
                  <BarChart3 size={24} color="#7b6cf6" aria-hidden="true" />
                  <strong>혼잡도 계산</strong>
                  <p>시간대별 일평균 승차 인원을 기준 구간과 비교해 혼잡 단계를 계산합니다.</p>
                </MethodCard>
                <MethodCard>
                  <MethodNumber>04</MethodNumber>
                  <Heart size={24} color="#e65091" aria-hidden="true" />
                  <strong>사용자 가치</strong>
                  <p>사용자가 더 여유로운 시간대를 선택할 수 있도록 돕습니다.</p>
                </MethodCard>
              </MethodGrid>
            </MethodSection>
          </ResultPage>
        )}
      </PageWrap>
    </Shell>
  );
}

export default BusCrowdingPage;
