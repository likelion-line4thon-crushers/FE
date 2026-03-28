import { useState, useEffect } from "react";
import { useLocation } from "react-router";

/**
 * * Resolves roomData from props or sessionStorage fallback.
 */
export const useHeaderRoomData = (propRoomData: any) => {
  const location = useLocation();
  const [roomData, setRoomData] = useState(propRoomData || null);
  const [fileName, setFileName] = useState(location.state?.fileName || "");

  useEffect(() => {
    if (!roomData) {
      const stored =
        sessionStorage.getItem("boini_room") ||
        sessionStorage.getItem("roomData");
      if (stored) {
        setRoomData(JSON.parse(stored));
      }
    }
  }, [roomData]);

  useEffect(() => {
    if (!fileName && location.state?.fileName) {
      setFileName(location.state.fileName);
    }
  }, [location.state]);

  return { roomData, setRoomData, fileName };
};
