// 발표 자료 업로드 최대 크기. 백엔드는 청크(2MB) 단위 제한만 있고 전체 파일 크기 제한이
// 없으므로 프론트에서 선제적으로 차단한다.
export const MAX_PRESENTATION_FILE_BYTES = 200 * 1024 * 1024;

export const MAX_PRESENTATION_FILE_LABEL = "200MB";
