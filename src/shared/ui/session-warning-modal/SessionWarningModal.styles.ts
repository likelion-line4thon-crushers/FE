import styled from "styled-components";

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.6);
`;

export const Dialog = styled.div`
  inline-size: fit-content;
  max-inline-size: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-radius: 16px;
  background: #fff;
`;

export const CloseBar = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 13px 20px 12px;
  background: #fff;
`;

export const CloseButton = styled.button`
  inline-size: 32px;
  block-size: 32px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;

  img {
    inline-size: 100%;
    block-size: 100%;
    display: block;
  }
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 0 32px;
  background: #fff;
`;

export const Mascot = styled.img`
  inline-size: min(80px, 28vw);
  block-size: auto;
  display: block;
`;

export const TextGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  inline-size: 100%;
  text-align: center;
  word-break: keep-all;
`;

export const Title = styled.h2`
  margin: 0;
  color: #111;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: -0.025em;
`;

export const Description = styled.p`
  margin: 0;
  color: #505050;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.45;
  letter-spacing: -0.025em;
`;

export const Footer = styled.div<{ $hasSecondary?: boolean }>`
  display: flex;
  justify-content: center;
  padding: ${({ $hasSecondary }) => ($hasSecondary ? "20px 32px 32px" : "20px 50px 32px")};
  background: #fff;
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  inline-size: 100%;

  > button {
    flex: 1 1 0;
    min-inline-size: 0;
  }
`;

export const ConfirmButton = styled.button`
  inline-size: 100%;
  min-block-size: 36px;
  padding: 8px 12px;
  border: 0;
  border-radius: 3px;
  background: #303030;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.45;
  letter-spacing: -0.025em;
  cursor: pointer;
`;

export const SecondaryButton = styled.button`
  min-block-size: 36px;
  padding: 8px 12px;
  border: 1px solid #eaeaea;
  border-radius: 3px;
  background: #fff;
  color: #303030;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.45;
  letter-spacing: -0.025em;
  cursor: pointer;
`;
