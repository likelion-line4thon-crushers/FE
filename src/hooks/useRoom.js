import { useState } from "react";
import { createRoom } from "../services/roomService";

export default function useRoom() {
    const [roomData, setRoomData] = useState(null);
    const [loading, setLoading] = useState(false);

    const initRoom = async (totalPages) => {
        setLoading(true);
        try {
            const data = await createRoom(totalPages);
            setRoomData(data);

            // presenterKey는 메모리에만 저장
            window.presenterKey = data.presenterKey;
            return data;
        } catch (err) {
            console.error("방 생성 실패:", err);
            alert("방 생성에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return { roomData, loading, initRoom };
}
