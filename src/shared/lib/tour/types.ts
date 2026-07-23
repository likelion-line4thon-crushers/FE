export type TourSurface = "prepare" | "present" | "report";

export type TourPreset = "default" | "quiet";

/** Page-authored step content. `target` is a CSS selector; omit it for a centered modal step. */
export interface TourStepContent {
  target?: string;
  title: string;
  body: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}
