import styled from "styled-components";
import SatisfyImage from "@/shared/assets/images/AI/Satisfy.png";
import StarImage from "@/shared/assets/images/AI/Star.png";

interface SatisfactionCardProps {
  averageRating: number;
}

export function SatisfactionCard({ averageRating }: SatisfactionCardProps) {
  return (
    <Card>
      <LeftGroup>
        <img src={SatisfyImage} alt="" />
        <Label>세션 만족도 평점</Label>
      </LeftGroup>
      <Score>
        <img src={StarImage} alt="" />
        <strong>{averageRating.toFixed(1)}점</strong>
        <span>/ 5점</span>
      </Score>
    </Card>
  );
}

export default SatisfactionCard;

const Card = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1vw;
  padding: 2vh 1.4vw;
  border: 0.13vw solid #eaeaea;
  border-radius: 16px;
  background: #fff;
`;

const LeftGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.6vw;
  img {
    width: clamp(22px, 1.8vw, 32px);
    height: auto;
  }
`;

const Label = styled.span`
  font-size: clamp(15px, 1.2vw, 22px);
  font-weight: 600;
  color: #5c5c5c;
  letter-spacing: -0.5px;
`;

const Score = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4vw;
  img {
    width: clamp(18px, 1.5vw, 28px);
    height: auto;
  }
  strong {
    font-size: clamp(16px, 1.2vw, 22px);
    font-weight: 600;
    color: #303030;
  }
  span {
    font-size: clamp(12px, 0.9vw, 15px);
    color: #999999;
  }
`;
