import { useCallback, useEffect, useRef } from "react";
import websocketService from "../services/websocketService";
import useQuickSettingsStorage from "./useQuickSettingsStorage";

/**
 * 빠른 설정 관리 훅
 * - 옵션 변경 핸들러
 * - WebSocket 동기화
 */
export const useQuickSettings = ({ roomId, isPresenterWsReady }) => {
  const [quickSettings, setQuickSettings] = useQuickSettingsStorage();
  const initialSettingsSyncedRef = useRef(false);

  // 🔹 옵션 변경 핸들러 (리액션 스티커, 질문, 실시간 피드백)
  const handleOptionChange = useCallback(
    (optionKey, value) => {
      setQuickSettings((prev) => {
        const newSettings = { ...prev, [optionKey]: value };

        // unlock 옵션이 아닌 경우만 sendOptionChange 호출
        if (optionKey !== "unlock") {
          // 웹소켓으로 전송
          if (roomId && websocketService.getIsConnected()) {
            const options = {
              sticker: newSettings.sticker,
              question: newSettings.question,
              feedback: newSettings.feedback,
            };
            websocketService.sendOptionChange(roomId, options);
          }
        }

        return newSettings;
      });
    },
    [roomId, setQuickSettings]
  );

  // 🔹 다음 슬라이드 공개 옵션 변경 핸들러
  const handleUnlockChange = useCallback(
    (value) => {
      setQuickSettings((prev) => ({ ...prev, unlock: value }));

      // 웹소켓으로 전송
      if (roomId && websocketService.getIsConnected()) {
        const unlock = value ? "true" : "false";
        websocketService.sendUnlockChange(roomId, unlock);
      }
    },
    [roomId, setQuickSettings]
  );

  // Note: useQuickSettingsStorage가 자동으로 sessionStorage에 저장하므로 여기서는 저장하지 않음

  // 🔹 웹소켓 연결 후 저장된 빠른 설정 동기화
  useEffect(() => {
    if (
      initialSettingsSyncedRef.current ||
      !roomId ||
      !isPresenterWsReady ||
      !websocketService.getIsConnected()
    ) {
      return;
    }

    const options = {
      sticker: quickSettings.sticker,
      question: quickSettings.question,
      feedback: quickSettings.feedback,
    };
    websocketService.sendOptionChange(roomId, options);
    websocketService.sendUnlockChange(
      roomId,
      quickSettings.unlock ? "true" : "false"
    );
    initialSettingsSyncedRef.current = true;
  }, [roomId, isPresenterWsReady, quickSettings]);

  return {
    quickSettings,
    handleOptionChange,
    handleUnlockChange,
  };
};

