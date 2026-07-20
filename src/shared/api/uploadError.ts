import { isAxiosError } from "axios";

// 백엔드 PdfErrorCode → 사용자 안내 문구.
// 행동 지침이 필요한 코드만 덮어쓰고, 나머지는 서버 메시지 → fallback 순으로 사용한다.
const UPLOAD_ERROR_MESSAGES: Record<string, string> = {
  P012: "지원하지 않는 파일 형식입니다. PDF, PPT, PPTX 파일만 업로드할 수 있어요.",
  P023: "PPT 파일을 변환하지 못했습니다. PDF로 저장한 뒤 다시 업로드해보세요.",
  P031: "폰트 파일이 유효하지 않습니다. TTF/OTF 파일인지 확인해주세요.",
  P032: "폰트 파일이 너무 큽니다.",
  P033: "업로드할 수 있는 폰트 개수를 초과했습니다.",
  P034: "업로드한 폰트의 총 용량이 허용치를 초과했습니다.",
  P036: "업로드 세션이 만료되었습니다. 처음부터 다시 시도해주세요.",
};

/** axios 에러에서 BaseResponse 의 code/message 를 꺼내 사용자 문구로 변환한다. */
export function getUploadErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    if (!err.response) {
      return "네트워크 연결이 불안정합니다. 연결을 확인한 뒤 다시 시도해주세요.";
    }
    const data = err.response.data as { code?: string; message?: string } | undefined;
    if (data?.code && UPLOAD_ERROR_MESSAGES[data.code]) {
      return UPLOAD_ERROR_MESSAGES[data.code];
    }
    if (data?.message) return data.message;
  }
  return fallback;
}
