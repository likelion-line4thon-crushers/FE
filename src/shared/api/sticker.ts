import api from "./api";
import { createLogger } from "@/shared/lib/logger";

const log = createLogger("sticker");

export async function getAllStickers(sessionId: string): Promise<any[]> {
  try {
    const response = await api.get(`/api/stickers/${sessionId}/all`);
    const data = response?.data?.data ?? response?.data ?? [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    log.error("Failed to fetch stickers", error);
    return [];
  }
}

export async function getStickersByAudience(sessionId: string, audienceId: string): Promise<any[]> {
  try {
    const response = await api.get(`/api/stickers/${sessionId}/audience/${audienceId}`);
    const data = response?.data?.data ?? response?.data ?? [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    log.error("Failed to fetch audience stickers", error);
    return [];
  }
}
