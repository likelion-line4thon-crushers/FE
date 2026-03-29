export interface AudienceStats {
  prev: number;
  current: number;
  next: number;
}

// * Backend returns these field names, mapped to AudienceStats at service boundary
export interface RawAudienceStats {
  frontCount: number;
  currentCount: number;
  backCount: number;
}

export interface SlideUrl {
  page: number;
  url: string;
}
