import { useLayoutEffect, useRef } from "react";
import { useLocation, useParams } from "react-router";
import { useAtom, useAtomValue } from "jotai";
import { SessionCreatePage } from "@/pages/session-create";
import { PresenterRoomPage } from "@/pages/presenter-room";
import { SessionLoadingOverlay } from "@/shared/ui/session-loading-overlay";
import { presenterModeAtom, pendingPresentationFileAtom } from "@/entities/room";
import type { PresenterMode } from "@/entities/room";
import { getSessionStatus } from "@/shared/api/room";
import { sessionStartMarker } from "@/shared/config/storage-keys";

/**
 * 발표자 방 진입점 (단일 경로: /rooms/new, /rooms/:roomId).
 *
 * 준비/발표 화면을 URL 로 가르지 않고 세션 상태로 결정한다. 결정값은 presenterModeAtom 에
 * 저장해 AppHeader 와 공유한다. 주소 직접 입력/새로고침/뒤로가기 어떤 경우든 이미 시작된
 * 세션은 발표 화면이 뜬다.
 *
 * 핵심: 판정이 끝나기 전에는 어떤 페이지도 마운트하지 않는다(로딩 오버레이).
 * 그렇지 않으면 SessionCreatePage 가 잠깐 마운트되며 navigate("/") 같은 부수효과가 실행된다.
 *
 * 동기 판정(첫 렌더에서 즉시 결정 — 백엔드 조회 불필요):
 *  - roomId 없음(/rooms/new) → 준비
 *  - 업로드 진행/직후(pendingPresentationFileAtom 또는 location.state.roomData) → 준비
 *  - 시작 마커 보유(발표자 본인의 새로고침) → 발표
 *  - 그 외 → null(미정) → 로딩 + 백엔드 조회
 */
const PresenterRoomGate = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const [mode, setMode] = useAtom(presenterModeAtom);
  const pendingFile = useAtomValue(pendingPresentationFileAtom);
  const decidedRoomRef = useRef<string | null>(null);

  const locationState = (location.state as { roomData?: unknown } | null) ?? {};
  const hasUploadState = Boolean(pendingFile || locationState.roomData);

  // 첫 렌더에 동기적으로 결정 가능한 값. null 이면 백엔드 조회가 필요하다.
  // ⚠️ 시작 마커를 업로드 상태보다 먼저 본다. location.state(roomData)는 history.state 에
  //    저장돼 새로고침 후에도 남으므로, 마커를 우선하지 않으면 세션 시작 후 새로고침 시
  //    hasUploadState 가 여전히 true 라 준비 화면으로 잘못 빠진다.
  const syncDecision: PresenterMode | null = !roomId
    ? "prepare"
    : sessionStartMarker.isSet(roomId)
      ? "present"
      : hasUploadState
        ? "prepare"
        : null;

  useLayoutEffect(() => {
    if (!roomId) {
      decidedRoomRef.current = null;
      setMode("prepare");
      return;
    }
    if (decidedRoomRef.current === roomId) return;

    if (syncDecision !== null) {
      decidedRoomRef.current = roomId;
      setMode(syncDecision);
      return;
    }

    let cancelled = false;
    setMode("loading");
    (async () => {
      const status = await getSessionStatus(roomId);
      if (cancelled) return;
      // live 만 발표 화면. waiting/ended/조회실패 는 준비 화면으로 안전 폴백.
      if (status === "live") sessionStartMarker.set(roomId);
      setMode(status === "live" ? "present" : "prepare");
      decidedRoomRef.current = roomId;
    })();

    return () => {
      cancelled = true;
    };
  }, [roomId, syncDecision, setMode]);

  // 이 방을 확정했으면 atom(시작 전환 등 반영), 아니면 동기 판정값(없으면 로딩)을 쓴다.
  // → 판정 전에는 절대 SessionCreatePage/PresenterRoomPage 를 마운트하지 않는다.
  const effectiveMode: PresenterMode =
    decidedRoomRef.current === roomId ? mode : (syncDecision ?? "loading");

  if (effectiveMode === "loading")
    return <SessionLoadingOverlay message="세션을 불러오는 중 ..." />;
  if (effectiveMode === "present") return <PresenterRoomPage />;
  return <SessionCreatePage />;
};

export default PresenterRoomGate;
