import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { updatePdfDownloadPolicy } from "@/shared/api/pdf-download";
import { storageKeys } from "@/shared/config/storage-keys";
import { createLogger } from "@/shared/lib/logger";

const log = createLogger("pdf-download-policy");

const readStoredPolicy = (storageKey: string | null, fallback: boolean) => {
  if (!storageKey) return fallback;

  try {
    const stored = sessionStorage.getItem(storageKey);
    if (stored == null) return fallback;
    return stored === "true";
  } catch {
    return fallback;
  }
};

const writeStoredPolicy = (storageKey: string | null, enabled: boolean) => {
  if (!storageKey) return;

  try {
    sessionStorage.setItem(storageKey, String(enabled));
  } catch {
    // ignore storage write errors
  }
};

interface UsePdfDownloadPolicyParams {
  roomId: string | null;
  initialEnabled?: boolean;
}

export function usePdfDownloadPolicy({ roomId, initialEnabled }: UsePdfDownloadPolicyParams) {
  const storageKey = useMemo(
    () => (roomId ? storageKeys.pdfDownloadPolicy(roomId) : null),
    [roomId]
  );
  const resolveInitialEnabled = useCallback(
    () =>
      typeof initialEnabled === "boolean" ? initialEnabled : readStoredPolicy(storageKey, false),
    [initialEnabled, storageKey]
  );
  const [enabled, setEnabled] = useState(resolveInitialEnabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEnabled(resolveInitialEnabled());
    setError(null);
  }, [resolveInitialEnabled]);

  const { mutateAsync, isPending: saving } = useMutation({
    mutationFn: ({ targetRoomId, nextEnabled }: { targetRoomId: string; nextEnabled: boolean }) =>
      updatePdfDownloadPolicy(targetRoomId, nextEnabled),
    onMutate: ({ nextEnabled }) => {
      const previousEnabled = enabled;
      setEnabled(nextEnabled);
      setError(null);
      return { previousEnabled };
    },
    onSuccess: (savedEnabled) => {
      setEnabled(savedEnabled);
      writeStoredPolicy(storageKey, savedEnabled);
    },
    onError: (policyError, _variables, context) => {
      log.error("Failed to update PDF download policy", policyError);
      if (context) setEnabled(context.previousEnabled);
      setError("다운로드 설정을 저장하지 못했습니다.");
    },
  });

  const setPolicyEnabled = useCallback(
    async (nextEnabled: boolean) => {
      if (!roomId) {
        setEnabled(nextEnabled);
        setError(null);
        return nextEnabled;
      }

      try {
        return await mutateAsync({ targetRoomId: roomId, nextEnabled });
      } catch {
        return null;
      }
    },
    [roomId, mutateAsync]
  );

  return {
    enabled,
    saving,
    error,
    setPolicyEnabled,
  };
}
