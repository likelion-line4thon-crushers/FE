export interface QuickSettings {
  sticker: boolean;
  question: boolean;
  feedback: boolean;
  unlock: boolean;
}

export interface UnlockSettings {
  maxRevealedPage: number | null;
  revealAllSlides: boolean;
  totalPages: number | null;
  presenterPage: number | null;
}
