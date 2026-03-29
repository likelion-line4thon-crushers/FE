import React, { useState } from "react";
import { useNavigate } from "react-router";
import styled, { css } from "styled-components";
import TitleSVG from "@/shared/assets/images/title.svg";
import Emoji1 from "@/shared/assets/images/emoji1.svg";
import Emoji2 from "@/shared/assets/images/emoji2.svg";
import Emoji3 from "@/shared/assets/images/emoji3.svg";
import Emoji4 from "@/shared/assets/images/emoji4.svg";

/* === 전체 레이아웃 === */
const MainLayout = styled.div`
  display: grid;
  grid-template-columns: 15vw 1fr 15vw;
  width: 100vw;
  height: 100%;
  margin: 0 auto;
  background: #fff;
  border: 0.1vw solid #eaeaea;
  box-sizing: border-box;
`;

/* === 좌우 사이드 === */
const Side = styled.div`
  background-color: #fff;
  padding: 2% 6%;
  height: 100%;
  box-sizing: border-box;
  border-radius: 0.6vw;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const SideInner = styled.div`
  width: 100%;
  height: 100%;
  border: 0.1vw dashed #eaeaea;
  border-radius: 0.4vw;
  background-image: repeating-linear-gradient(
    135deg,
    #f3f3f3 0,
    #f3f3f3 0.1vw,
    transparent 0.1vw,
    transparent 0.3vw
  );
  box-sizing: border-box;
`;

/* === 중앙 메인 영역 === */
const CenterGrid = styled.div`
  display: grid;
  grid-template-rows: repeat(3, 1fr);
  grid-template-columns: repeat(4, 1fr);
  gap: 1.3vw;
  width: 100%;
  height: 100%;
  padding: 2%;
  box-sizing: border-box;
  border: 0.1vw solid #eaeaea;
  overflow: hidden;
`;

/* === 각 셀 === */
const Box = styled.div<{ striped?: boolean }>`
  border: 0.1vw solid #eaeaea;
  border-radius: 0.6vw;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  background: #fff;

  ${({ striped }) =>
    striped &&
    css`
      background-image: repeating-linear-gradient(
        135deg,
        #f3f3f3 0,
        #f3f3f3 0.1vw,
        transparent 0.1vw,
        transparent 0.3vw
      );
    `}

  img {
    width: 2.5vw;
    height: 2.5vw;
  }
`;

/* === 중앙 컨텐츠 === */
const CenterContent = styled.div`
  grid-row: 2 / 3;
  grid-column: 2 / 4;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-radius: 0.6vw;
  background: rgba(255, 255, 255, 0.8);
  padding: 0.5vh;
  margin: 0;
  gap: 2.5vh;
  box-sizing: border-box;
`;

const UploadBox = styled.div<{ $dragging?: boolean; $hasFile?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 91%;
  height: 5vh;
  border: 0.1vw solid #5c5c5c;
  border-radius: 0.7vw;
  background: #fff;
  box-shadow: 0 0.2vh 0.5vh rgba(0, 0, 0, 0.04);
  padding: 0 0.1vw 0 0.8vw;
  transition: all 0.2s ease-in-out;
  margin-bottom: 0;

  &:hover {
    border-color: #e8541e;
    box-shadow: 0 0.2vh 0.6vh rgba(232, 84, 30, 0.1);
  }

  ${({ $dragging }) =>
    $dragging &&
    css`
      border-color: #00aaff;
      background: #f0faff;
      box-shadow: 0 0 0.8vh rgba(0, 170, 255, 0.2);
    `}

  ${({ $hasFile }) =>
    $hasFile &&
    css`
      background: #000;
      border-color: #000;
    `}

  .file-name {
    color: #888;
    font-size: clamp(13px, 0.9vw, 15px);
    flex: 1;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;

    ${({ $hasFile }) =>
      $hasFile &&
      css`
        color: #fff;
      `}
  }

  .arrow {
    font-size: 18px;
    color: rgb(255, 255, 255);
    margin-left: 0.5vw;
    margin-right: 0.2vw;
    cursor: pointer;
    background-color: #eaeaea;
    padding: 0.4vw;
    border-radius: 0.35vw;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    min-width: 18px;
    min-height: 18px;

    ${({ $hasFile }) =>
      $hasFile &&
      css`
        background-color: #ff4200;
      `}
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const Button = styled.button`
  padding: 1.3vh 1.8vw;
  background-color: ${(props) => (props.disabled ? "#ccc" : "#e8541e")};
  color: white;
  border: none;
  border-radius: 0.4vw;
  font-size: clamp(14px, 1vw, 18px);
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: 0.2s;
  &:hover {
    background-color: ${(props) => (props.disabled ? "#ccc" : "#cc3f13")};
  }
`;

const MainPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      alert("PDF 파일만 선택해주세요!");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      alert("PDF 파일만 선택해주세요!");
    }
  };

  const handleStartPresentation = () => {
    if (!selectedFile) return alert("PDF를 먼저 업로드해주세요!");
    navigate("/rooms/new", {
      state: { pdfFile: selectedFile, fileName: selectedFile.name },
    });
  };

  return (
    <MainLayout>
      {/* 좌측 */}
      <Side>
        <SideInner />
      </Side>

      {/* 중앙 */}
      <CenterGrid>
        {/* 1행 */}
        <Box style={{ gridRow: 1, gridColumn: 1 }}>
          <img src={Emoji1} style={{ width: "12vw", height: "auto" }} alt="emoji1" />
        </Box>
        <Box striped style={{ gridRow: 1, gridColumn: "2 / 4" }} /> {/* #2 */}
        <Box style={{ gridRow: 1, gridColumn: 4 }}>
          <img src={Emoji2} style={{ width: "12vw", height: "auto" }} alt="emoji2" />
        </Box>
        {/* 2행 */}
        <Box striped style={{ gridRow: 2, gridColumn: 1 }} /> {/* #4 */}
        <CenterContent>
          <img src={TitleSVG} alt="발표가 달라진다" style={{ width: "95%", height: "auto" }} />

          <UploadBox
            $dragging={isDragging}
            $hasFile={!!selectedFile}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(false);
            }}
            onDrop={handleDrop}
            onClick={() => (document.getElementById("pdfInput") as HTMLInputElement)?.click()}
          >
            <span className="file-name">
              {selectedFile
                ? selectedFile.name
                : isDragging
                  ? "여기에 파일을 놓으세요 📂"
                  : "여기에 PDF 파일을 업로드하고 시작하세요!"}
            </span>
            <span
              className="arrow"
              onClick={(e) => {
                e.stopPropagation();
                handleStartPresentation();
              }}
            >
              ➜
            </span>
          </UploadBox>

          <HiddenInput id="pdfInput" type="file" accept=".pdf" onChange={handleFileSelect} />
        </CenterContent>
        <Box striped style={{ gridRow: "2 / 4", gridColumn: 4 }} /> {/* #6 */}
        {/* 3행 */}
        <Box style={{ gridRow: 3, gridColumn: 1 }}>
          <img src={Emoji3} style={{ width: "12vw", height: "auto" }} alt="emoji3" />
        </Box>
        <Box striped style={{ gridRow: 3, gridColumn: 2 }} /> {/* #8 */}
        <Box style={{ gridRow: 3, gridColumn: 3 }}>
          <img src={Emoji4} style={{ width: "12vw", height: "auto" }} alt="emoji4" />
        </Box>
      </CenterGrid>

      {/* 우측 */}
      <Side>
        <SideInner />
      </Side>
    </MainLayout>
  );
};

export default MainPage;
