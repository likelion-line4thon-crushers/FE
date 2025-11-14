import { useCallback } from "react";
import websocketService from "../services/websocketService";
import SELECTED_EMOJI_ICONS from "../constants/emojiIcons";

const useAudienceEventHandlers = ({
  selectedEmoji,
  setSelectedEmoji,
  reactionsReady,
  roomId,
  audienceId,
  wsUrl,
  currentSlide,
  addLocalStamp,
  showStamps,
  setShowStamps,
}) => {
  const handleSelectEmoji = useCallback(
    (emoji) => setSelectedEmoji(emoji),
    [setSelectedEmoji]
  );

  const handlePlaceStamp = useCallback(
    ({ xPct, yPct }) => {
      if (
        !selectedEmoji ||
        !reactionsReady ||
        !roomId ||
        !audienceId ||
        !wsUrl
      ) {
        return;
      }

      if (selectedEmoji.id >= 1 && selectedEmoji.id <= 8) {
        const now = new Date().toISOString();

        const destination = `/app/presentation/${roomId}/reaction`;
        const message = {
          emoji: selectedEmoji.id,
          audienceID: audienceId,
          created_at: now,
          x: xPct,
          y: yPct,
          slide: currentSlide + 1,
        };

        websocketService.send(destination, message);

        const stickerSrc = SELECTED_EMOJI_ICONS[selectedEmoji.id];
        if (stickerSrc) {
          addLocalStamp(currentSlide, {
            id: now,
            xPct,
            yPct,
            src: stickerSrc,
          });
        }
      }
    },
    [
      selectedEmoji,
      reactionsReady,
      roomId,
      audienceId,
      wsUrl,
      currentSlide,
      addLocalStamp,
    ]
  );

  const handleToggleShowStamps = useCallback(
    (nextValue) => {
      setShowStamps(nextValue);
    },
    [setShowStamps]
  );

  return {
    handleSelectEmoji,
    handlePlaceStamp,
    handleToggleShowStamps,
  };
};

export default useAudienceEventHandlers;
