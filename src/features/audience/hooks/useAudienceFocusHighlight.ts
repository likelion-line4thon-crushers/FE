import { useState, useEffect, useRef } from "react";

const useAudienceFocusHighlight = () => {
  const [showFocusHighlight, setShowFocusHighlight] = useState(false);
  const focusHighlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerFocusHighlight = () => {
    setShowFocusHighlight(true);
    if (focusHighlightTimeoutRef.current) {
      clearTimeout(focusHighlightTimeoutRef.current);
    }
    focusHighlightTimeoutRef.current = setTimeout(() => {
      setShowFocusHighlight(false);
      focusHighlightTimeoutRef.current = null;
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (focusHighlightTimeoutRef.current) {
        clearTimeout(focusHighlightTimeoutRef.current);
        focusHighlightTimeoutRef.current = null;
      }
    };
  }, []);

  return {
    showFocusHighlight,
    triggerFocusHighlight,
  };
};

export default useAudienceFocusHighlight;

