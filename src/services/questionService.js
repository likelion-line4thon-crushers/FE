import api from "./api";

const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  if (params.fromTs != null && !Number.isNaN(params.fromTs)) {
    searchParams.set("fromTs", params.fromTs);
  }

  if (params.slide != null && !Number.isNaN(params.slide)) {
    searchParams.set("slide", params.slide);
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};

export const fetchRoomQuestions = async (roomId, options = {}) => {
  if (!roomId) {
    throw new Error("roomId가 필요합니다.");
  }

  const query = buildQueryString(options);

  const response = await api.get(`/api/questions/rooms/${roomId}${query}`);
  const data = response?.data?.data;

  if (!Array.isArray(data)) {
    return [];
  }

  return data;
};
