export interface PageChangeMessage {
  beforePage: number;
  changedPage: number;
  audienceId?: string;
}

export interface OptionChangeMessage {
  sticker: string;
  question: string;
  feedback: string;
}

export interface UnlockChangeMessage {
  maxRevealedPage: number;
  revealAllSlides: string;
  totalPages: number;
  presenterPage: number;
}

export interface SessionStateMessage {
  type: 'SESSION_STATE';
  status: string;
}

// ! Backend sends inconsistent field names for coordinates and timestamps
export interface ReactionMessage {
  emoji: number;
  slide: number;
  x?: number;
  y?: number;
  xPct?: number;
  yPct?: number;
  created_at?: string;
  createdAt?: string;
  id?: string;
}
