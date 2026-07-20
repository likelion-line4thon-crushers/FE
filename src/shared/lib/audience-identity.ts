import { storageKeys } from "@/shared/config/storage-keys";
import { createLogger } from "./logger";

const log = createLogger("audience-identity");

/**
 * 세션 코드별로 저장해 두는 청중 신원.
 * join API는 호출마다 새 audienceId를 발급하고 누적 입장 수를 올리므로, 이 사본이 있으면
 * 재-join 없이 복원해야 리포트 수치가 부풀지 않고 브라우저 단위 피드백 중복 방지도 유지된다.
 */
export interface StoredAudienceJoin {
  roomId: string;
  audienceId: string;
  audienceToken: string;
  deckId?: string;
  totalPages?: number | string;
  sessionStatus?: string;
  currentPage?: number | string;
  sticker?: boolean | string;
  question?: boolean | string;
  feedback?: boolean | string;
  maxPage?: number | string | null;
  slideUnlock?: boolean | string;
  wsUrl?: string;
}

// 라이브러리 없이 JWT `exp`(초)만 확인한다. exp가 없으면 유효한 것으로 본다.
export const isAudienceTokenValid = (token?: string): boolean => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (!payload?.exp) return true;
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

/**
 * 저장된 청중 신원을 읽는다. 탭의 sessionStorage 사본은 피드백 제출 후 지워지므로,
 * 없으면 localStorage의 내구 사본(토큰이 아직 살아 있을 때만)으로 되살린다 —
 * 같은 브라우저가 새 audienceId를 발급받지 않고 동일 신원을 재사용하게 하는 장치다.
 *
 * 기본값은 만료 검사를 하지 않는다: 오디언스 페이지는 토큰이 만료됐어도 이 탭의 사본으로
 * 화면을 복원해야 하기 때문이다. 반대로 이 신원으로 새 요청을 보낼 호출부(랜딩 참여)는
 * `requireValidToken`을 켜서 만료된 신원을 재사용하지 않도록 한다.
 */
export function readAudienceIdentity(
  code: string,
  { requireValidToken = false }: { requireValidToken?: boolean } = {}
): StoredAudienceJoin | null {
  const key = storageKeys.audience(code);

  try {
    if (!sessionStorage.getItem(key)) {
      const durable = localStorage.getItem(key);
      if (durable && isAudienceTokenValid(JSON.parse(durable).audienceToken)) {
        sessionStorage.setItem(key, durable);
      }
    }
  } catch {
    // 스토리지 접근 불가(프라이빗 모드 등) — 아래 읽기에서 null로 떨어진다
  }

  try {
    const stored = sessionStorage.getItem(key);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as StoredAudienceJoin;
    if (!parsed?.audienceId || !parsed?.audienceToken) return null;
    if (requireValidToken && !isAudienceTokenValid(parsed.audienceToken)) return null;

    // 이 개선 이전에 만들어진 신원까지 내구 사본을 갖도록 동기화
    try {
      localStorage.setItem(key, stored);
    } catch {
      /* ignore */
    }
    return parsed;
  } catch {
    log.warn("Stored audience identity read failed");
    return null;
  }
}

/** 세션 사본과 내구 사본에 함께 기록한다. */
export function writeAudienceIdentity(code: string, data: StoredAudienceJoin) {
  try {
    const serialized = JSON.stringify(data);
    sessionStorage.setItem(storageKeys.audience(code), serialized);
    localStorage.setItem(storageKeys.audience(code), serialized);
    log.log("Audience identity saved to session/local storage");
  } catch (storageError) {
    log.warn("Storage write failed:", storageError);
  }
}
