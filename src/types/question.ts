export interface NormalizedQuestion {
  id: string;
  roomId: string | null;
  slide: number;
  audienceId: string | null;
  content: string;
  ts: number;
}
