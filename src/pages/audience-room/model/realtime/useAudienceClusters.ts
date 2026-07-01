import { useState, useEffect, useRef, useCallback } from "react";
import websocketService from "@/shared/api/websocket";
import type { QuestionCluster } from "@/entities/question";
import { fetchCurrentClusters } from "@/shared/api/question";

const clusterKey = (cluster: QuestionCluster) => cluster.clusterId ?? cluster.representative;

const useAudienceClusters = ({
  roomId,
  isWsReady,
}: {
  roomId?: string | null;
  isWsReady: boolean;
}) => {
  const [clusters, setClusters] = useState<QuestionCluster[]>([]);
  const [expandedReps, setExpandedReps] = useState<Set<string>>(new Set());
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const hasReceivedLiveUpdate = useRef(false);

  const handleClusterUpdate = useCallback((payload: any) => {
    if (payload?.type !== "CLUSTER_UPDATED") return;
    const incoming: QuestionCluster[] = payload?.data?.clusters ?? [];
    hasReceivedLiveUpdate.current = true;
    setClusters(incoming);

    setExpandedReps((prev) => {
      const incomingReps = new Set(incoming.map(clusterKey));
      const next = new Set<string>();
      for (const rep of prev) {
        if (incomingReps.has(rep)) next.add(rep);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!roomId || !isWsReady) {
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
  }, [roomId, isWsReady, handleClusterUpdate]);

  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;

    fetchCurrentClusters(roomId as string).then((restClusters) => {
      if (cancelled || hasReceivedLiveUpdate.current) return;
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

  return { clusters, toggleExpand, isExpanded };
};

export default useAudienceClusters;
