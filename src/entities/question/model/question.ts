export interface NormalizedQuestion {
  id: string;
  roomId: string | null;
  slide: number;
  audienceId: string | null;
  content: string;
  ts: number;
  likeCount?: number;
  likedByMe?: boolean;
}

export type QuestionSortMode = "latest" | "popular";

const readNumber = (rawQuestion: any, keys: string[], fallback = 0) => {
  for (const key of keys) {
    const value = rawQuestion?.[key];
    const numberValue = Number(value);
    if (Number.isFinite(numberValue)) {
      return Math.max(0, numberValue);
    }
  }
  return fallback;
};

const readBoolean = (rawQuestion: any, keys: string[]) => {
  for (const key of keys) {
    const value = rawQuestion?.[key];
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      if (value.toLowerCase() === "true") return true;
      if (value.toLowerCase() === "false") return false;
    }
  }
  return undefined;
};

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
    likeCount: readNumber(rawQuestion, [
      "likeCount",
      "likes",
      "thumbsUpCount",
      "thumbsupCount",
      "upvoteCount",
      "upvotes",
      "voteCount",
    ]),
    likedByMe: readBoolean(rawQuestion, [
      "likedByMe",
      "liked",
      "isLiked",
      "hasLiked",
      "thumbedUpByMe",
      "votedByMe",
    ]),
  };
}

export function sortQuestionsAsc(questions: NormalizedQuestion[]): NormalizedQuestion[] {
  return [...questions].sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0));
}

export function getQuestionLikeCount(question: Pick<NormalizedQuestion, "likeCount"> | null) {
  const count = Number(question?.likeCount);
  return Number.isFinite(count) ? Math.max(0, count) : 0;
}

export function sortQuestionsByMode(
  questions: NormalizedQuestion[],
  mode: QuestionSortMode
): NormalizedQuestion[] {
  const sorted = [...questions];
  if (mode === "popular") {
    return sorted.sort((a, b) => {
      const likeDiff = getQuestionLikeCount(b) - getQuestionLikeCount(a);
      if (likeDiff !== 0) return likeDiff;
      return (b.ts ?? 0) - (a.ts ?? 0);
    });
  }

  return sorted.sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0));
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

export function applyQuestionLikeEvent(
  questions: NormalizedQuestion[],
  payload: {
    type?: string;
    questionId?: string;
    id?: string;
    data?: any;
    liked?: boolean;
    likedByMe?: boolean;
    likeCount?: number;
    likes?: number;
    thumbsupCount?: number;
    thumbsUpCount?: number;
  }
): NormalizedQuestion[] {
  const raw = payload?.data ?? payload;
  const questionId = raw?.questionId ?? raw?.id;
  if (!questionId) return questions;

  const nextLikeCount = readNumber(
    raw,
    ["likeCount", "likes", "thumbsUpCount", "thumbsupCount", "upvoteCount", "upvotes", "voteCount"],
    -1
  );
  const nextLikedByMe = readBoolean(raw, ["likedByMe", "liked", "isLiked", "hasLiked"]);

  return questions.map((question) => {
    if (question.id !== questionId) return question;

    const previousCount = getQuestionLikeCount(question);
    const likedByMe = nextLikedByMe === undefined ? question.likedByMe : Boolean(nextLikedByMe);
    const likeCount =
      nextLikeCount >= 0
        ? nextLikeCount
        : nextLikedByMe === undefined
          ? previousCount
          : Math.max(0, previousCount + (nextLikedByMe ? 1 : -1));

    return {
      ...question,
      likeCount,
      likedByMe,
    };
  });
}

export function buildQuestionTopics(roomId: string): string[] {
  if (!roomId) return [];
  return [`/topic/p/${roomId}/public`, `/topic/p/${roomId}/presenter`];
}

export interface QuestionCluster {
  clusterId?: string;
  representativeQuestionId?: string;
  representative: string;
  count: number;
  questions?: Array<{
    id: string;
    content: string;
    slide: number;
    ts: number;
    status?: string;
    likeCount?: number;
  }>;
  likeCount?: number;
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
  const raw = (payload as { data?: any })?.data ?? payload;
  if ((raw.type === "QUESTION_COMPLETED" || raw.type === "QUESTION_DELETED") && raw.questionId) {
    return questions.filter((q) => q.id !== raw.questionId);
  }
  return questions;
}
