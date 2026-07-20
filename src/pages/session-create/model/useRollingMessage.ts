import { useEffect, useState } from "react";

/**
 * 시간 경과에 따라 로딩 메시지를 순차적으로 넘긴다 (마지막 메시지에서 유지).
 * 청크 업로드는 서버 응답 기준이라 실제 진행률 신호가 없으므로,
 * 멈춰 보이지 않도록 메시지를 굴리는 것으로 대체한다.
 */
export function useRollingMessage(
  messages: readonly string[],
  active: boolean,
  intervalMs = 4000
): string {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active) {
      setIndex(0);
      return undefined;
    }
    const timer = setInterval(() => {
      setIndex((i) => Math.min(i + 1, messages.length - 1));
    }, intervalMs);
    return () => clearInterval(timer);
  }, [active, intervalMs, messages.length]);

  return messages[Math.min(index, messages.length - 1)];
}
