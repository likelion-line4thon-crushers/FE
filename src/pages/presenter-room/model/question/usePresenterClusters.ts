import { useState, useEffect, useRef, useCallback } from "react";
import websocketService from "@/shared/api/websocket";
import type { QuestionCluster } from "@/entities/question";
import { fetchCurrentClusters } from "@/shared/api/question";

const storageKey = (roomId: string) => `boini_clusters_${roomId}`;

const loadCachedClusters = (roomId: string): QuestionCluster[] => {
  try {
    const raw = sessionStorage.getItem(storageKey(roomId));
    if (!raw) return [];
    return JSON.parse(raw) as QuestionCluster[];
  } catch {
    return [];
  }
};

const saveClusters = (roomId: string, clusters: QuestionCluster[]) => {
  try {
    sessionStorage.setItem(storageKey(roomId), JSON.stringify(clusters));
  } catch {
    // ignore storage errors
  }
};

const usePresenterClusters = ({
  roomId,
  isPresenterWsReady,
}: {
  roomId?: string;
  isPresenterWsReady: boolean;
}) => {
  const [clusters, setClusters] = useState<QuestionCluster[]>(() =>
    roomId ? loadCachedClusters(roomId) : []
  );
  const [expandedReps, setExpandedReps] = useState<Set<string>>(new Set());
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const hasReceivedLiveUpdate = useRef(false);
  const dismissedRepsRef = useRef<Set<string>>(new Set());

  // Fix 2: single persistence effect — no saveClusters calls elsewhere
  useEffect(() => {
    if (roomId) saveClusters(roomId, clusters);
  }, [clusters, roomId]);

  const handleClusterUpdate = useCallback((payload: any) => {
    if (payload?.type !== "CLUSTER_UPDATED") return;
    const incoming: QuestionCluster[] = payload?.data?.clusters ?? [];

    hasReceivedLiveUpdate.current = true;

    // Fix 1: filter out dismissed clusters so a racing WS message can't resurrect them
    const filtered = incoming.filter((c) => !dismissedRepsRef.current.has(c.representative));

    // Prune the dismissed set against the raw incoming list — once the server stops
    // sending a representative it's no longer suppressed, allowing genuine future
    // clusters with the same text to appear.
    dismissedRepsRef.current = new Set(
      [...dismissedRepsRef.current].filter((rep) => incoming.some((c) => c.representative === rep))
    );

    setClusters(filtered);

    // Preserve expand state — match by representative string, not index
    setExpandedReps((prev) => {
      const filteredReps = new Set(filtered.map((c) => c.representative));
      const next = new Set<string>();
      for (const rep of prev) {
        if (filteredReps.has(rep)) next.add(rep);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!roomId || !isPresenterWsReady) {
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
      return;
    }

    const topic = `/topic/p/${roomId}/clusters`;
    const unsub = websocketService.subscribe(topic, handleClusterUpdate);
    if (typeof unsub === "function") {
      unsubscribeRef.current = unsub;
    }

    return () => {
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    };
  }, [roomId, isPresenterWsReady, handleClusterUpdate]);

  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;

    fetchCurrentClusters(roomId).then((restClusters) => {
      if (cancelled || hasReceivedLiveUpdate.current) return;
      // Empty array = empty room OR transient AI-server error (indistinguishable); keep cached paint.
      if (restClusters.length === 0) return;
      setClusters(restClusters);
    });

    return () => {
      cancelled = true;
      hasReceivedLiveUpdate.current = false;
    };
  }, [roomId]);

  const toggleExpand = useCallback((representative: string) => {
    setExpandedReps((prev) => {
      const next = new Set(prev);
      if (next.has(representative)) {
        next.delete(representative);
      } else {
        next.add(representative);
      }
      return next;
    });
  }, []);

  const isExpanded = useCallback(
    (representative: string) => expandedReps.has(representative),
    [expandedReps]
  );

  const dismissCluster = useCallback((representative: string) => {
    // Fix 1: record dismissal before touching state so the ref is set atomically
    dismissedRepsRef.current.add(representative);
    setClusters((prev) => prev.filter((c) => c.representative !== representative));
    setExpandedReps((prev) => {
      const next = new Set(prev);
      next.delete(representative);
      return next;
    });
  }, []);

  return { clusters, toggleExpand, isExpanded, dismissCluster };
};

export default usePresenterClusters;
