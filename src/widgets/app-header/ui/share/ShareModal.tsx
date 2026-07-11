import React from "react";
import styled from "styled-components";
import { QRCodeSVG } from "qrcode.react";
import CopyIcon from "@/shared/assets/images/copy.svg";
import { useShareRoomInit } from "../../model";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

const ModalBox = styled.div`
  background: #fff;
  border-radius: 0.52vw;
  width: 18vw;
  height: 58.5vh;
  padding: 1vw;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
`;

const Title = styled.h2`
  font-size: 1.05rem;
  font-weight: 600;
  margin-top: 0.5vw;
`;

const Label = styled.p`
  font-size: 0.75rem;
  font-weight: 500;
  margin: 0 0 6px 0;
  color: #000000;
`;

const InputBox = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  border-radius: 6px;
  border: 1px solid #eaeaea;
  background: #fff;
  overflow: hidden;

  input {
    flex: 1;
    border: none;
    background: transparent;
    outline: none;
    font-size: 0.62rem;
    color: #000000;
    padding: 0.5vw 0.7vw;
  }
`;

const CopyButton = styled.button`
  background: #303030;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.2vw;
  height: 2vw;
  cursor: pointer;
  border-radius: 0 8px 8px 0;

  img {
    width: 1.2vw;
    height: auto;
  }

  &:hover {
    background: #000;
  }
`;

const QrBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  margin: 0;
  width: 100%;

  img {
    width: 100%;
    height: auto;
    aspect-ratio: 1;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding-top: 0.1vw;
    margin: 0;
    background: #fff;
  }

  .qr-placeholder {
    width: 100%;
    aspect-ratio: 1;
    background: #f1f1f1;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    color: #888;
    padding: 0;
    margin: 0;
  }
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;
  border: none;
  background: none;
  font-size: 1rem;
  cursor: pointer;
  color: #888;

  &:hover {
    color: #555;
  }
`;

interface ShareModalProps {
  roomData?: any;
  totalPages?: number;
  onClose: () => void;
}

const ShareModal = ({ roomData, totalPages = 10, onClose }: ShareModalProps) => {
  const { sessionLink, loading, error } = useShareRoomInit({ roomData, totalPages });

  const handleCopy = () => {
    if (!sessionLink) return;
    navigator.clipboard.writeText(sessionLink);
    alert("링크가 복사되었습니다!");
  };

  return (
    <Overlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <CloseBtn onClick={onClose}>✕</CloseBtn>
        <Title>공유하기</Title>

        {loading ? (
          <div style={{ textAlign: "center", marginTop: "5vh" }}>생성 중...</div>
        ) : error ? (
          <div style={{ color: "red", textAlign: "center", marginTop: "5vh" }}>{error}</div>
        ) : (
          <>
            <div>
              <Label>세션 링크</Label>
              <InputBox>
                <input value={sessionLink} readOnly />
                <CopyButton onClick={handleCopy}>
                  <img src={CopyIcon} alt="copy" />
                </CopyButton>
              </InputBox>
            </div>

            <div>
              <Label>QR 코드 링크</Label>
              <QrBox>
                {sessionLink ? (
                  <QRCodeSVG
                    value={sessionLink}
                    size={240}
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                    level="M"
                    includeMargin
                  />
                ) : (
                  <div className="qr-placeholder">QR 자리</div>
                )}
              </QrBox>
            </div>
          </>
        )}
      </ModalBox>
    </Overlay>
  );
};

export default ShareModal;
