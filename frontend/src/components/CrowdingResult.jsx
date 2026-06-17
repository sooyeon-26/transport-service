import React from 'react';
import styled from 'styled-components';
import { AlertTriangle, CheckCircle2, Clock3, Route, Sparkles } from 'lucide-react';

const crowdingColor = {
  여유: '#bff3de',
  보통: '#dff1ff',
  혼잡: '#ffe0c4',
  '매우 혼잡': '#ece8ff'
};

const crowdingTextColor = {
  여유: '#22644f',
  보통: '#2878d8',
  혼잡: '#9a5721',
  '매우 혼잡': '#5a4bd8'
};

const Panel = styled.section`
  min-height: 100%;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(246, 249, 255, 0.76)),
    rgba(255, 255, 255, 0.74);
  box-shadow: 0 24px 70px rgba(45, 54, 82, 0.18);
  backdrop-filter: blur(24px);
  overflow: hidden;
`;

const Inner = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(260px, 0.75fr);
  min-height: 360px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const Main = styled.div`
  padding: clamp(24px, 4vw, 42px);
`;

const Aside = styled.aside`
  display: grid;
  gap: 10px;
  align-content: start;
  border-left: 1px solid rgba(218, 224, 241, 0.86);
  background: rgba(250, 251, 255, 0.72);
  padding: 18px;

  @media (max-width: 860px) {
    border-left: 0;
    border-top: 1px solid rgba(218, 224, 241, 0.86);
  }
`;

const Eyebrow = styled.p`
  margin: 0 0 14px;
  color: #69718d;
  font-size: 12px;
  font-weight: 900;
`;

const Question = styled.h2`
  max-width: 640px;
  margin: 0;
  color: #27253d;
  font-size: clamp(34px, 4.8vw, 64px);
  line-height: 1.02;
  letter-spacing: 0;
`;

const MainLine = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
  margin-top: 22px;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  padding: 10px 14px;
  color: ${({ $label }) => crowdingTextColor[$label] || '#252943'};
  background: ${({ $label }) => crowdingColor[$label] || '#dee0ed'};
  font-size: 15px;
  font-weight: 950;
`;

const BigNumber = styled.strong`
  color: #27253d;
  font-size: clamp(54px, 8vw, 92px);
  line-height: 0.92;
`;

const PassengerUnit = styled.span`
  margin-left: 6px;
  color: #69718d;
  font-size: 18px;
  font-weight: 900;
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 22px;
`;

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 1px solid rgba(218, 224, 241, 0.95);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: #464b65;
  padding: 8px 11px;
  font-size: 13px;
  font-weight: 850;
`;

const Recommendation = styled.p`
  max-width: 580px;
  margin: 24px 0 0;
  color: #464b65;
  font-size: 17px;
  line-height: 1.65;
`;

const WaitInsight = styled.div`
  max-width: 580px;
  margin-top: 16px;
  border: 1px solid rgba(143, 216, 255, 0.75);
  border-radius: 8px;
  background: rgba(247, 251, 255, 0.82);
  padding: 13px 14px;
  color: #27253d;
  font-weight: 850;
  line-height: 1.55;
`;

const MiniTitle = styled.p`
  margin: 0 0 2px;
  color: #69718d;
  font-size: 12px;
  font-weight: 900;
`;

const InsightCard = styled.div`
  border: 1px solid rgba(218, 224, 241, 0.95);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.72);
  padding: 13px;
`;

const InsightHead = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  color: #69718d;
  font-size: 12px;
  font-weight: 850;
`;

const InsightValue = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-top: 8px;
  color: #27253d;
  font-size: 18px;
  font-weight: 950;
`;

const QuietList = styled.div`
  display: grid;
  gap: 8px;
  margin-top: 8px;
`;

const QuietItem = styled.button`
  display: grid;
  grid-template-columns: 28px 1fr auto;
  align-items: center;
  gap: 10px;
  width: 100%;
  border: 1px solid rgba(218, 224, 241, 0.95);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.62);
  padding: 10px;
  color: #27253d;
  text-align: left;
`;

