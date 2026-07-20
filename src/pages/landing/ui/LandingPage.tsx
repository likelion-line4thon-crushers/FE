import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { usePostHog } from "@posthog/react";
import { useSetAtom } from "jotai";
import { isAxiosError } from "axios";
import { pendingPresentationFileAtom } from "@/entities/room";
import { MAX_PRESENTATION_FILE_BYTES, MAX_PRESENTATION_FILE_LABEL } from "@/shared/config/upload";
import { joinRoom, persistAudienceJoin } from "@/shared/api/room";
import { readAudienceIdentity } from "@/shared/lib/audience-identity";
import BoiniLogo from "@/shared/assets/images/Boini_logo.svg";
import TitleSVG from "@/shared/assets/images/title.svg";
import ArrowRightIcon from "@/shared/assets/images/arrow-right.svg";
import Emoji1 from "@/shared/assets/images/emoji1.svg";
import Emoji2 from "@/shared/assets/images/emoji2.svg";
import Emoji3 from "@/shared/assets/images/emoji3.svg";
import Emoji4 from "@/shared/assets/images/emoji4.svg";
import { ANALYTICS_EVENTS } from "@/shared/config/analytics-events";
import { useIsMobile } from "@/shared/lib/use-media-query";
import {
  getPresentationFileType,
  isSupportedPresentationFile,
  PRESENTATION_FILE_ACCEPT,
} from "../lib/presentationFile";
import * as S from "./LandingPage.styles";
import { ProblemSection } from "./sections/ProblemSection";
import { SolutionSection } from "./sections/SolutionSection";
import { FeatureSection } from "./sections/FeatureSection";
import { FEATURE_SECTIONS } from "./sections/featureContent";
import { HowItWorksSection } from "./sections/HowItWorksSection";
import { FinalCtaSection } from "./sections/FinalCtaSection";

// 데스크톱 히어로 탭 — 발표자(파일 업로드) / 참여자(세션 코드) 플로우 전환
type HeroTab = "presenter" | "audience";

// 바 교체 시퀀스에서 이전 바가 아래로 사라지는 시간 (styles의 panelOut 0.18s와 동일)
const PANEL_SWAP_MS = 180;

// 세션 코드는 백엔드 CodeService가 숫자 6자리로 고정 생성한다
const CODE_LENGTH = 6;

// 참여 시도 계측용 — 마지막 자리 입력 후 자동 제출인지, 화살표/엔터로 직접 제출인지
type JoinEntry = "auto" | "manual";

const clearTimer = (ref: React.MutableRefObject<number | null>) => {
  if (ref.current == null) return;
  window.clearTimeout(ref.current);
  ref.current = null;
};

const MainPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showTopCta, setShowTopCta] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [codeFocused, setCodeFocused] = useState(false);
  // idle → checking(세션 존재 확인 중) → error(인라인 표시) — 성공하면 페이지를 떠난다
  const [codeStatus, setCodeStatus] = useState<"idle" | "checking" | "error">("idle");
  const [codeError, setCodeError] = useState<string | null>(null);
  const checkingRef = useRef(false);
  // 지연 작업 핸들 — 언마운트/재입력 시 취소해야 하는 것들만 추적한다
  const codeResetTimerRef = useRef<number | null>(null);
  const autoSubmitTimerRef = useRef<number | null>(null);
  const highlightTimerRef = useRef<number | null>(null);
  const highlightRafRef = useRef<number | null>(null);
  // 모바일은 청중 참여(세션 코드)가 기본 플로우 — 발표자 탭은 기기 안내를 보여준다
  const isMobile = useIsMobile();
  const [heroTab, setHeroTab] = useState<HeroTab>(isMobile ? "audience" : "presenter");
  // 화면에 실제로 남아 있는 바 — heroTab과 어긋난 동안 이전 바가 퇴장 모션을 탄다
  const [displayedTab, setDisplayedTab] = useState<HeroTab>(heroTab);
  // 첫 로드에는 등장 모션 없이 바로 보여주고, 탭 전환부터만 slide-up을 튼다
  const [hasSwapped, setHasSwapped] = useState(false);
  // CTA로 히어로에 올라온 직후 업로드 박스를 강조(활성 테두리 + 상하 흔들기)
  const [highlightUpload, setHighlightUpload] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const joinInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const setPendingFile = useSetAtom(pendingPresentationFileAtom);
  const posthog = usePostHog();

  // 첫 화면(히어로)이 완전히 스크롤 밖으로 나가면 상단 CTA 바를 내린다
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setShowTopCta(!entry.isIntersecting), {
      root: scrollRef.current,
      threshold: 0,
    });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  // 클릭 선택과 드래그 앤 드롭이 완전히 같은 검증/계측 경로를 타도록 단일화.
  const handleFileCandidate = (file: File | undefined, viaDragDrop?: boolean) => {
    const props = {
      file_type: getPresentationFileType(file),
      ...(viaDragDrop ? { via_drag_drop: true } : {}),
    };
    if (!isSupportedPresentationFile(file)) {
      posthog?.capture(ANALYTICS_EVENTS.PRESENTATION_FILE_REJECTED, { ...props, reason: "type" });
      setFileError("PDF, PPT, PPTX 파일만 선택할 수 있어요.");
      return;
    }
    if (file.size > MAX_PRESENTATION_FILE_BYTES) {
      posthog?.capture(ANALYTICS_EVENTS.PRESENTATION_FILE_REJECTED, {
        ...props,
        reason: "size",
        file_size_bytes: file.size,
      });
      setFileError(`파일이 너무 커요. ${MAX_PRESENTATION_FILE_LABEL} 이하만 업로드할 수 있어요.`);
      return;
    }
    setSelectedFile(file);
    setFileError(null);
    posthog?.capture(ANALYTICS_EVENTS.PRESENTATION_FILE_SELECTED, props);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileCandidate(event.target.files?.[0]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileCandidate(e.dataTransfer.files[0], true);
  };

  const handleStartPresentation = () => {
    if (!selectedFile) {
      setFileError("발표 자료를 먼저 업로드해주세요!");
      return;
    }
    posthog?.capture(ANALYTICS_EVENTS.PRESENTATION_STARTED, {
      file_type: getPresentationFileType(selectedFile),
    });
    // File 은 직렬화가 안 되므로 location.state 대신 아톰으로 전달한다.
    setPendingFile(selectedFile);
    navigate("/rooms/new", { state: { fileName: selectedFile.name } });
  };

  // 이동 전에 세션 존재를 먼저 확인한다. 단, join은 호출마다 새 audienceId를 발급하고
  // 누적 입장 수를 올리므로 — 이 브라우저에 아직 유효한 신원이 있으면 재-join하지 않는다
  // (리포트 입장 수 부풀림 + 브라우저 단위 피드백 중복 방지 무력화를 막는다).
  // 새로 join한 응답은 저장해 두어 오디언스 페이지가 재-join 없이 그대로 복원하게 한다.
  const submitJoin = async (code: string, entry: JoinEntry) => {
    if (checkingRef.current) return;
    checkingRef.current = true;
    setCodeStatus("checking");
    try {
      const reusedIdentity = !!readAudienceIdentity(code, { requireValidToken: true });
      if (!reusedIdentity) persistAudienceJoin(code, await joinRoom(code));
      posthog?.capture(ANALYTICS_EVENTS.LANDING_JOIN_CODE_SUBMITTED, {
        entry,
        valid: true,
        reused_identity: reusedIdentity,
      });
      navigate(`/join/${encodeURIComponent(code)}`, { viewTransition: true });
    } catch (error) {
      // 4xx는 코드가 틀린 것, 그 밖(5xx/네트워크)은 우리 쪽 장애 — 퍼널에서 구분해야
      // 오타로 인한 이탈과 장애로 인한 이탈을 섞어 보지 않는다.
      const knownMiss =
        isAxiosError(error) && error.response != null && error.response.status < 500;
      posthog?.capture(ANALYTICS_EVENTS.LANDING_JOIN_CODE_SUBMITTED, {
        entry,
        valid: false,
        reason: knownMiss ? "not_found" : "network",
      });
      setCodeStatus("error");
      setCodeError(
        knownMiss
          ? "세션을 찾을 수 없어요. 코드를 다시 확인해주세요"
          : "연결이 원활하지 않아요. 잠시 후 다시 시도해주세요"
      );
      // 흔들림이 끝나면 비우고 재입력을 받는다 (에러 문구는 다시 입력할 때까지 유지).
      // 그 사이 사용자가 벌써 새 코드를 치기 시작했다면 handleCodeChange가 이 타이머를 끈다.
      // 연속 실패로 이전 예약이 남아 있으면 먼저 끈다 — 추적하지 못한 타이머가 살아남으면
      // 취소 자체가 무력해져서 방금 다시 친 코드가 지워진다.
      clearTimer(codeResetTimerRef);
      codeResetTimerRef.current = window.setTimeout(() => {
        codeResetTimerRef.current = null;
        setJoinCode("");
        joinInputRef.current?.focus({ preventScroll: true });
      }, 500);
    } finally {
      checkingRef.current = false;
    }
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (codeStatus === "checking") return;
    if (joinCode.length < CODE_LENGTH) return joinInputRef.current?.focus();
    // 직접 제출이 대기 중인 자동 제출을 대신한다 — 안 끄면 실패 후 checkingRef가 풀린
    // 사이에 자동 타이머가 같은 코드로 한 번 더 제출해 계측 이벤트까지 두 번 찍힌다.
    clearTimer(autoSubmitTimerRef);
    void submitJoin(joinCode, "manual");
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (codeStatus === "checking") return;
    const next = e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (codeStatus === "error") {
      // 실패 후 자동 비우기 예약을 취소한다 — 안 그러면 방금 다시 친 코드가 지워진다
      clearTimer(codeResetTimerRef);
      setCodeStatus("idle");
      setCodeError(null);
    }
    setJoinCode(next);
    // OTP 관례: 마지막 자리가 채워지면 잠깐 보여준 뒤 자동 제출 (그 사이 지우면 취소)
    if (next.length === CODE_LENGTH && joinCode.length < CODE_LENGTH) {
      clearTimer(autoSubmitTimerRef);
      autoSubmitTimerRef.current = window.setTimeout(() => {
        autoSubmitTimerRef.current = null;
        if (joinInputRef.current?.value === next) void submitJoin(next, "auto");
      }, 250);
    }
  };

  const handleCtaStart = (placement: "top_bar" | "final_section") => {
    // intent: 같은 CTA라도 모바일은 "세션 참여하기", 데스크톱은 "발표 시작하기"를 약속한다
    posthog?.capture(ANALYTICS_EVENTS.LANDING_CTA_CLICKED, {
      placement,
      intent: isMobile ? "join" : "present",
    });
    // CTA가 약속하는 플로우로 탭을 맞춘다
    setHeroTab(isMobile ? "audience" : "presenter");
    const scroller = scrollRef.current;
    scroller?.scrollTo({ top: 0, behavior: "smooth" });
    // 모바일 CTA는 세션 참여이므로 스크롤 후 코드 입력에 포커스를 준다
    if (isMobile) {
      setTimeout(() => joinInputRef.current?.focus(), 650);
      return;
    }
    // 데스크톱: 스크롤이 맨 위에 닿으면(=업로드 박스가 보이면) 강조를 재생한다
    if (!scroller) return;
    const start = performance.now();
    const playWhenTop = () => {
      if (scroller.scrollTop <= 4 || performance.now() - start > 1600) {
        highlightRafRef.current = null;
        setHighlightUpload(true);
        // 모션 비선호 환경은 흔들기 애니메이션이 없어 onAnimationEnd가 안 오므로 타이머로도 해제
        highlightTimerRef.current = window.setTimeout(() => setHighlightUpload(false), 700);
      } else {
        highlightRafRef.current = requestAnimationFrame(playWhenTop);
      }
    };
    highlightRafRef.current = requestAnimationFrame(playWhenTop);
  };

  const handleHeroTabSelect = (tab: HeroTab) => {
    if (tab === heroTab) return;
    setHeroTab(tab);
    posthog?.capture(ANALYTICS_EVENTS.LANDING_HERO_TAB_SELECTED, { tab, is_mobile: isMobile });
  };

  // 언마운트 후 실행될 지연 작업 정리 (참여 성공 시 곧바로 이 페이지를 떠난다)
  useEffect(
    () => () => {
      clearTimer(codeResetTimerRef);
      clearTimer(autoSubmitTimerRef);
      clearTimer(highlightTimerRef);
      if (highlightRafRef.current != null) cancelAnimationFrame(highlightRafRef.current);
    },
    []
  );

  // 탭이 바뀌면 이전 바의 퇴장(slide-down)을 기다렸다가 새 바로 교체한다(slide-up 등장)
  useEffect(() => {
    if (heroTab === displayedTab) return;
    const timer = window.setTimeout(() => {
      setDisplayedTab(heroTab);
      setHasSwapped(true);
      // 참여자 탭은 코드 입력이 유일한 행동이므로 등장하자마자 포커스
      if (heroTab === "audience")
        requestAnimationFrame(() => joinInputRef.current?.focus({ preventScroll: true }));
    }, PANEL_SWAP_MS);
    return () => window.clearTimeout(timer);
  }, [heroTab, displayedTab]);

  return (
    <S.PageScroll ref={scrollRef} data-landing-scroll>
      <S.CtaBar $show={showTopCta}>
        <S.CtaBarInner>
          <S.BrandLock>
            <img src={BoiniLogo} alt="Boini logo" />
            <S.BetaTag>beta</S.BetaTag>
          </S.BrandLock>
          <S.CtaBarButton type="button" onClick={() => handleCtaStart("top_bar")}>
            {isMobile ? "세션 참여하기" : "발표 시작하기"}
            <img src={ArrowRightIcon} alt="" />
          </S.CtaBarButton>
        </S.CtaBarInner>
      </S.CtaBar>

      <S.TopBar>
        <S.BrandLock $logo={32}>
          <img src={BoiniLogo} alt="Boini logo" />
          <S.BetaTag>beta</S.BetaTag>
        </S.BrandLock>
      </S.TopBar>

      <S.MainLayout ref={heroRef}>
        {/* 좌측 */}
        <S.Side>
          <S.SideInner />
        </S.Side>

        {/* 중앙 */}
        <S.CenterGrid>
          {/* 1행 */}
          <S.Box $area="e1">
            <img src={Emoji1} alt="emoji1" />
          </S.Box>
          <S.Box $striped $area="s1" />
          <S.Box $area="e2">
            <img src={Emoji2} alt="emoji2" />
          </S.Box>
          {/* 2행 */}
          <S.Box $striped $area="s2" />
          <S.CenterContent>
            <img
              src={TitleSVG}
              alt="발표가 달라진다"
              style={{ width: "95%", height: "auto", maxHeight: "22vh" }}
            />

            <S.HeroPanel>
              <S.HeroTabs role="group" aria-label="시작 방법 선택">
                <S.HeroTabButton
                  type="button"
                  aria-pressed={heroTab === "presenter"}
                  onClick={() => handleHeroTabSelect("presenter")}
                >
                  발표자예요
                </S.HeroTabButton>
                <S.HeroTabButton
                  type="button"
                  aria-pressed={heroTab === "audience"}
                  onClick={() => handleHeroTabSelect("audience")}
                >
                  청중이예요
                </S.HeroTabButton>
                {/* 실제 탭 버튼 위를 덮는 잉크 레이어 — clip-path로 활성 절반만 보인다 */}
                <S.HeroTabIndicator aria-hidden="true" $tab={heroTab}>
                  <span>발표자예요</span>
                  <span>청중이예요</span>
                </S.HeroTabIndicator>
              </S.HeroTabs>

              <S.HeroSwap
                key={displayedTab}
                $exiting={heroTab !== displayedTab}
                $animate={hasSwapped}
              >
                {isMobile && displayedTab === "presenter" && (
                  <S.DeviceNote>
                    발표 만들기는 태블릿이나 PC 브라우저에서 시작할 수 있어요.
                  </S.DeviceNote>
                )}

                {!isMobile && displayedTab === "presenter" && (
                  <S.UploadBox
                    $dragging={isDragging}
                    $hasFile={!!selectedFile}
                    $highlight={highlightUpload}
                    onAnimationEnd={() => setHighlightUpload(false)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDragging(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDragging(false);
                    }}
                    onDrop={handleDrop}
                    onClick={() =>
                      (document.getElementById("pdfInput") as HTMLInputElement)?.click()
                    }
                    role="button"
                    tabIndex={0}
                    aria-label="발표 자료 파일 선택 (PDF, PPT, PPTX)"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        (document.getElementById("pdfInput") as HTMLInputElement)?.click();
                      }
                    }}
                  >
                    <span className="file-name">
                      {selectedFile
                        ? selectedFile.name
                        : isDragging
                          ? "여기에 파일을 놓으세요 📂"
                          : "여기에 PDF, PPT, PPTX 파일을 업로드하고 시작하세요!"}
                    </span>
                    <span
                      className="arrow"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartPresentation();
                      }}
                    >
                      <img src={ArrowRightIcon} alt="발표 시작" />
                    </span>
                  </S.UploadBox>
                )}

                {!isMobile && displayedTab === "presenter" && fileError && (
                  <S.CodeHint $error role="alert">
                    {fileError}
                  </S.CodeHint>
                )}

                {displayedTab === "audience" && (
                  <>
                    <S.JoinForm
                      $hasCode={joinCode.length === CODE_LENGTH}
                      onSubmit={handleJoinSubmit}
                    >
                      <S.OtpField $error={codeStatus === "error"}>
                        {Array.from({ length: CODE_LENGTH }, (_, i) => (
                          <S.OtpCell
                            key={i}
                            $filled={i < joinCode.length}
                            $active={
                              codeFocused && i === Math.min(joinCode.length, CODE_LENGTH - 1)
                            }
                            $error={codeStatus === "error"}
                          >
                            {joinCode[i] ?? ""}
                          </S.OtpCell>
                        ))}
                        <input
                          ref={joinInputRef}
                          value={joinCode}
                          onChange={handleCodeChange}
                          onFocus={() => setCodeFocused(true)}
                          onBlur={() => setCodeFocused(false)}
                          onSelect={(e) => {
                            // 셀 UI는 항상 끝자리에 이어 쓰는 모델이므로 커서를 끝에 고정
                            const el = e.currentTarget;
                            if (el.selectionStart !== el.value.length)
                              el.setSelectionRange(el.value.length, el.value.length);
                          }}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={CODE_LENGTH}
                          autoComplete="one-time-code"
                          aria-label="세션 코드 6자리"
                          readOnly={codeStatus === "checking"}
                        />
                      </S.OtpField>
                      <button
                        type="submit"
                        className="arrow"
                        aria-label="세션 참여"
                        aria-busy={codeStatus === "checking"}
                        disabled={codeStatus === "checking"}
                      >
                        {codeStatus === "checking" ? (
                          <S.Spinner />
                        ) : (
                          <img src={ArrowRightIcon} alt="" />
                        )}
                      </button>
                    </S.JoinForm>
                    <S.CodeHint $error={codeStatus === "error"} role="status">
                      {codeError ?? "발표자에게 받은 6자리 세션 코드를 입력하세요."}
                    </S.CodeHint>
                  </>
                )}
              </S.HeroSwap>
            </S.HeroPanel>

            <S.HiddenInput
              id="pdfInput"
              type="file"
              accept={PRESENTATION_FILE_ACCEPT}
              onChange={handleFileSelect}
            />
          </S.CenterContent>
          <S.Box $striped $area="s3" />
          {/* 3행 */}
          <S.Box $area="e3">
            <img src={Emoji3} alt="emoji3" />
          </S.Box>
          <S.Box $striped $area="s4" />
          <S.Box $area="e4">
            <img src={Emoji4} alt="emoji4" />
          </S.Box>
        </S.CenterGrid>

        {/* 우측 */}
        <S.Side>
          <S.SideInner />
        </S.Side>
      </S.MainLayout>

      <ProblemSection />
      <SolutionSection />
      {FEATURE_SECTIONS.map((content) => (
        <FeatureSection key={content.id} content={content} />
      ))}
      <HowItWorksSection />
      <FinalCtaSection onStart={() => handleCtaStart("final_section")} />

      <S.Footer>
        <S.FooterInner>
          <S.FooterCol>
            <S.BrandLock>
              <img src={BoiniLogo} alt="Boini logo" />
              <S.BetaTag>beta</S.BetaTag>
            </S.BrandLock>
            <S.FooterTagline>청중이 보이니, 발표가 달라진다.</S.FooterTagline>
            <S.FooterCopy>
              © 2026 BOiNi · 현재 공개 베타 서비스로 운영 중이며, 서비스 내용은 예고 없이 변경될 수
              있어요.
            </S.FooterCopy>
          </S.FooterCol>
          <S.FooterCol>
            <S.FooterLink href="mailto:boini.team@gmail.com">boini.team@gmail.com</S.FooterLink>
            <S.FooterCopy>Made by 멋쟁이사자처럼 대학 14기 Team BOiNi</S.FooterCopy>
          </S.FooterCol>
        </S.FooterInner>
      </S.Footer>
    </S.PageScroll>
  );
};

export default MainPage;
