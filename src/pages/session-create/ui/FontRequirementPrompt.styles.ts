import styled from "styled-components";

// 슬라이드 로딩 화면(SessionLoadingOverlay, z-index 9999) 위에 뜨도록 그보다 높게 둔다.
export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.6);
`;

// 확인 모달은 폰트 모달(Overlay, z-index 10000) 위에 뜬다.
export const ConfirmOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.45);
`;

export const Dialog = styled.div`
  inline-size: min(440px, 100%);
  max-block-size: min(88vh, 760px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  background: #fff;
`;

export const Content = styled.div`
  flex: 1 1 auto;
  min-block-size: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 32px 32px 0;
`;

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

export const Mascot = styled.img`
  inline-size: min(72px, 24vw);
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

  b {
    color: #e74d07;
    font-weight: 600;
  }
`;

export const Resolved = styled.p`
  margin: 0;
  color: #1a7f37;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.45;
  letter-spacing: -0.025em;
`;

export const ListWrap = styled.div`
  position: relative;
  inline-size: 100%;
`;

// 목록이 넘칠 때 하단에 살짝 겹쳐, 더 스크롤할 내용이 있음을 알리는 그라데이션.
export const ScrollFade = styled.div`
  position: absolute;
  inset-inline: 1px;
  inset-block-end: 1px;
  block-size: 44px;
  border-end-start-radius: 10px;
  border-end-end-radius: 10px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0), #fff);
  pointer-events: none;
`;

export const FontList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  inline-size: 100%;
  border: 1px solid #eaeaea;
  border-radius: 10px;
  max-block-size: 264px;
  overflow-y: auto;
  overscroll-behavior: contain;

  /* 디자인 시스템에 맞춘 얇은 스크롤바 */
  scrollbar-width: thin;
  scrollbar-color: #d9d9d9 transparent;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: #d9d9d9;
    border-radius: 999px;
    border: 2px solid #fff;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;

export const FontRow = styled.li`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 14px;
  border-block-end: 1px solid #f2f2f2;
  transition: background 0.12s;

  &:last-child {
    border-block-end: 0;
  }

  &:hover {
    background: #fafafa;
  }
`;

export const FontRowMain = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const SubstituteNote = styled.span`
  color: #8a8a8a;
  font-size: 12px;
  letter-spacing: -0.02em;
  word-break: break-word;
`;

export const WarningNote = styled.span`
  color: #c23c0a;
  font-size: 12px;
  letter-spacing: -0.02em;
  word-break: break-word;
`;

export const FontName = styled.span`
  color: #303030;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.025em;
  word-break: break-word;
`;

export const StatusChip = styled.span<{ $missing: boolean }>`
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: -0.02em;
  white-space: nowrap;
  color: ${({ $missing }) => ($missing ? "#c23c0a" : "#1a7f37")};
  background: ${({ $missing }) => ($missing ? "#fdeee7" : "#eaf6ec")};
`;

export const RowRight = styled.div`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const UploadButton = styled.button`
  min-block-size: 28px;
  padding: 4px 10px;
  border: 1px solid #303030;
  border-radius: 3px;
  background: #fff;
  color: #303030;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: -0.025em;
  white-space: nowrap;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #303030;
    color: #fff;
  }

  &:disabled {
    border-color: #dcdcdc;
    color: #b8b8b8;
    cursor: not-allowed;
  }
`;

export const HiddenInput = styled.input`
  display: none;
`;

export const Hint = styled.p`
  margin: 0;
  color: #8a8a8a;
  font-size: 12px;
  letter-spacing: -0.02em;
  text-align: center;
`;

export const ErrorText = styled.p`
  margin: 0;
  color: #e74d07;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.025em;
  text-align: center;
`;

export const Footer = styled.div`
  flex: 0 0 auto;
  display: flex;
  gap: 8px;
  padding: 20px 32px 32px;
  background: #fff;

  > button {
    flex: 1 1 0;
    min-inline-size: 0;
  }
`;

export const ConfirmButton = styled.button`
  min-block-size: 40px;
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

  &:disabled {
    background: #c9c9c9;
    cursor: not-allowed;
  }
`;

export const SecondaryButton = styled.button`
  min-block-size: 40px;
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

  &:disabled {
    color: #b8b8b8;
    cursor: not-allowed;
  }
`;
