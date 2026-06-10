import React from 'react';
import styled from 'styled-components';
import { AlertTriangle, BusFront, Clock3, UsersRound } from 'lucide-react';

const crowdingColor = {
  여유: '#17895b',
  보통: '#2f7fc1',
  혼잡: '#c47a17',
  '매우 혼잡': '#c7362f'
};

const Grid = styled.section`
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 16px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const ResultCard = styled.article`
  border: 1px solid #d8e2ea;
  border-radius: 8px;
  background: #ffffff;
  padding: 20px;
  min-height: 220px;
  box-shadow: 0 8px 24px rgba(26, 48, 64, 0.07);
`;

const Muted = styled.p`
  margin: 0;
  color: #647789;
  font-size: 13px;
  font-weight: 700;
`;

const MainLine = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border-radius: 999px;
  padding: 9px 13px;
  color: ${({ $label }) => crowdingColor[$label] || '#415466'};
  background: ${({ $label }) => `${crowdingColor[$label] || '#415466'}18`};
  font-size: 16px;
  font-weight: 900;
`;

const BigNumber = styled.strong`
  color: #15212c;
  font-size: 42px;
  line-height: 1;
`;

const InfoRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 20px;

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

const Info = styled.div`
  border: 1px solid #e2e9ef;
  border-radius: 8px;
  padding: 12px;
  background: #f9fbfd;
`;

const InfoTitle = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  color: #647789;
  font-size: 12px;
  font-weight: 800;
`;

const InfoValue = styled.div`
  margin-top: 7px;
  color: #172634;
  font-size: 17px;
  font-weight: 900;
`;

const Recommendation = styled.p`
  margin: 18px 0 0;
  color: #33485a;
  line-height: 1.6;
`;

const TopList = styled.ol`
  list-style: none;
  padding: 0;
  margin: 16px 0 0;
  display: grid;
  gap: 10px;
`;

const TopItem = styled.li`
  display: grid;
  grid-template-columns: 34px 1fr auto;
  align-items: center;
  gap: 10px;
  border: 1px solid #e2e9ef;
  border-radius: 8px;
  padding: 11px;
  background: #f9fbfd;
`;

const Rank = styled.span`
  width: 28px;
  height: 28px;
  display: inline-grid;
  place-items: center;
  border-radius: 50%;
  background: #e7f1fa;
  color: #1167b1;
  font-weight: 900;
`;

function CrowdingResult({ result, topHours }) {
  if (!result) {
    return (
      <Grid>
        <ResultCard>
          <Muted>예측 결과</Muted>
          <MainLine>
            <Badge $label="보통">검색 조건을 입력하세요</Badge>
          </MainLine>
          <Recommendation>샘플 데이터 기준으로 143 강남역, 472 홍대입구, 7016 시청역 등을 바로 테스트할 수 있습니다.</Recommendation>
        </ResultCard>
        <ResultCard>
          <Muted>가장 혼잡한 시간대 TOP 3</Muted>
          <Recommendation>예측 후 선택 노선과 정류장의 피크 시간대가 표시됩니다.</Recommendation>
        </ResultCard>
      </Grid>
    );
  }

  return (
    <Grid>
      <ResultCard>
        <Muted>예측 혼잡도</Muted>
        <MainLine>
          <Badge $label={result.predictedCrowding}>
            <AlertTriangle size={18} aria-hidden="true" />
            {result.predictedCrowding}
          </Badge>
          <BigNumber>{result.expectedPassengers}명</BigNumber>
        </MainLine>
        <InfoRow>
          <Info>
            <InfoTitle>
              <BusFront size={15} aria-hidden="true" />
              노선
            </InfoTitle>
            <InfoValue>{result.route}</InfoValue>
          </Info>
          <Info>
            <InfoTitle>
              <Clock3 size={15} aria-hidden="true" />
              시간대
            </InfoTitle>
            <InfoValue>{result.hour}시</InfoValue>
          </Info>
          <Info>
            <InfoTitle>
              <UsersRound size={15} aria-hidden="true" />
              예상 승차
            </InfoTitle>
            <InfoValue>{result.expectedPassengers}명</InfoValue>
          </Info>
        </InfoRow>
        <Recommendation>{result.recommendation}</Recommendation>
      </ResultCard>

      <ResultCard>
        <Muted>가장 혼잡한 시간대 TOP 3</Muted>
        <TopList>
          {topHours.map((item, index) => (
            <TopItem key={item.hour}>
              <Rank>{index + 1}</Rank>
              <div>
                <InfoValue>{item.hour}시</InfoValue>
                <Muted>{item.passengers}명 예상</Muted>
              </div>
              <Badge $label={item.crowding}>{item.crowding}</Badge>
            </TopItem>
          ))}
        </TopList>
      </ResultCard>
    </Grid>
  );
}

export default CrowdingResult;
