import { useRef, useState } from "react";
import type { FontReportEntry } from "@/shared/api/model/pdf";
import FontMascot from "@/shared/assets/images/session-warning-face.svg";
import {
  Body,
  ConfirmButton,
  Content,
  Description,
  Dialog,
  ErrorText,
  Footer,
  FontList,
  FontName,
  FontRow,
  FontRowMain,
  HiddenInput,
  Mascot,
  Overlay,
  PickButton,
  PickHint,
  Picker,
  RecheckButton,
  Resolved,
  SecondaryButton,
  StatusChip,
  SubstituteNote,
  TextGroup,
  Title,
} from "./FontRequirementPrompt.styles";

interface Props {
  fontReport: FontReportEntry[];
  busy: boolean;
  error: string | null;
  onCheckFonts: (files: File[]) => void;
  onUploadFonts: (files: File[]) => void;
  onProceedWithout: () => void;
}

export default function FontRequirementPrompt({
  fontReport,
  busy,
  error,
  onCheckFonts,
  onUploadFonts,
  onProceedWithout,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [picked, setPicked] = useState<File[]>([]);
  const missingCount = fontReport.filter((f) => f.status === "MISSING").length;
  const allResolved = missingCount === 0;
  const hasPicked = picked.length > 0;

  return (
    <Overlay>
      <Dialog role="dialog" aria-modal="true" aria-labelledby="font-modal-title">
        <Content>
          <Body>
            <Mascot src={FontMascot} alt="" aria-hidden="true" />
            <TextGroup>
              <Title id="font-modal-title">발표에 사용된 폰트를 확인해 주세요</Title>
              {allResolved ? (
                <Resolved>필요한 폰트가 모두 준비되었어요. 이대로 계속 진행하세요.</Resolved>
              ) : (
                <Description>
                  정확한 글꼴로 변환하려면 아래 <b>{missingCount}</b>개의 폰트를 업로드하세요. 업로드하지
                  않으면 서버의 기본 글꼴로 대체돼요.
                </Description>
              )}
            </TextGroup>
          </Body>

          <FontList aria-label="필요한 폰트 목록">
            {fontReport.map((f) => {
              const missing = f.status === "MISSING";
              return (
                <FontRow key={f.name}>
                  <FontRowMain>
                    <FontName>{f.name}</FontName>
                    <StatusChip $missing={missing} aria-label={missing ? "없음" : "사용 가능"}>
                      {missing ? "없음" : "사용 가능"}
                    </StatusChip>
                  </FontRowMain>
                  {missing && f.substitute && <SubstituteNote>대체 글꼴: {f.substitute}</SubstituteNote>}
                </FontRow>
              );
            })}
          </FontList>

          <Picker>
            <HiddenInput
              ref={inputRef}
              type="file"
              accept=".ttf,.otf,.ttc"
              multiple
              onChange={(e) => setPicked(Array.from(e.target.files ?? []))}
            />
            <PickButton type="button" onClick={() => inputRef.current?.click()}>
              {hasPicked ? `${picked.length}개 폰트 선택됨` : "폰트 파일 선택"}
            </PickButton>
            <PickHint>.ttf · .otf · .ttc · 최대 15MB</PickHint>
            <RecheckButton type="button" disabled={busy || !hasPicked} onClick={() => onCheckFonts(picked)}>
              선택한 폰트로 다시 확인
            </RecheckButton>
          </Picker>

          {error && <ErrorText role="alert">{error}</ErrorText>}
        </Content>

        <Footer>
          <SecondaryButton type="button" disabled={busy} onClick={onProceedWithout}>
            그냥 진행
          </SecondaryButton>
          <ConfirmButton type="button" disabled={busy || !hasPicked} onClick={() => onUploadFonts(picked)}>
            이 폰트로 계속
          </ConfirmButton>
        </Footer>
      </Dialog>
    </Overlay>
  );
}
