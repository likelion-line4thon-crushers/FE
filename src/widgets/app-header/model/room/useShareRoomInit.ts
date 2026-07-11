import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createRoom } from "@/shared/api/room";
import { createLogger } from "@/shared/lib/logger";
import { resolveShareJoinUrl } from "./resolveShareJoinUrl";

const log = createLogger("share");

/**
 * 공유 모달의 세션 링크 준비: roomData 가 있으면 joinUrl 만 해석하고,
 * 없으면(랜딩에서 바로 공유) 방을 새로 만들어 링크를 얻는다.
 */
export const useShareRoomInit = ({
  roomData,
  totalPages,
}: {
  roomData?: Parameters<typeof resolveShareJoinUrl>[0];
  totalPages: number;
}) => {
  const [sessionLink, setSessionLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { mutateAsync: createRoomAsync } = useMutation({
    mutationFn: (pages: number) => createRoom(pages),
  });

  useEffect(() => {
    if (roomData) {
      const resolvedJoinUrl = resolveShareJoinUrl(roomData);
      if (!resolvedJoinUrl) {
        setError("공유 링크를 생성할 수 없습니다.");
      } else {
        setSessionLink(resolvedJoinUrl);
        setError("");
      }
      setLoading(false);
      return;
    }

    const initRoom = async () => {
      try {
        const data = await createRoomAsync(totalPages);
        const resolvedJoinUrl = resolveShareJoinUrl(data);
        if (!resolvedJoinUrl) {
          throw new Error("joinUrl resolve failed");
        }
        setSessionLink(resolvedJoinUrl);
      } catch (err) {
        log.error("방 생성 실패:", err);
        setError("방 생성 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    initRoom();
  }, [roomData, totalPages, createRoomAsync]);

  return { sessionLink, loading, error };
};
