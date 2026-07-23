import React, { useRef, useState } from "react";
import type { SyntheticEvent } from "react";
import styled, { css } from "styled-components";
import { HighlightedSlideStyles } from "./SlideViewer.styles";
import {
  slideContentFractions,
  stampBoxStyle,
  imageNaturalRatio,
  SLIDE_BOX_ASPECT,
} from "@/shared/lib/slide-geometry";
import { useElementAspectRatio } from "@/shared/lib/use-element-aspect-ratio";

/**
 * 공용 슬라이드 컨테이너
 * - 슬라이드 이미지를 감싸는 기본 박스
 * - 발표 준비/진행 페이지 모두에서 재사용 가능
 */
const SlideContainer = ({
  src,
  alt = "슬라이드 이미지",
  stamps = [] as any[],
  showStamps = true,
  highlight = false,
  testId,
  dataTour,
}: any) => {
  const imageBorderColor = highlight ? "#ffc551" : "#eee";

  const hasSrc = typeof src === "string" && src.length > 0;

  // 레터박스를 제외한 실제 슬라이드 콘텐츠 영역 — 스탬프 좌표(콘텐츠 기준 %)의 기준
  // 박스는 flex 축소로 16:9 에서 벗어날 수 있으므로 실측 비율을 쓴다
  const boxRef = useRef<HTMLDivElement | null>(null);
  const boxRatio = useElementAspectRatio(boxRef);
  const [naturalRatio, setNaturalRatio] = useState<number | null>(null);
  const contentFractions = slideContentFractions(naturalRatio, boxRatio ?? SLIDE_BOX_ASPECT);

  const handleImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    setNaturalRatio(imageNaturalRatio(e.currentTarget));
  };

  // 캐시된 이미지는 onLoad 를 놓칠 수 있어 ref 시점에 complete 여부도 확인
  const attachImage = (img: HTMLImageElement | null) => {
    if (img && img.complete) {
      setNaturalRatio(imageNaturalRatio(img));
    }
  };

  return (
    <SlideBox ref={boxRef} highlight={highlight} data-testid={testId} data-tour={dataTour}>
      {hasSrc ? (
        <img
          key={src}
          ref={attachImage}
          src={src}
          alt={alt}
          onLoad={handleImageLoad}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            borderRadius: "0.6vw",
            border: `0.05vw solid ${imageBorderColor}`,
            userSelect: "none",
            pointerEvents: "none",
          }}
        />
      ) : (
        <PendingLabel>슬라이드 렌더링 중...</PendingLabel>
      )}
      {showStamps &&
        Array.isArray(stamps) &&
        stamps.map((stamp, index) => (
          <StampImage
            key={stamp.id || `${stamp.xPct}-${stamp.yPct}-${index}`}
            src={stamp.src}
            style={stampBoxStyle(stamp.xPct, stamp.yPct, contentFractions)}
            alt="reaction"
          />
        ))}
    </SlideBox>
  );
};

export default SlideContainer;

/* ===============================
   Styled Components
=============================== */
const SlideBox = styled.div<{ highlight?: boolean }>`
  position: relative;
  background-color: #ffffff;
  border-radius: 0.6vw;
  border: 0.05vw solid #ddd;
  width: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  aspect-ratio: 16 / 9; /* 16:9 비율 유지 */

  ${({ highlight }) => (highlight ? HighlightedSlideStyles : css``)}
`;

const StampImage = styled.img`
  position: absolute;
  transform: translate(-50%, -50%);
  /* 슬라이드 폭 대비 상대 크기 — broadcast(3.4cqw)와 동일 비율로 기기 무관하게 일치 */
  width: 3.4%;
  height: auto;
  aspect-ratio: 1;
  object-fit: contain;
  pointer-events: none;
`;

const PendingLabel = styled.div`
  color: #999;
  font-size: 0.9vw;
  letter-spacing: 0.02em;
`;
