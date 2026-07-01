import type { ChangeEvent } from "react";
import { NotesContainer, NotesTextarea, NotesTitle } from "./SlideNotesPanel.styles";

interface SlideNotesPanelProps {
  notes: string;
  readOnly?: boolean;
  onChange?: (notes: string) => void;
  onBlur?: () => void;
}

const SlideNotesPanel = ({
  notes,
  readOnly = false,
  onChange,
  onBlur,
}: SlideNotesPanelProps) => {
  return (
    <NotesContainer data-testid="presenter-slide-notes">
      <NotesTitle>발표자 노트</NotesTitle>
      <NotesTextarea
        aria-label="발표자 노트"
        data-testid="presenter-slide-notes-input"
        value={notes}
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
