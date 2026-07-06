import styled from "styled-components";
import StarImage from "@/shared/assets/images/AI/Star.png";

interface SatisfactionCardProps {
  averageRating: number;
}

export function SatisfactionCard({ averageRating }: SatisfactionCardProps) {
  return (
    <Card>
      <Label>세션 만족도 평점</Label>
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
  padding: 1.6vh 1.4vw;
  border: 0.1vw solid #eaeaea;
  border-radius: 0.8vw;
  background: #fff;
`;

const Label = styled.span`
  font-size: clamp(14px, 1vw, 18px);
  font-weight: 600;
  color: #303030;
`;

const Score = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4vw;
  color: #303030;
  img {
    width: clamp(16px, 1.2vw, 22px);
    height: auto;
  }
  strong {
    font-size: clamp(15px, 1.1vw, 20px);
    font-weight: 700;
  }
  span {
    font-size: clamp(12px, 0.85vw, 14px);
    color: #767676;
  }
`;
