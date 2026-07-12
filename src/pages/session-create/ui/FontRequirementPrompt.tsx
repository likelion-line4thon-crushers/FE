import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import type { FontReportEntry } from "@/shared/api/model/pdf";
import FontMascot from "@/shared/assets/images/session-warning-face.svg";
import {
  Body,
  ConfirmButton,
  ConfirmOverlay,
  Content,
  Description,
  Dialog,
  ErrorText,
  Footer,
  FontList,
  FontName,
  FontRow,
  FontRowMain,
  Hint,
  HiddenInput,
  ListWrap,
  Mascot,
  Overlay,
  Resolved,
  RowRight,
  ScrollFade,
  SecondaryButton,
  StatusChip,
  SubstituteNote,
  TextGroup,
  Title,
  UploadButton,
  WarningNote,
} from "./FontRequirementPrompt.styles";

interface Props {
  fontReport: FontReportEntry[];
  busy: boolean; // 변환(finalize) 진행 중
  uploadingName: string | null; // 현재 업로드 중인 폰트명
  warnings: Record<string, string>; // 폰트명 → 방금 올렸지만 이름이 다른 폰트의 패밀리명
  error: string | null;
  onUploadFont: (fontName: string, file: File) => void;
  onContinue: () => void;
  onProceedWithout: () => void;
}

export default function FontRequirementPrompt({
  fontReport,
  busy,
  uploadingName,
  warnings,
  error,
  onUploadFont,
  onContinue,
  onProceedWithout,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const targetRef = useRef<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [showFade, setShowFade] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const missingCount = fontReport.filter((f) => f.status === "MISSING").length;
  const allResolved = missingCount === 0;
  const anyBusy = busy || uploadingName !== null;

  // 목록이 넘칠 때만, 그리고 아직 맨 아래가 아닐 때만 하단 그라데이션(스크롤 유도)을 보인다.
  const syncFade = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const overflowing = el.scrollHeight > el.clientHeight + 1;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
    setShowFade(overflowing && !atBottom);
  }, []);

  useEffect(() => {
    syncFade();
  }, [fontReport, syncFade]);

  const openPicker = (fontName: string) => {
    targetRef.current = fontName;
    inputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const name = targetRef.current;
    e.target.value = ""; // 같은 파일도 다시 선택할 수 있게 초기화
    targetRef.current = null;
    if (file && name) onUploadFont(name, file);
  };

  const handleContinueClick = () => {
    if (missingCount > 0) setConfirmOpen(true);
    else onContinue();
  };

  return (
    <>
      <Overlay>
        <Dialog role="dialog" aria-modal="true" aria-labelledby="font-modal-title">
          <Content>
            <Body>
              <Mascot src={FontMascot} alt="" aria-hidden="true" />
              <TextGroup>
                <Title id="font-modal-title">발표 자료에 사용된 폰트를 확인해 주세요</Title>
                {allResolved ? (
                  <Resolved>필요한 폰트가 모두 준비되었어요.</Resolved>
                ) : (
                  <Description>
                    정확한 폰트로 변환하려면 각 폰트 오른쪽의 <b>업로드</b>를 눌러 파일을 올려주세요. 올리지
                    않은 폰트는 대체 글꼴로 대체돼요.
                  </Description>
                )}
              </TextGroup>
            </Body>

            <ListWrap>
              <FontList ref={listRef} onScroll={syncFade} aria-label="필요한 폰트 목록">
                {fontReport.map((f) => {
                  const missing = f.status === "MISSING";
                  const isUploading = uploadingName === f.name;
                  return (
                    <FontRow key={f.name}>
                      <FontRowMain>
                        <FontName>{f.name}</FontName>
                        <RowRight>
                          <StatusChip $missing={missing} aria-label={missing ? "없음" : "사용 가능"}>
                            {missing ? "없음" : "사용 가능"}
                          </StatusChip>
                          {missing && (
                            <UploadButton type="button" disabled={anyBusy} onClick={() => openPicker(f.name)}>
                              {isUploading ? "업로드 중…" : "업로드"}
                            </UploadButton>
                          )}
                        </RowRight>
                      </FontRowMain>
                      {missing && warnings[f.name] !== undefined ? (
                        <WarningNote>
                          업로드한 파일이 이 폰트와 달라요
                          {warnings[f.name] ? ` (올린 폰트: ${warnings[f.name]})` : ""}.
                        </WarningNote>
                      ) : (
                        missing && f.substitute && <SubstituteNote>대체 글꼴: {f.substitute}</SubstituteNote>
                      )}
                    </FontRow>
                  );
                })}
              </FontList>
              {showFade && <ScrollFade aria-hidden="true" />}
            </ListWrap>
            <Hint>.ttf · .otf · .ttc · 최대 15MB</Hint>

            <HiddenInput ref={inputRef} type="file" accept=".ttf,.otf,.ttc" onChange={handleFileChange} />

            {error && <ErrorText role="alert">{error}</ErrorText>}
          </Content>

          <Footer>
            <SecondaryButton type="button" disabled={anyBusy} onClick={onProceedWithout}>
              그냥 진행
            </SecondaryButton>
            <ConfirmButton type="button" disabled={anyBusy} onClick={handleContinueClick}>
              변환 시작
            </ConfirmButton>
          </Footer>
        </Dialog>
      </Overlay>

      {confirmOpen && (
        <ConfirmOverlay>
          <Dialog role="alertdialog" aria-modal="true" aria-labelledby="font-confirm-title">
            <Content>
              <Body>
                <TextGroup>
                  <Title id="font-confirm-title">아직 준비되지 않은 폰트가 있어요</Title>
                  <Description>
                    남은 <b>{missingCount}</b>개의 폰트는 서버의 대체 글꼴로 대체돼요. 그래도 변환을
                    시작할까요?
                  </Description>
                </TextGroup>
              </Body>
            </Content>
            <Footer>
              <SecondaryButton type="button" onClick={() => setConfirmOpen(false)}>
                취소
              </SecondaryButton>
              <ConfirmButton
                type="button"
                onClick={() => {
                  setConfirmOpen(false);
                  onContinue();
                }}
              >
                네, 시작할게요
              </ConfirmButton>
            </Footer>
          </Dialog>
        </ConfirmOverlay>
      )}
    </>
  );
}
