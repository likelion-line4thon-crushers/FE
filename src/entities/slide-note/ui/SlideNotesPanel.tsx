import type { ChangeEvent } from "react";
import { NotesContainer, NotesTextarea, NotesTitle } from "./SlideNotesPanel.styles";

interface SlideNotesPanelProps {
  notes: string;
  readOnly?: boolean;
  placeholder?: string;
  onChange?: (notes: string) => void;
  onBlur?: () => void;
}

const SlideNotesPanel = ({
  notes,
  readOnly = false,
  placeholder,
  onChange,
  onBlur,
}: SlideNotesPanelProps) => {
  const resolvedPlaceholder =
    placeholder ?? (readOnly ? "등록된 발표자 노트가 없어요." : "발표자 노트를 입력해 주세요.");

  return (
    <NotesContainer data-testid="presenter-slide-notes">
      <NotesTitle>발표자 노트</NotesTitle>
      <NotesTextarea
        aria-label="발표자 노트"
        data-testid="presenter-slide-notes-input"
        value={notes}
        placeholder={resolvedPlaceholder}
        readOnly={readOnly}
        $readOnly={readOnly}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
          if (!readOnly) onChange?.(event.target.value);
        }}
        onBlur={readOnly ? undefined : onBlur}
      />
    </NotesContainer>
  );
};

export default SlideNotesPanel;
