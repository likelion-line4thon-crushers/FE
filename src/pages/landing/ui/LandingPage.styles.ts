import styled, { css, keyframes } from "styled-components";
import { MEDIA } from "@/shared/config/breakpoints";

/* === 랜딩 전용 스크롤 컨테이너 — 앱 전역은 스크롤 잠금(global.css)이라 여기서만 연다 === */
export const PageScroll = styled.div`
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  background: #fff;
  /* 한국어 카피가 단어 중간에서 꺾이지 않도록 페이지 전체에 상속 */
  word-break: keep-all;
`;

/* === 랜딩 자체 헤더 — 일반 흐름(스크롤과 함께 올라간다), 피그마: 65px / 로고 32px === */
export const TopBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 65px;
  background: #fff;
  border-bottom: 1px solid #eaeaea;
`;

/* 로고 + 베타 배지 묶음 — 헤더/CTA 바/푸터에서 함께 정렬. $logo로 로고 높이 지정(기본 26) */
export const BrandLock = styled.div<{ $logo?: number }>`
  display: inline-flex;
  align-items: center;
  gap: 7px;

  img {
    height: ${({ $logo = 26 }) => $logo}px;
    width: auto;
  }
`;

/* 아직 베타 서비스임을 로고 옆에 작게 명시 (BrandLock의 align-items: center로 로고와 수직 중앙 정렬) */
export const BetaTag = styled.span`
  padding: 2px 7px;
  background: #fdf0e8;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.2px;
  line-height: 1.35;
  color: #e74d07;
  text-transform: lowercase;
`;

/* === 푸터 — 넓은 화면은 좌(브랜드)/우(연락처) 정렬, 모바일은 가운데 정렬 === */
export const Footer = styled.footer`
  padding: 44px 24px 52px;
  background: #fff;
  border-top: 1px solid #eaeaea;
`;

export const FooterInner = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;

  @media ${MEDIA.mobile} {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 22px;
  }
`;

export const FooterCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;

  /* 오른쪽 열은 우측 정렬 + 왼쪽 열(더 큼)의 바닥에 맞춰 하단 정렬 */
  &:last-child {
    align-items: flex-end;
    align-self: flex-end;
  }

  @media ${MEDIA.mobile} {
    align-items: center;
    gap: 8px;

    &:last-child {
      align-items: center;
      align-self: auto;
    }
  }
`;

export const FooterTagline = styled.p`
  margin: 2px 0 0;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.3px;
  color: #303030;
`;

export const FooterLink = styled.a`
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: -0.2px;
  color: #303030;
  text-decoration: none;
  transition: color 0.15s ease;

  &:hover {
    color: #e74d07;
    text-decoration: underline;
  }
`;

export const FooterCopy = styled.p`
  margin: 0;
  font-size: 12.5px;
  line-height: 19px;
  letter-spacing: -0.2px;
  color: #767676;
`;

/* === 스크롤 CTA 바 — 첫 섹션을 지나면 블러 배경으로 내려온다 === */
export const CtaBar = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 10px clamp(20px, 3vw, 40px);
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border-bottom: 1px solid rgba(48, 48, 48, 0.08);
  transform: translateY(${({ $show }) => ($show ? "0" : "-100%")});
  visibility: ${({ $show }) => ($show ? "visible" : "hidden")};

  @media (prefers-reduced-motion: no-preference) {
    transition:
      transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
      visibility 0.35s;
  }

  /* 블러 미지원 환경은 불투명 배경으로 대체 */
  @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
    background: rgba(255, 255, 255, 0.97);
  }
`;

export const CtaBarInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
`;

export const CtaBarButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 20px 11px 22px;
  background: #e74d07;
  border: none;
  border-radius: 999px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.3px;
  color: #fff;
  cursor: pointer;
  transition:
    background 0.15s ease,
    transform 0.15s ease;

  img {
    width: 15px;
    height: 15px;
  }

  &:hover {
    background: #d64604;
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.98);
  }
`;

/* === 히어로(첫 화면) — 피그마 Desktop-164 (1920×1080) 기준 ===
 * 사이드 레일 291px(15.16%) | 중앙 1337px, 셀 300:317:300:300 / gap 28 / 라운딩 20px
 * 장식 값은 px 고정(테두리 2px, 라운딩), 간격만 뷰포트에 비례 축소한다. */

