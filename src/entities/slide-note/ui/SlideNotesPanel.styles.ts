import styled from "styled-components";

export const NotesContainer = styled.section`
  width: 100%;
  margin-top: 1.4vh;
  padding: clamp(12px, 1.3vh, 16px) clamp(14px, 1vw, 18px);
  border: 0.05vw solid #eaeaea;
  border-radius: 8px;
  background: #fafafa;
  box-sizing: border-box;
`;

export const NotesTitle = styled.h2`
  margin: 0 0 0.7vh;
  color: #303030;
  font-size: clamp(13px, 0.85vw, 15px);
  font-weight: 700;
  line-height: 1.35;
`;

export const NotesTextarea = styled.textarea<{ $readOnly: boolean }>`
  display: block;
  width: 100%;
  min-height: 12vh;
  max-height: 18vh;
  margin: 0;
  padding: 0;
  border: 0;
  outline: none;
  resize: ${({ $readOnly }) => ($readOnly ? "none" : "vertical")};
  overflow: auto;
  background: transparent;
  color: ${({ $readOnly }) => ($readOnly ? "#4a4a4a" : "#5c5c5c")};
  font-size: clamp(13px, 0.85vw, 15px);
  font-weight: 500;
  line-height: 1.55;
  box-sizing: border-box;
  cursor: ${({ $readOnly }) => ($readOnly ? "default" : "text")};

  &::placeholder {
    color: #b0b0b0;
    font-weight: 500;
  }

  &:focus {
    color: #303030;
  }
`;
