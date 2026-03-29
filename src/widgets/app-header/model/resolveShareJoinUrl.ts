type ShareRoomData = {
  code?: string | null;
  joinUrl?: string | null;
};

const getCodeFromJoinUrl = (joinUrl?: string | null) => {
  if (!joinUrl) {
    return null;
  }

  try {
    const url = new URL(joinUrl, window.location.origin);
    const segments = url.pathname.split("/").filter(Boolean);
    const lastSegment = segments.length > 0 ? segments[segments.length - 1] : null;
    return lastSegment ? decodeURIComponent(lastSegment) : null;
  } catch {
    return null;
  }
};

export const resolveShareJoinUrl = (roomData?: ShareRoomData | null) => {
  if (!roomData) {
    return null;
  }

  const code = roomData.code || getCodeFromJoinUrl(roomData.joinUrl);
  if (!code) {
    return null;
  }

  return `${window.location.origin}/join/${encodeURIComponent(code)}`;
};
