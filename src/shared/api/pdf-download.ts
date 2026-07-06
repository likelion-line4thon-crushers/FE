import api from "./api";

export interface PdfDownloadAvailability {
  enabled: boolean;
  submittedFeedback: boolean;
  sessionEnded: boolean;
  canDownload: boolean;
}

export interface PdfDownloadFile {
  blob: Blob;
  fileName: string | null;
}

const getPayload = <T>(responseData: any, fallback: T): T =>
  responseData?.data ?? responseData ?? fallback;

export async function updatePdfDownloadPolicy(roomId: string, enabled: boolean): Promise<boolean> {
  if (!roomId) throw new Error("roomId is required");
  const response = await api.patch(`/api/rooms/${roomId}/pdf-download-policy`, { enabled });
  const payload = getPayload<{ enabled?: boolean }>(response.data, {});
  return typeof payload.enabled === "boolean" ? payload.enabled : enabled;
}

export async function fetchPdfDownloadAvailability(
  roomId: string,
  audienceId: string
): Promise<PdfDownloadAvailability> {
  if (!roomId) throw new Error("roomId is required");
  if (!audienceId) throw new Error("audienceId is required");

  const response = await api.get(`/api/rooms/${roomId}/pdf-download/availability`, {
    params: { audienceId },
  });
  const payload = getPayload<Partial<PdfDownloadAvailability>>(response.data, {});

  return {
    enabled: Boolean(payload.enabled),
    submittedFeedback: Boolean(payload.submittedFeedback),
    sessionEnded: Boolean(payload.sessionEnded),
    canDownload: Boolean(payload.canDownload),
  };
}

export async function downloadPdfSlides(
  roomId: string,
  audienceId: string
): Promise<PdfDownloadFile> {
  if (!roomId) throw new Error("roomId is required");
  if (!audienceId) throw new Error("audienceId is required");

  const response = await api.get(`/api/rooms/${roomId}/pdf-download`, {
    params: { audienceId },
    responseType: "blob",
  });

  const contentDisposition =
    typeof response.headers?.get === "function"
      ? response.headers.get("content-disposition")
      : response.headers["content-disposition"];
  const fileName =
    typeof contentDisposition === "string"
      ? (contentDisposition.match(/filename\*=UTF-8''([^;]+)/)?.[1] ??
        contentDisposition.match(/filename="?([^"]+)"?/)?.[1] ??
        null)
      : null;

  return {
    blob: response.data,
    fileName: fileName ? decodeURIComponent(fileName) : null,
  };
}