// 피그마의 빗금: 1px #EAEAEA 라인이 3.3px 주기(45° 방향)
const hatch = css`
  background-image: repeating-linear-gradient(
    135deg,
    #eaeaea 0,
    #eaeaea 1px,
    transparent 1px,
    transparent 3.3px
  );
`;

export const MainLayout = styled.div`
  display: grid;
  grid-template-columns: 15.16% 1fr 15.16%;
  width: 100%;
  /* 랜딩 자체 헤더(65px)가 스크롤 흐름에 있으므로 첫 화면 = 뷰포트 - 헤더 */
  height: calc(100% - 65px);
  background: #fff;
  box-sizing: border-box;

  @media ${MEDIA.tabletDown} {
    grid-template-columns: 1fr;
  }
`;

/* === 좌우 사이드 레일 — 셀 그리드와 1px 헤어라인으로 구분 === */
export const Side = styled.div`
  padding: 12px 20px;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;

  @media ${MEDIA.tabletDown} {
    display: none;
  }
`;

export const SideInner = styled.div`
  width: 100%;
  height: 100%;
  border: 2px dashed #eaeaea;
  border-radius: 8px;
  ${hatch}
  box-sizing: border-box;
`;

/* === 중앙 셀 그리드 ===
 * e1~e4: 이모지 셀 · s1~s4: 빗금 셀 · c: 타이틀+업로드 */
export const CenterGrid = styled.div`
  display: grid;
  /* 가운데 행만 내용 하한(min-content)을 둔다: 뷰포트가 짧아지면(브라우저 확대 등)
     양쪽 이모지 행이 공간을 양보하고, 타이틀+탭+업로드는 겹치지 않고 한 화면에 남는다 */
  grid-template-rows: minmax(0, 1fr) minmax(min-content, 1fr) minmax(0, 1fr);
  grid-template-columns: 300fr 317fr 300fr 300fr;
  grid-template-areas:
    "e1 s1 s1 e2"
    "s2 c  c  s3"
    "e3 s4 e4 s3";
  gap: clamp(16px, 1.46vw, 28px);
  width: 100%;
  height: 100%;
  padding: clamp(18px, 2.8vh, 30px) 16px;
  box-sizing: border-box;
  border-left: 1px solid #eaeaea;
  border-right: 1px solid #eaeaea;
  overflow: hidden;

  @media ${MEDIA.tabletDown} {
    border-left: none;
    border-right: none;
  }

  /* 모바일: 빗금 셀은 접고, 이모지 4장을 타이틀 위아래로 엇갈리게 배치 */
  @media ${MEDIA.mobile} {
    grid-template-rows: auto auto auto;
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "e1 e2"
      "c  c"
      "e3 e4";
    align-content: center;
    gap: 12px;
    padding: 24px 20px;
  }
`;

type CellArea = "e1" | "e2" | "e3" | "e4" | "s1" | "s2" | "s3" | "s4";

// 스티커 부유 모션 — 기울기(--tilt)를 유지한 채 떠올랐다 가라앉으며 살짝 더 기운다
const stickerFloat = keyframes`
  from { transform: translateY(0) rotate(var(--tilt)); }
  to { transform: translateY(-10px) rotate(calc(var(--tilt) + 2deg)); }
`;

// 모바일 이모지 스티커 배치 — 크기·기울기·오프셋·부유 타이밍을 엇갈리게
const MOBILE_EMOJI: Record<string, ReturnType<typeof css>> = {
  e1: css`
    justify-self: start;
    width: 118px;
    margin-left: 4px;
    --tilt: -5deg;
    --float-dur: 3.4s;
    --float-delay: 0s;
  `,
  e2: css`
    justify-self: end;
    width: 92px;
    margin-top: 40px;
    margin-right: 8px;
    --tilt: 4deg;
    --float-dur: 3.8s;
    --float-delay: 0.6s;
  `,
  e3: css`
    justify-self: start;
    width: 94px;
    margin-top: 20px;
    margin-left: 20px;
    --tilt: 4deg;
    --float-dur: 3.6s;
    --float-delay: 1.1s;
  `,
  e4: css`
    justify-self: end;
    width: 124px;
    margin-top: -12px;
    --tilt: -4deg;
    --float-dur: 4s;
    --float-delay: 0.3s;
  `,
};