const Rank = styled.span`
  width: 28px;
  height: 28px;
  display: inline-grid;
  place-items: center;
  border-radius: 999px;
  background: #edf8ff;
  color: #2878d8;
  font-size: 13px;
  font-weight: 950;
`;

const Sub = styled.span`
  display: block;
  margin-top: 2px;
  color: #69718d;
  font-size: 12px;
  font-weight: 800;
`;

function CrowdingResult({ result, quietHours, peakHours, selectedHour, onSelectHour }) {
  if (!result) {
    return (
      <Panel>
        <Inner>
          <Main>
            <Eyebrow>BOARDING CHECK</Eyebrow>
            <Question>노선과 시간을 고르면 바로 판단해드려요.</Question>
            <Recommendation>처음 화면에서 조건을 선택하면 이 영역이 탑승 추천으로 바뀝니다.</Recommendation>
          </Main>
        </Inner>
      </Panel>
    );
  }

  const selectedQuiet = result.predictedCrowding === '여유';
  const best = result.bestHour || quietHours[0];
  const peak = peakHours[0];

  return (
    <Panel>
      <Inner>
        <Main>
          <Eyebrow>BOARDING CHECK · {selectedHour}시 기준</Eyebrow>
          <Question>
            {selectedQuiet ? '지금 타도 괜찮아요.' : `${result.predictedCrowding}해질 수 있어요.`}
          </Question>
          <MainLine>
            <Badge $label={result.predictedCrowding}>
              {selectedQuiet ? <CheckCircle2 size={18} aria-hidden="true" /> : <AlertTriangle size={18} aria-hidden="true" />}
              {result.predictedCrowding}
            </Badge>
            <BigNumber>
              {result.expectedPassengers}
              <PassengerUnit>명 예상</PassengerUnit>
            </BigNumber>
          </MainLine>
          <Chips>
            <Chip>
              <Route size={14} aria-hidden="true" />
              {result.route}번
            </Chip>
            <Chip>
              <Clock3 size={14} aria-hidden="true" />
              {result.hour}시 출발
            </Chip>
            <Chip>{result.mood}</Chip>
          </Chips>
          <Recommendation>{result.recommendation}</Recommendation>
          <WaitInsight>조금 기다리면? {result.waitInsight}</WaitInsight>
        </Main>

        <Aside>
          <MiniTitle>RECOMMENDATION</MiniTitle>
          {best && (
            <InsightCard>
              <InsightHead>
                <Sparkles size={15} aria-hidden="true" />
                가장 좋은 시간
              </InsightHead>
              <InsightValue>
                <span>{best.hour}시 · {best.passengers}명</span>
                <Badge $label={best.crowding}>{best.crowding}</Badge>
              </InsightValue>
            </InsightCard>
          )}
          {peak && (
            <InsightCard>
              <InsightHead>
                <Clock3 size={15} aria-hidden="true" />
                피크 시간
              </InsightHead>
              <InsightValue>
                <span>{peak.hour}시 · {peak.passengers}명</span>
                <Badge $label={peak.crowding}>{peak.crowding}</Badge>
              </InsightValue>
            </InsightCard>
          )}
          <MiniTitle>QUIET HOURS</MiniTitle>
          <QuietList>
            {quietHours.slice(0, 3).map((item, index) => (
              <QuietItem key={item.hour} type="button" onClick={() => onSelectHour?.(item.hour)}>
                <Rank>{index + 1}</Rank>
                <span>
                  {item.hour}시
                  <Sub>{item.passengers}명 예상</Sub>
                </span>
                <Badge $label={item.crowding}>{item.crowding}</Badge>
              </QuietItem>
            ))}
          </QuietList>
        </Aside>
      </Inner>
    </Panel>
  );
}

export default CrowdingResult;
