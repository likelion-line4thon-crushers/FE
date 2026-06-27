export interface NormalizedQuestion {
  id: string;
  roomId: string | null;
  slide: number;
  audienceId: string | null;
  content: string;
  ts: number;
}

export function normalizeQuestion(rawQuestion: any): NormalizedQuestion | null {
  if (!rawQuestion || typeof rawQuestion !== "object") return null;

  const id = rawQuestion.id ?? rawQuestion.questionId;
  if (!id) return null;

  const slideRaw =
    rawQuestion.slide ??
    (typeof rawQuestion.slideIndex === "number" ? rawQuestion.slideIndex + 1 : undefined);
  const slideNumber = Number(slideRaw);
  const slide = Number.isFinite(slideNumber) && slideNumber > 0 ? slideNumber : 1;

  const tsRaw = rawQuestion.ts ?? rawQuestion.timestamp ?? Date.now();
  const tsNumber = Number(tsRaw);
  const ts = Number.isFinite(tsNumber) ? tsNumber : Date.now();

  return {
    id,
    roomId: rawQuestion.roomId ?? null,
    slide,
    audienceId: rawQuestion.audienceId ?? rawQuestion.userId ?? null,
    content: rawQuestion.content ?? rawQuestion.text ?? "",
    ts,
  };
}

export function sortQuestionsAsc(questions: NormalizedQuestion[]): NormalizedQuestion[] {
  return [...questions].sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0));
}

export function upsertQuestion(
  questions: NormalizedQuestion[],
  incoming: NormalizedQuestion | null
): NormalizedQuestion[] {
  if (!incoming) return questions;

  const next = [...questions];
  const existingIndex = next.findIndex((item) => item.id === incoming.id);

  if (existingIndex >= 0) {
    next[existingIndex] = incoming;
  } else {
    next.push(incoming);
  }

  return sortQuestionsAsc(next);
}

export function buildQuestionTopics(roomId: string): string[] {
  if (!roomId) return [];
  return [`/topic/p/${roomId}/public`, `/topic/p/${roomId}/presenter`];
}

export interface QuestionCluster {
  representative: string;
  count: number;
  questionIds: string[];
  slides: number[];
  samples: string[];
}

export function selectUnclusteredQuestions(
  questions: NormalizedQuestion[],
  clusters: QuestionCluster[]
): NormalizedQuestion[] {
  if (!clusters || clusters.length === 0) return questions;
  const clustered = new Set(clusters.flatMap((c) => c.questionIds));
  return questions.filter((q) => !clustered.has(q.id));
}

// Returns a filtered list with the given questionId removed,
// or the original list unchanged if the event type is unrecognised.
export function applyQuestionStatusEvent(
  questions: NormalizedQuestion[],
  payload: { type?: string; questionId?: string }
): NormalizedQuestion[] {
  if (
    (payload.type === "QUESTION_COMPLETED" || payload.type === "QUESTION_DELETED") &&
    payload.questionId
  ) {
    return questions.filter((q) => q.id !== payload.questionId);
  }
  return questions;
}
