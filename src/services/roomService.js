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
