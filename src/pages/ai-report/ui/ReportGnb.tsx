import styled from "styled-components";
import BoiniLogo from "@/shared/assets/images/Boini_logo.svg";
import DownloadCsvIcon from "@/shared/assets/images/AI/download-csv.svg";

interface ReportGnbProps {
  onDownloadCsv: () => void;
  csvDownloading: boolean;
  onExit: () => void;
}

export function ReportGnb({ onDownloadCsv, csvDownloading, onExit }: ReportGnbProps) {
  return (
    <Bar>
      <Logo src={BoiniLogo} alt="BOiNi" />
      <Actions>
        <CsvButton type="button" onClick={onDownloadCsv} disabled={csvDownloading}>
          <img src={DownloadCsvIcon} alt="" />
          CSV 파일 다운로드
        </CsvButton>
        <ExitButton type="button" onClick={onExit}>
          나가기
        </ExitButton>
      </Actions>
    </Bar>
  );
}

export default ReportGnb;

const Bar = styled.header`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 65px;
  flex-shrink: 0;
  padding: 0 32px;
  background: #ffffff;
  border-bottom: 1px solid #eaeaea;
  box-sizing: border-box;
`;

const Logo = styled.img`
  height: 28px;
  width: auto;
`;

const Actions = styled.div`
  position: absolute;
  right: 32px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CsvButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 100px;
  background: #ffffff;
  color: #303030;
  font-size: clamp(12px, 0.85vw, 14px);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;

  img {
    width: 16px;
    height: 16px;
  }

  &:hover {
    background: #f8f8f8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ExitButton = styled.button`
  padding: 9px 20px;
  border: 1px solid #303030;
  border-radius: 100px;
  background: #303030;
  color: #ffffff;
  font-size: clamp(12px, 0.85vw, 14px);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: #000000;
  }
`;
