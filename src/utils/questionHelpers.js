export const normalizeQuestion = (rawQuestion) => {
  if (!rawQuestion || typeof rawQuestion !== "object") return null;

  const id = rawQuestion.id ?? rawQuestion.questionId;
  if (!id) return null;

  const slideRaw =
    rawQuestion.slide ??
    (typeof rawQuestion.slideIndex === "number"
      ? rawQuestion.slideIndex + 1
      : undefined);
  const slideNumber = Number(slideRaw);
  const slide =
    Number.isFinite(slideNumber) && slideNumber > 0 ? slideNumber : 1;

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
};

export const sortQuestionsAsc = (questions) =>
  [...questions].sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0));

export const upsertQuestion = (questions, incoming) => {
  if (!incoming) return questions;

  const next = [...questions];
  const existingIndex = next.findIndex((item) => item.id === incoming.id);

  if (existingIndex >= 0) {
    next[existingIndex] = incoming;
  } else {
    next.push(incoming);
  }

  return sortQuestionsAsc(next);
};

export const buildQuestionTopics = (roomId) => {
  if (!roomId) return [];
  const topics = [`/topic/p/${roomId}/public`, `/topic/p/${roomId}/presenter`];
  return [...new Set(topics)];
};
