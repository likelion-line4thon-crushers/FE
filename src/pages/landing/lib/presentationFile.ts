const SUPPORTED_PRESENTATION_EXTENSIONS = [".pdf", ".ppt", ".pptx"] as const;

export const PRESENTATION_FILE_ACCEPT = SUPPORTED_PRESENTATION_EXTENSIONS.join(",");

// 분석 이벤트용 확장자 라벨 (예: "pdf") — 점이 없거나 파일이 없으면 undefined.
export function getPresentationFileType(file: File | null | undefined): string | undefined {
  return file?.name.split(".").pop()?.toLowerCase();
}

export function isSupportedPresentationFile(file: File | null | undefined): file is File {
  if (!file) return false;
  const name = file.name.toLowerCase();
  return SUPPORTED_PRESENTATION_EXTENSIONS.some((extension) => name.endsWith(extension));
}
