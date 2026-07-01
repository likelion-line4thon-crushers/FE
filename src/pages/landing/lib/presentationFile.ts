const SUPPORTED_PRESENTATION_EXTENSIONS = [".pdf", ".ppt", ".pptx"] as const;

export const PRESENTATION_FILE_ACCEPT = SUPPORTED_PRESENTATION_EXTENSIONS.join(",");

export function isSupportedPresentationFile(file: File | null | undefined): file is File {
  if (!file) return false;
  const name = file.name.toLowerCase();
  return SUPPORTED_PRESENTATION_EXTENSIONS.some((extension) =>
    name.endsWith(extension)
  );
}
