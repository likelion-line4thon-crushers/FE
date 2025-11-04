import api from "./api";

export const createRoom = async (totalPages = 10) => {
    const res = await api.post("/api/rooms", {
        count: 50, //50 하드코딩
        totalPages,
    });
    return res.data.data;
};
