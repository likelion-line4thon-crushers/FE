import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import AudiencePanel from "../../components/Audience/AudiencePanel";
import SidebarSlides from "../../components/SidebarSlides";
import {
  PageContainer,
  CenterContainer,
  RightPanelContainer,
} from "./AudienceViewPage.styles";
import RabbitSVG from "../../assets/images/rabbit.jpg";
import SlideViewer from "../../components/Audience/SlideViewer_audience/SlideViewer_audience";
import EmojiPanel from "../../components/Audience/EmojiPanel";
import { joinRoom } from "../../services/roomService";
import websocketService from "../../services/websocketService";
import interestSelected from "../../assets/icons/Emoji_selected/Interesting_selected.png";
import surpriseSelected from "../../assets/icons/Emoji_selected/surprising_selected.png";
import curiousSelected from "../../assets/icons/Emoji_selected/curious_selected.png";
import excitingSelected from "../../assets/icons/Emoji_selected/Exciting_selected.png";
import angrySelected from "../../assets/icons/Emoji_selected/angry_selected.png";
import sadSelected from "../../assets/icons/Emoji_selected/Sad_selected.png";

const AudienceViewPage = () => {
  const { code } = useParams();

  // 임시 슬라이드 데이터
  const [slides] = useState([
    RabbitSVG,
    RabbitSVG,
    RabbitSVG,
    RabbitSVG,
    RabbitSVG,
  ]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [followPresenter, setFollowPresenter] = useState(true);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [stampsBySlide, setStampsBySlide] = useState({});
  const [showStamps, setShowStamps] = useState(true);
  const [roomId, setRoomId] = useState(null);
  const [audienceId, setAudienceId] = useState(null);
  const [wsUrl, setWsUrl] = useState(null);

  // 코드로 방 입장 처리
  useEffect(() => {
    if (code) {
      const handleJoinRoom = async () => {
        try {
          const joinData = await joinRoom(code);

          window.roomId = joinData.roomId;
          window.audienceId = joinData.audienceId;
          window.audienceToken = joinData.audienceToken;

          setRoomId(joinData.roomId);
          setAudienceId(joinData.audienceId);

          let wsUrlValue = joinData.wsUrl;
          if (!wsUrlValue) {
            const apiBaseUrl =
              import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
            wsUrlValue = `${apiBaseUrl}/ws/audience`;
          }
          setWsUrl(wsUrlValue);
        } catch (err) {
          console.error("방 입장 실패:", err);
          alert("방 입장에 실패했습니다. 코드를 확인해주세요.");
        }
      };
      handleJoinRoom();
    }
  }, [code]);

  useEffect(() => {
    if (!roomId || !audienceId || !wsUrl || !window.audienceToken) return;

    const connectWebSocket = () => {
      // 웹소켓 연결
      websocketService.connect(
        wsUrl,
        window.audienceToken,
        () => {
          console.log("[WebSocket] 연결 성공");

          // 다른 청중의 이모지 반응 구독
          const reactionTopic = `/topic/presentation/${roomId}/reactions`;
          websocketService.subscribe(reactionTopic, (data) => {
            // 다른 청중이 보낸 이모지 반응 처리
            if (data && data.emoji && data.slide !== undefined) {
              const slideIndex = data.slide - 1;
              const emojiId = data.emoji;

              const emojiIcons = {
                1: interestSelected,
                2: surpriseSelected,
                3: curiousSelected,
                4: excitingSelected,
                5: angrySelected,
                6: sadSelected,
              };

              const emojiSrc = emojiIcons[emojiId];
              if (emojiSrc) {
                // x, y 좌표를 퍼센트로 변환

                const xPct = data.x;
                const yPct = data.y;

                setStampsBySlide((prev) => {
                  const next = { ...prev };
                  const key = String(slideIndex);
                  const list = next[key] ? [...next[key]] : [];
                  list.push({ xPct, yPct, src: emojiSrc });
                  next[key] = list;
                  return next;
                });
              }
            }
          });
        },
        (error) => {
          console.error("[WebSocket] 연결 실패:", error);
        }
      );
    };

    connectWebSocket();

    // 컴포넌트 언마운트 시 웹소켓 연결 해제
    return () => {
      websocketService.disconnect();
    };
  }, [roomId, audienceId, wsUrl]);

  const handleSelectEmoji = (emoji) => setSelectedEmoji(emoji);

  const handlePlaceStamp = ({ xPct, yPct }) => {
    if (!selectedEmoji) return;

    if (
      selectedEmoji.id >= 1 &&
      selectedEmoji.id <= 6 &&
      roomId &&
      audienceId
    ) {
      const now = new Date().toISOString();

      // 웹소켓으로 이모지 반응 전송
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
      console.log("[WebSocket] 이모지 반응 전송:", message);
    }

    // 로컬 상태에도 추가
    setStampsBySlide((prev) => {
      const next = { ...prev };
      const key = String(currentSlide);
      const list = next[key] ? [...next[key]] : [];
      list.push({ xPct, yPct, src: selectedEmoji.selectedIcon });
      next[key] = list;
      return next;
    });
  };

  const handleToggleFollowPresenter = (checked) => {
    setFollowPresenter(checked);
  };

  const handleToggleShowStamps = (nextValue) => {
    setShowStamps(nextValue);
  };

  const handleAudienceSelectSlide = (slideIndex) => {
    setFollowPresenter(false);
    setCurrentSlide(slideIndex);
  };

  return (
    <PageContainer>
      {/* 왼쪽 슬라이드 바 */}
      <SidebarSlides
        slides={slides}
        currentSlide={currentSlide}
        setCurrentSlide={setCurrentSlide}
      />
      <CenterContainer>
        <SlideViewer
          slides={slides}
          currentSlide={currentSlide}
          cursorImage={selectedEmoji?.selectedIcon}
          stamps={stampsBySlide[String(currentSlide)] || []}
          onPlace={handlePlaceStamp}
          followPresenter={followPresenter}
          onToggleFollow={handleToggleFollowPresenter}
          showStamps={showStamps}
          onToggleShowStamps={handleToggleShowStamps}
        />
        <EmojiPanel
          selectedId={selectedEmoji?.id}
          onSelect={handleSelectEmoji}
        />
      </CenterContainer>
      {/* 오른쪽 AudiencePanel */}
      <RightPanelContainer>
        <AudiencePanel
          currentSlide={currentSlide}
          onSelectSlide={handleAudienceSelectSlide}
        />
      </RightPanelContainer>
    </PageContainer>
  );
};

export default AudienceViewPage;
