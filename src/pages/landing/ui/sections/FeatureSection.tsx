import { useEffect, useRef } from "react";
import * as C from "./common.styles";
import * as S from "./FeatureSection.styles";
import { Reveal } from "./Reveal";
import type { FeatureBg, FeatureContent, FeatureMediaSlot } from "./featureContent";

const SECTION_BG: Record<FeatureBg, string> = {
  white: "#fff",
  mist: C.palette.mist,
};

const MEDIA_GAP = 48;

// demo-N.webm 파일을 videos/landing에 떨어뜨리면 코드 수정 없이 해당 슬롯에 반영된다.
const DEMO_VIDEO_DIR = "/src/shared/assets/videos/landing";
const demoVideos = import.meta.glob<string>("/src/shared/assets/videos/landing/demo-*.webm", {
  eager: true,
  query: "?url",
  import: "default",
});

const demoVideoUrl = (demo?: number) =>
  demo === undefined ? undefined : demoVideos[`${DEMO_VIDEO_DIR}/demo-${demo}.webm`];

// 정적 스크린샷 슬롯 — images/landing/demo-N.webp(또는 png)도 동일하게 자동 반영.
const DEMO_IMAGE_DIR = "/src/shared/assets/images/landing";
const demoImages = import.meta.glob<string>("/src/shared/assets/images/landing/demo-*.{webp,png}", {
  eager: true,
  query: "?url",
  import: "default",
});

const demoImageUrl = (demo?: number) =>
  demo === undefined
    ? undefined
    : (demoImages[`${DEMO_IMAGE_DIR}/demo-${demo}.webp`] ??
      demoImages[`${DEMO_IMAGE_DIR}/demo-${demo}.png`]);

// 영상 첫 프레임을 뽑아 둔 포스터(poster-N.webp) — 재생 전까지 빈 박스가 보이지 않게 한다.
// demo-* 글롭과 분리해야 영상이 빠졌을 때 포스터가 섹션 이미지로 둔갑하지 않는다.
const demoPosters = import.meta.glob<string>("/src/shared/assets/images/landing/poster-*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});

const demoPosterUrl = (demo?: number) =>
  demo === undefined ? undefined : demoPosters[`${DEMO_IMAGE_DIR}/poster-${demo}.webp`];

type ResolvedSlot = FeatureMediaSlot & {
  videoUrl?: string;
  imageUrl?: string;
  posterUrl?: string;
};

// 데모 영상 합계가 4MB를 넘어 autoPlay로 두면 첫 화면에서 전부 내려받는다.
// preload="metadata"로 치수(레이아웃 확보)만 먼저 받고, 화면에 들어올 때 재생을 시작한다.
const useVideoPlaybackInView = () => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      void el.play().catch(() => {});
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void el.play().catch(() => {});
        else el.pause();
      },
      { root: el.closest("[data-landing-scroll]"), rootMargin: "200px", threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return ref;
};

const DemoMedia = ({
  slot,
  onMist,
  radius,
  bare,
}: {
  slot: ResolvedSlot;
  onMist: boolean;
  radius: number;
  bare?: boolean;
}) => {
  const videoRef = useVideoPlaybackInView();

  return slot.videoUrl ? (
    <S.DemoVideo
      ref={videoRef}
      src={slot.videoUrl}
      poster={slot.posterUrl}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={slot.label}
      $onMist={onMist}
      $radius={radius}
      $bare={bare}
    />
  ) : (
    <S.DemoImage
      src={slot.imageUrl}
      alt={slot.label}
      loading="lazy"
      $onMist={onMist}
      $ratio={`${slot.width} / ${slot.height}`}
      $radius={radius}
      $bare={bare}
    />
  );
};

const BulletRows = ({ bullets }: { bullets: FeatureContent["bullets"] }) => (
  <S.BulletRows>
    {bullets.map(({ icon, title, description }) => (
      <S.BulletRow key={title}>
        <S.BulletIconChip>
          <img src={icon} alt="" width={24} height={24} />
        </S.BulletIconChip>
        <S.BulletText>
          <S.BulletTitle>{title}</S.BulletTitle>
          <S.BulletDesc>{description}</S.BulletDesc>
        </S.BulletText>
      </S.BulletRow>
    ))}
  </S.BulletRows>
);

export const FeatureSection = ({ content }: { content: FeatureContent }) => {
  const { title, description, layout, bg, mediaSlots, bullets, bareMedia } = content;
  const onMist = bg === "mist";
  // 파일이 아직 없는 슬롯은 렌더하지 않는다 (플레이스홀더 없음)
  const media: ResolvedSlot[] = mediaSlots
    .map((slot) => ({
      ...slot,
      videoUrl: demoVideoUrl(slot.demo),
      imageUrl: demoImageUrl(slot.demo),
      posterUrl: demoPosterUrl(slot.demo),
    }))
    .filter((slot) => slot.videoUrl || slot.imageUrl);

  if (layout === "media-right" || layout === "media-left") {
    const mediaLead = layout === "media-left";
    return (
      <C.Section $bg={SECTION_BG[bg]} $padY={150}>
        <C.SplitGrid $reverse={mediaLead}>
          <S.TextCol>
            <Reveal>
              <S.TextColInner>
                <div>
                  <C.SectionMark $align="left" />
                  <C.SectionHeadline $align="left" $max={44}>
                    {title}
                  </C.SectionHeadline>
                </div>
                <C.SectionSubtext $align="left">{description}</C.SectionSubtext>
                <BulletRows bullets={bullets} />
              </S.TextColInner>
            </Reveal>
          </S.TextCol>
          {media[0] && (
            <S.MediaCol $lead={mediaLead}>
              <Reveal>
                <DemoMedia slot={media[0]} onMist={onMist} radius={20} bare={bareMedia} />
              </Reveal>
            </S.MediaCol>
          )}
        </C.SplitGrid>
      </C.Section>
    );
  }

  const mediaMaxWidth =
    media.reduce((sum, slot) => sum + slot.width, 0) + (media.length - 1) * MEDIA_GAP;

  return (
    <C.Section $bg={SECTION_BG[bg]} $padY={150}>
      <S.Wrap>
        <Reveal>
          <S.Header>
            <div>
              <C.SectionMark />
              <C.SectionHeadline $max={46}>{title}</C.SectionHeadline>
            </div>
            <C.SectionSubtext>{description}</C.SectionSubtext>
          </S.Header>
        </Reveal>
        {media.length > 0 && (
          <Reveal>
            <S.MediaRow $maxWidth={mediaMaxWidth}>
              {media.map((slot) => (
                <S.MediaColumn key={slot.label} $grow={slot.width}>
                  <DemoMedia
                    slot={slot}
                    onMist={onMist}
                    radius={media.length > 1 ? 14 : 20}
                    bare={bareMedia}
                  />
                  {slot.caption && <S.MediaCaption>{slot.caption}</S.MediaCaption>}
                </S.MediaColumn>
              ))}
            </S.MediaRow>
          </Reveal>
        )}
        <Reveal>
          <S.InlineBullets>
            {bullets.map(({ icon, title: bulletTitle, description: bulletDesc }) => (
              <S.InlineBullet key={bulletTitle}>
                <S.InlineBulletHead>
                  <img src={icon} alt="" width={24} height={24} />
                  <S.BulletTitle>{bulletTitle}</S.BulletTitle>
                </S.InlineBulletHead>
                <S.BulletDesc>{bulletDesc}</S.BulletDesc>
              </S.InlineBullet>
            ))}
          </S.InlineBullets>
        </Reveal>
      </S.Wrap>
    </C.Section>
  );
};
