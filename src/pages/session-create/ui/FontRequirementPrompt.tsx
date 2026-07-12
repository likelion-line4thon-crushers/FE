import { useRef, useState } from "react";
import type { FontReportEntry } from "@/shared/api/model/pdf";

interface Props {
  fontReport: FontReportEntry[];
  busy: boolean;
  error: string | null;
  onUploadFonts: (files: File[]) => void;
  onProceedWithout: () => void;
}

export default function FontRequirementPrompt({
  fontReport,
  busy,
  error,
  onUploadFonts,
  onProceedWithout,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [picked, setPicked] = useState<File[]>([]);
  const missingCount = fontReport.filter((f) => f.status === "MISSING").length;

  return (
    <div role="dialog" aria-label="폰트 업로드" style={{ maxWidth: 560, margin: "10vh auto", padding: 24 }}>
      <h2>이 발표 자료에 필요한 폰트가 서버에 없어요</h2>
      <p>
        정확한 글꼴로 변환하려면 아래 <b>{missingCount}</b>개의 폰트를 업로드하세요.
      </p>
      <ul>
        {fontReport.map((f) => (
          <li key={f.name}>
            <span>{f.name}</span>{" "}
            <span aria-label={f.status}>{f.status === "MISSING" ? "❌ 없음" : "✅ 사용 가능"}</span>
          </li>
        ))}
      </ul>
      <input
        ref={inputRef}
        type="file"
        accept=".ttf,.otf,.ttc"
        multiple
        onChange={(e) => setPicked(Array.from(e.target.files ?? []))}
      />
      {picked.length > 0 && <p>{picked.length}개 선택됨</p>}
      {error && (
        <p role="alert" style={{ color: "#e8541e" }}>
          {error}
        </p>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button type="button" disabled={busy || picked.length === 0} onClick={() => onUploadFonts(picked)}>
          이 폰트로 계속
        </button>
        <button type="button" disabled={busy} onClick={onProceedWithout}>
          그냥 진행
        </button>
      </div>
    </div>
  );
}