/* === 각 셀 — 피그마: 흰 배경, 2px #EAEAEA, 라운딩 20px === */
export const Box = styled.div<{ $striped?: boolean; $area: CellArea }>`
  grid-area: ${({ $area }) => $area};
  border: 2px solid #eaeaea;
  border-radius: 20px;
  box-sizing: border-box;
  background: #fff;
  overflow: hidden;

  ${({ $striped }) => $striped && hatch}

  /* 이모지는 셀을 가득 채운다 (피그마: 300×300 셀 = 이모지 프레임) */
  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  @media ${MEDIA.mobile} {
    ${({ $striped }) =>
      $striped
        ? css`
            display: none;
          `
        : css`
            height: auto;
            aspect-ratio: 1;
            border-radius: 16px;
            transform: rotate(var(--tilt));

            @media (prefers-reduced-motion: no-preference) {
              animation: ${stickerFloat} var(--float-dur, 3.6s) ease-in-out var(--float-delay, 0s)
                infinite alternate;
            }
          `}
    ${({ $area }) => MOBILE_EMOJI[$area]}
  }
`;

/* === 중앙 컨텐츠 (타이틀 + 업로드) === */
export const CenterContent = styled.div`
  grid-area: c;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: clamp(18px, 2.6vh, 28px);
  min-width: 0;
  min-height: 0;
  box-sizing: border-box;

  @media ${MEDIA.mobile} {
    padding: 20px 0;
  }
`;

/* === 히어로 패널 — 탭과 입력 바를 타이틀보다 촘촘하게 묶는다 === */
export const HeroPanel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  /* 짧은 뷰포트에서만 촘촘해진다 (기본 화면에선 상한 14px에 걸려 그대로) */
  gap: clamp(8px, 1.6vh, 14px);
  width: 100%;
`;

/* 바 교체 모션 — 이전 바가 아래로 가라앉아 사라진 뒤, 새 바가 같은 자리에서 떠오른다.
 * 퇴장 시간(0.18s)은 LandingPage.tsx의 PANEL_SWAP_MS와 맞춰야 한다 */
const panelOut = keyframes`
  to { opacity: 0; transform: translateY(14px); }
`;

const panelIn = keyframes`
  from { opacity: 0; transform: translateY(14px); }
`;

/* $animate: 첫 페이지 로드에는 등장 모션 없이 그리고, 탭 전환(스왑)부터만 튼다 */
export const HeroSwap = styled.div<{ $exiting?: boolean; $animate?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(6px, 1.2vh, 10px);
  width: 100%;

  @media (prefers-reduced-motion: no-preference) {
    animation: ${({ $exiting, $animate }) =>
      $exiting
        ? css`
            ${panelOut} 0.18s cubic-bezier(0.4, 0, 1, 1) forwards
          `
        : $animate
          ? css`
              ${panelIn} 0.3s cubic-bezier(0.16, 1, 0.3, 1)
            `
          : "none"};
  }
`;

/* === 히어로 탭 — 발표자/참여자 전환 (데스크톱 전용, 모바일은 참여 폼만) ===
 * 컨테이너 패딩 4px 기준: 잉크 오버레이를 clip-path inset(4px 50% 4px 4px)로 왼쪽
 * 절반만 남기고, 탭이 바뀌면 inset의 좌우만 뒤집어 배경이 미끄러지듯 이동한다 */
export const HeroTabs = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  width: fit-content;
  padding: 4px;
  background: #f5f5f5;
  border: 1px solid #eaeaea;
  border-radius: 999px;
  box-sizing: border-box;
`;

export const HeroTabButton = styled.button`
  border: none;
  background: none;
  padding: clamp(7px, 1.2vh, 10px) 26px;
  border-radius: 999px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.35px;
  line-height: 1;
  color: #767676;
  cursor: pointer;
  transition: color 0.15s ease;

  &:hover {
    color: #303030;
  }
