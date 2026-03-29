import React, { useState, useEffect } from "react";
import { Overlay, LoaderRing, Center, Logo, Message } from "./SessionLoadingOverlay.styles";
import Emoji1 from "@/shared/assets/images/emoji1.svg";
import Emoji2 from "@/shared/assets/images/emoji2.svg";
import Emoji3 from "@/shared/assets/images/emoji3.svg";
import Emoji4 from "@/shared/assets/images/emoji4.svg";

const SessionLoadingOverlay = ({ message = "세션 자료 정리 중..." }) => {
  const logos = [Emoji1, Emoji2, Emoji3, Emoji4];
  const [currentLogo, setCurrentLogo] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLogo((prev) => (prev + 1) % logos.length);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Overlay>
      <Center>
        <LoaderRing />
        {logos.map((logo, i) => (
          <Logo key={i} src={logo} alt={`logo-${i}`} $active={i === currentLogo} />
        ))}
      </Center>
      <Message>{message}</Message>
    </Overlay>
  );
};

export default SessionLoadingOverlay;
