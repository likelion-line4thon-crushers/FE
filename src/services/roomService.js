import api from "./api";

export const createRoom = async (totalPages = 10) => {
  const requestData = {
    count: 50, //50 하드코딩
    totalPages,
  };

  console.log("[createRoom] 방 생성 요청:", {
    endpoint: "/api/rooms",
    requestData,
  });

  try {
    const res = await api.post("/api/rooms", requestData);

    console.log("[createRoom] 방 생성 응답:", {
      status: res.status,
      responseData: res.data,
      extractedData: res.data.data,
    });
    return res.data.data;
  } catch (error) {
    console.error("[createRoom] 방 생성 실패:", {
      error,
      requestData,
    });
    throw error;
  }
};

export const joinRoom = async (code) => {
  const res = await api.get(`/api/rooms/join/${code}`);
  return res.data.data;
};

export const startSession = async (roomId) => {
  try {
    const res = await api.post(`/api/rooms/${roomId}/session/start`);
    console.log("POST 요청 성공!");
    return res.data.data;
  } catch (error) {
    console.error("POST 요청 실패:", error);
    throw error;
  }
};

export const closeSession = async (roomId) => {
  if (!roomId) {
    throw new Error("roomId가 필요합니다.");
  }

  try {
    const res = await api.delete(`/api/rooms/close/${roomId}`);
    return res?.data?.data ?? null;
  } catch (error) {
    console.error("[closeSession] 세션 종료 실패:", error);
    throw error;
  }
};

export const leaveRoom = async (roomId, audienceId, audienceJWT) => {
  if (!roomId || !audienceId || !audienceJWT) {
    throw new Error("roomId, audienceId, audienceJWT가 필요합니다.");
  }

  try {
    const res = await api.post(`/api/rooms/leave/${roomId}`, {
      audienceId,
      audienceJWT,
    });
    return res?.data?.data ?? null;
  } catch (error) {
    throw error;
  }
};

// 새로고침 시 현재 방 정보 조회
export const getRoomInfo = async (roomId) => {
  if (!roomId) {
    throw new Error("roomId가 필요합니다.");
  }

  try {
    const res = await api.post(`/api/roomAudience/rooms/${roomId}/info`);
    console.log("[getRoomInfo] 방 정보 조회 응답:", {
      status: res.status,
      responseData: res.data,
      extractedData: res.data.data,
    });
    return res.data.data;
  } catch (error) {
    console.error("[getRoomInfo] 방 정보 조회 실패:", error);
    throw error;
  }
};