`;

export const HeroTabIndicator = styled.div<{ $tab: "presenter" | "audience" }>`
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  padding: 4px;
  box-sizing: border-box;
  background: #303030;
  pointer-events: none;
  clip-path: ${({ $tab }) =>
    $tab === "presenter"
      ? "inset(4px 50% 4px 4px round 999px)"
      : "inset(4px 4px 4px 50% round 999px)"};

  @media (prefers-reduced-motion: no-preference) {
    transition: clip-path 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  span {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(7px, 1.2vh, 10px) 26px;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: -0.35px;
    line-height: 1;
    color: #fff;
  }
`;

// CTA 클릭 후 업로드 박스로 시선을 끌기 위한 짧은 상하 흔들기
const uploadNudge = keyframes`
  0%, 100% { transform: translateY(0); }
  20% { transform: translateY(-6px); }
  45% { transform: translateY(4px); }
  70% { transform: translateY(-2px); }
`;

/* === 업로드 박스 — 피그마 Component 101: 618×52, #FAFAFA, 2px #5C5C5C, r16 ===
 * 데스크톱 '발표자예요' 탭에서만 렌더된다 (모바일은 세션 코드 입력으로 대체) */
export const UploadBox = styled.div<{
  $dragging?: boolean;
  $hasFile?: boolean;
  $highlight?: boolean;
}>`
  display: flex;
  align-items: center;
  width: 95.8%;
  min-height: clamp(44px, 6vh, 52px);
  border: 2px solid #5c5c5c;
  border-radius: 16px;
  background: #fafafa;
  padding: 4px 6px 4px 14px;
  box-sizing: border-box;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    border-color: #e8541e;
    box-shadow: 0 2px 6px rgba(232, 84, 30, 0.1);
  }

  ${({ $dragging }) =>
    $dragging &&
    css`
      border-color: #00aaff;
      background: #f0faff;
      box-shadow: 0 0 8px rgba(0, 170, 255, 0.2);
    `}

  /* 파일 선택 상태 — 피그마 Component 101(selected): #101010 / 2px #303030 / 칩 #E74D07 */
  ${({ $hasFile }) =>
    $hasFile &&
    css`
      background: #101010;
      border-color: #303030;

      &:hover {
        border-color: #303030;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.24);
      }
    `}

  /* CTA로 스크롤 업 직후 강조 — 테두리를 활성색(#E74D07)으로 바꾸며 잠깐 흔든다 */
  ${({ $highlight }) =>
    $highlight &&
    css`
      border-color: #e74d07;
      box-shadow: 0 4px 16px rgba(231, 77, 7, 0.2);

      @media (prefers-reduced-motion: no-preference) {
        animation: ${uploadNudge} 0.5s ease;
      }
    `}

  .file-name {
    color: #767676;
    font-size: 14px;
    letter-spacing: -0.35px;
    line-height: 20px;
    flex: 1;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    ${({ $hasFile }) =>
      $hasFile &&
      css`
        color: #fff;
        font-weight: 600;
      `}
  }

  /* 화살표 칩 — 피그마: 40×40, r10, #EAEAEA, 우측 인셋 8px(테두리 2 + 패딩 6) */
  .arrow {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    margin-left: 8px;
    background-color: #eaeaea;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s ease;

    img {
      width: 20px;
      height: 20px;
      display: block;
    }

    ${({ $hasFile }) =>
      $hasFile &&
      css`
        background-color: #e74d07;
      `}
  }
`;

/* === 세션 코드 참여 폼 — 6자리 OTP 셀 (백엔드 CodeService: 숫자 6자리 고정) ===
 * 모바일에선 항상, 데스크톱에선 '참여자예요' 탭일 때 렌더된다 */
export const JoinForm = styled.form<{ $hasCode?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: clamp(44px, 6vh, 52px);

  .arrow {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border: none;
    background: ${({ $hasCode }) => ($hasCode ? "#e74d07" : "#eaeaea")};
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s ease;

    &:disabled {
      cursor: default;
    }

    img {
      width: 20px;
      height: 20px;
    }
  }
`;

