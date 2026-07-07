import PlusIcon from "@/shared/assets/images/plus.svg";
import CloseIcon from "@/shared/assets/images/close.svg";
import { useFeedbackQuestions } from "../model/useFeedbackQuestions";
import {
  Overlay,
  Dialog,
  CloseBar,
  CloseButton,
  Body,
  Intro,
  IntroText,
  IntroTitle,
  IntroSub,
  QuestionList,
  QuestionField,
  QuestionLabel,
  QuestionInput,
  AddRow,
  ErrorText,
  Footer,
  SaveButton,
} from "./FeedbackQuestionModal.styles";

interface FeedbackQuestionModalProps {
  roomId: string | undefined;
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackQuestionModal({ roomId, isOpen, onClose }: FeedbackQuestionModalProps) {
  const { rows, loading, saving, error, canAddMore, setRow, addRow, save } = useFeedbackQuestions(
    roomId,
    isOpen
  );

  if (!isOpen) return null;

  const handleSave = async () => {
    const ok = await save();
    if (ok) onClose();
  };

  return (
    <Overlay onClick={onClose}>
      <Dialog onClick={(e) => e.stopPropagation()}>
        <CloseBar>
          <CloseButton type="button" aria-label="닫기" onClick={onClose}>
            <img src={CloseIcon} alt="" />
          </CloseButton>
        </CloseBar>
        <Body>
          <Intro>
            <IntroText>
              <IntroTitle>이번 세션에 대해 청중에게 물어볼 질문을 만들어보세요!</IntroTitle>
              <IntroSub>
                여기서 작성한 질문 문항은 세션이 종료된 후, 청중이 후기를 남길 때 이 질문에 답하게
                됩니다.
              </IntroSub>
            </IntroText>
          </Intro>

          {loading ? (
            <IntroSub>불러오는 중...</IntroSub>
          ) : (
            <>
              <QuestionList>
                {rows.map((value, index) => (
                  <QuestionField key={index}>
                    <QuestionLabel htmlFor={`fq-${index}`}>{index + 1}번 질문 문항</QuestionLabel>
                    <QuestionInput
                      id={`fq-${index}`}
                      value={value}
                      placeholder="내용을 입력해 주세요."
                      maxLength={500}
                      onChange={(e) => setRow(index, e.target.value)}
                    />
                  </QuestionField>
                ))}
              </QuestionList>

              <AddRow type="button" onClick={addRow} disabled={!canAddMore}>
                <img src={PlusIcon} alt="" />
                질문 더 추가하기
              </AddRow>

              {error && <ErrorText role="alert">{error}</ErrorText>}
            </>
          )}
        </Body>
        <Footer>
          <SaveButton type="button" onClick={handleSave} disabled={saving || loading}>
            {saving ? "저장 중..." : "저장하기"}
          </SaveButton>
        </Footer>
      </Dialog>
    </Overlay>
  );
}

export default FeedbackQuestionModal;
