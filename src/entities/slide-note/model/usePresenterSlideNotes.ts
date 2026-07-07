import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchSlideNotes, saveSlideNote, saveSlideNoteKeepalive } from "@/shared/api/presentation";
import { SESSION_BEFORE_START_EVENT } from "@/shared/config/session-events";

interface UsePresenterSlideNotesParams {
  roomId: string | null;
  deckId: string | null;
  presenterToken: string | null;
  editable?: boolean;
}

const SAVE_DEBOUNCE_MS = 800;

export function usePresenterSlideNotes({
  roomId,
  deckId,
  presenterToken,
  editable = false,
}: UsePresenterSlideNotesParams) {
  const [notesByPage, setNotesByPage] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const latestNotesRef = useRef(notesByPage);
  const saveContextRef = useRef({ roomId, deckId, presenterToken, editable });
  const mountedRef = useRef(true);

  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    []
  );

  useEffect(() => {
    latestNotesRef.current = notesByPage;
  }, [notesByPage]);

  useEffect(() => {
    saveContextRef.current = { roomId, deckId, presenterToken, editable };
  }, [roomId, deckId, presenterToken, editable]);

  const clearPendingSave = useCallback((page: number) => {
    const timer = timersRef.current[page];
    if (timer) {
      clearTimeout(timer);
      delete timersRef.current[page];
    }
  }, []);

  useEffect(() => {
    Object.values(timersRef.current).forEach(clearTimeout);
    timersRef.current = {};

    if (!roomId || !deckId || !presenterToken) {
      setNotesByPage({});
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchSlideNotes({ roomId, deckId, presenterToken, signal: controller.signal })
      .then((items) => {
        if (controller.signal.aborted) return;
        const next = items.reduce<Record<number, string>>((acc, item) => {
          acc[item.page] = item.notes;
          return acc;
        }, {});
        setNotesByPage(next);
      })
      .catch((err: any) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setNotesByPage({});
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [roomId, deckId, presenterToken]);

  const savePageNote = useCallback((page: number, notes: string): Promise<void> => {
    const context = saveContextRef.current;
    if (!context.editable || !context.roomId || !context.deckId || !context.presenterToken) {
      return Promise.resolve();
    }

    return saveSlideNote({
      roomId: context.roomId,
      deckId: context.deckId,
      presenterToken: context.presenterToken,
      page,
      notes,
    })
      .then((saved) => {
        if (!mountedRef.current) return;
        setError(null);
        setNotesByPage((prev) => {
          if (prev[page] !== notes) return prev;
          return { ...prev, [page]: saved.notes };
        });
      })
      .catch((err: any) => {
        if (!mountedRef.current) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      });
  }, []);

  const flushPendingSaves = useCallback(
    (useKeepalive = false): Promise<void> => {
      const pendingPages = Object.keys(timersRef.current)
        .map(Number)
        .filter((page) => Number.isFinite(page) && page > 0);

      const saves = pendingPages.map((page) => {
        clearPendingSave(page);
        const notes = latestNotesRef.current[page] ?? "";
        const context = saveContextRef.current;

        if (useKeepalive) {
          if (context.editable) {
            saveSlideNoteKeepalive({
              roomId: context.roomId ?? "",
              deckId: context.deckId ?? "",
              presenterToken: context.presenterToken ?? "",
              page,
              notes,
            });
          }
          return Promise.resolve();
        }

        return savePageNote(page, notes);
      });

      return Promise.allSettled(saves).then(() => undefined);
    },
    [clearPendingSave, savePageNote]
  );

  useEffect(
    () => () => {
      void flushPendingSaves();
    },
    [flushPendingSaves]
  );

  useEffect(() => {
    const handlePageHide = () => {
      void flushPendingSaves(true);
    };

    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, [flushPendingSaves]);

  useEffect(() => {
    if (!editable) return undefined;

    const handleBeforeSessionStart = (event: Event) => {
      const customEvent = event as CustomEvent<{ promises?: Promise<unknown>[] }>;
      customEvent.detail?.promises?.push(flushPendingSaves());
    };

    window.addEventListener(SESSION_BEFORE_START_EVENT, handleBeforeSessionStart);
    return () => window.removeEventListener(SESSION_BEFORE_START_EVENT, handleBeforeSessionStart);
  }, [editable, flushPendingSaves]);

  const updateSlideNote = useCallback(
    (page: number, notes: string) => {
      if (!editable || !Number.isFinite(page) || page < 1) return;

      setNotesByPage((prev) => ({ ...prev, [page]: notes }));
      clearPendingSave(page);
      timersRef.current[page] = setTimeout(() => {
        delete timersRef.current[page];
        void savePageNote(page, latestNotesRef.current[page] ?? "");
      }, SAVE_DEBOUNCE_MS);
    },
    [clearPendingSave, editable, savePageNote]
  );

  const flushSlideNote = useCallback(
    (page: number) => {
      if (!editable || !Number.isFinite(page) || page < 1) return;
      clearPendingSave(page);
      void savePageNote(page, latestNotesRef.current[page] ?? "");
    },
    [clearPendingSave, editable, savePageNote]
  );

  const hasNotes = useMemo(() => Object.keys(notesByPage).length > 0, [notesByPage]);

  return { notesByPage, loading, error, hasNotes, updateSlideNote, flushSlideNote };
}
