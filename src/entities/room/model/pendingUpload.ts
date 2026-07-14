import { atom } from "jotai";

/**
 * 랜딩에서 선택한 발표 파일. File 은 직렬화가 불가능해 location.state 로 나르면
 * 새로고침/브라우저별 동작 차이에 취약하므로 아톰으로 전달한다.
 * 새로고침 시 자연히 유실되며, 그 경우 SessionCreatePage 가 업로드 중단 안내를 띄운다.
 */
export const pendingPresentationFileAtom = atom<File | null>(null);
