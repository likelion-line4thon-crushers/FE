export type SessionStatus = "waiting" | "live" | "ended" | "ENDED";

export interface RoomData {
  roomId: string;
  deckId: string;
  presenterToken: string;
  wsUrl: string;
  joinUrl: string;
  code: string;
  count: number;
  totalPages: number;
  audienceCount?: number;
  fileName?: string;
  qrPngBase64?: string;
  pdfId?: string;
  canStartSession?: boolean;
  pdfDownloadEnabled?: boolean;
}

// ! Backend returns inconsistent field names (deckID vs deckId)
export interface JoinRoomResponse {
  roomId: string;
  audienceId: string;
  audienceToken: string;
  deckId?: string;
  deckID?: string;
  totalPages?: number;
  sessionStatus?: SessionStatus;
  currentPage?: number;
  sticker?: string | boolean;
  question?: string | boolean;
  feedback?: string | boolean;
  maxPage?: number;
  slideUnlock?: string | boolean;
  wsUrl?: string;
  deck?: { deckId: string; totalPages: number };
  presentation?: { deckId: string; totalPages: number };
}

export interface RoomInfo {
  roomId: string | null;
  deckId: string | null;
  totalPages: number | null;
  fileName: string | null;
}
