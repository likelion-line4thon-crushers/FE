import React, { useEffect, useState } from "react";
import styled from "styled-components";
import CopyIcon from "../../assets/images/copy.svg";
import { createRoom } from "../../services/roomService";

/* ============ 스타일 ============ */
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
  height: 50vh;
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
  border: 1px solid #EAEAEA;
  background: #FFF;
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
  padding-top: 4px;

  img {
    width: 8vw;
    height: 8vw;
    border-radius: 8px;
  }

  .qr-placeholder {
    width: 8vw;
    height: 8vw;
    background: #f1f1f1;
    border: 1px dashed #ccc;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    color: #888;
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

/* ============ 컴포넌트 ============ */
const ShareModal = ({ roomData, totalPages = 10, onClose }) => {
    const [sessionLink, setSessionLink] = useState("");
    const [qrBase64, setQrBase64] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        // roomData가 이미 전달된 경우 (CreateSessionPage에서 생성된 방 사용)
        if (roomData) {
            setSessionLink(roomData.joinUrl);
            setQrBase64(roomData.qrPngBase64);
            setLoading(false);
            return;
        }

        // roomData가 없을 때만 새로 방 생성 (다른 곳에서 사용할 수도 있음)
        const initRoom = async () => {
            try {
                const data = await createRoom(totalPages);
                setSessionLink(data.joinUrl);
                setQrBase64(data.qrPngBase64);
            } catch (err) {
                console.error("방 생성 실패:", err);
                setError("방 생성 중 오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };
        initRoom();
    }, [roomData, totalPages]);

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
                            <Label>QR 코드</Label>
                            <QrBox>
                                {qrBase64 ? (
                                    <img src={`data:image/png;base64,${qrBase64}`} alt="QR Code" />
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