// 마지막 셀의 커서 — 입력 대기 상태를 깜빡임으로 알린다
const caretBlink = keyframes`
  0%, 45% { opacity: 1; }
  55%, 100% { opacity: 0; }
`;

// 숫자가 채워질 때 살짝 눌렸다 펴지는 팝
const digitPop = keyframes`
  from { transform: scale(0.85); }
  to { transform: scale(1); }
`;

// 존재하지 않는 세션 — 셀 묶음이 한 번 흔들린다
const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-7px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(3px); }
`;

// 세션 확인 실패 전용 — 브랜드 오렌지와 구분되는 경고 레드
const ERROR_RED = "#e5484d";

/* 셀들 위를 투명한 실제 input이 덮는다 — 어디를 눌러도 포커스되고,
 * 붙여넣기·백스페이스·키보드 조작이 전부 네이티브로 동작한다 */
export const OtpField = styled.div<{ $error?: boolean }>`
  position: relative;
  display: flex;
  gap: 8px;
  cursor: text;

  @media ${MEDIA.mobile} {
    gap: 6px;
  }

  ${({ $error }) =>
    $error &&
    css`
      @media (prefers-reduced-motion: no-preference) {
        animation: ${shake} 0.4s ease;
      }
    `}

  input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    border: none;
    outline: none;
    background: transparent;
    /* iOS 자동 확대 방지: 16px 미만 금지 */
    font-size: 16px;
    caret-color: transparent;
  }
`;

export const OtpCell = styled.div<{ $filled: boolean; $active: boolean; $error?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: clamp(38px, 9.5vw, 44px);
  height: clamp(44px, 6vh, 52px);
  border: 2px solid
    ${({ $active, $filled, $error }) =>
      $error ? ERROR_RED : $active ? "#e74d07" : $filled ? "#5c5c5c" : "#eaeaea"};
  border-radius: 12px;
  background: ${({ $filled }) => ($filled ? "#fff" : "#fafafa")};
  box-sizing: border-box;
  font-size: 20px;
  font-weight: 700;
  color: #303030;
  font-variant-numeric: tabular-nums;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;

  ${({ $filled }) =>
    $filled &&
    css`
      @media (prefers-reduced-motion: no-preference) {
        animation: ${digitPop} 0.12s ease;
      }
    `}

  /* 활성 빈 셀의 가짜 커서 */
  ${({ $active, $filled }) =>
    $active &&
    !$filled &&
    css`
      &::after {
        content: "";
        width: 2px;
        height: 20px;
        background: #303030;

        @media (prefers-reduced-motion: no-preference) {
          animation: ${caretBlink} 1.1s step-end infinite;
        }
      }
    `}
`;

// OTP 셀 바로 아래 안내 — 스왑 애니메이션을 함께 타도록 HeroSwap 안에 두고,
// 세션 확인 실패 시 같은 자리에서 에러 문구로 바뀐다
export const CodeHint = styled.p<{ $error?: boolean }>`
  margin: 0;
  font-size: 13px;
  letter-spacing: -0.3px;
  color: ${({ $error }) => ($error ? ERROR_RED : "#767676")};
  font-weight: ${({ $error }) => ($error ? 600 : 400)};
  transition: color 0.15s ease;
`;

// 세션 확인 중 화살표 칩 안에서 도는 스피너
const spin = keyframes`
  to { transform: rotate(1turn); }
`;

export const Spinner = styled.span`
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;

  @media (prefers-reduced-motion: no-preference) {
    animation: ${spin} 0.7s linear infinite;
  }
`;

/* 모바일 발표자 탭 — 업로드 대신 기기 안내를 같은 슬롯(min-height 52)에 보여준다.
 * 점선 테두리는 히어로 사이드 레일(2px dashed)과 같은 어휘 */
export const DeviceNote = styled.p`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 95.8%;
  min-height: clamp(44px, 6vh, 52px);
  margin: 0;
  padding: 8px 18px;
  border: 2px dashed #eaeaea;
  border-radius: 16px;
  background: #fafafa;
  box-sizing: border-box;
  font-size: 14px;
  letter-spacing: -0.35px;
  line-height: 1.5;
  color: #5c5c5c;
  text-align: center;
`;

export const HiddenInput = styled.input`
  display: none;
`;
