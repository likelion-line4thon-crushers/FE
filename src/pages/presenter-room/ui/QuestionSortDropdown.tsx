import { useState } from "react";
import type { QuestionSortMode } from "@/entities/question";
import {
  SortButton,
  SortIconSlot,
  SortMenu,
  SortMenuItem,
  SortMenuWrapper,
} from "./QuestionSortDropdown.styles";

const sortLabel = {
  latest: "최신 순",
  popular: "인기 순",
} satisfies Record<QuestionSortMode, string>;

const SortDirectionIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path
      d="M5 2.75v9.5m0 0 2-2m-2 2-2-2M11 13.25v-9.5m0 0-2 2m2-2 2 2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronDownIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path
      d="m4 6 4 4 4-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path
      d="m3.5 8.25 2.75 2.75 6.25-6.25"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ThumbsUpIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path
      d="M5.75 6.5 7.7 2.6c.2-.4.75-.55 1.14-.32.63.37.94 1.12.76 1.83L9.2 5.75h2.6c.97 0 1.68.9 1.45 1.84l-.9 3.75a1.5 1.5 0 0 1-1.45 1.16H5.75m0-6v6m0-6H3.8c-.72 0-1.3.58-1.3 1.3v3.4c0 .72.58 1.3 1.3 1.3h1.95"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface QuestionSortDropdownProps {
  value: QuestionSortMode;
  onChange: (mode: QuestionSortMode) => void;
}

const QuestionSortDropdown = ({ value, onChange }: QuestionSortDropdownProps) => {
  const [open, setOpen] = useState(false);
  const options: QuestionSortMode[] = ["latest", "popular"];

  const handleSelect = (mode: QuestionSortMode) => {
    onChange(mode);
    setOpen(false);
  };

  return (
    <SortMenuWrapper onBlur={() => window.setTimeout(() => setOpen(false), 0)}>
      <SortButton
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <SortIconSlot>
          <SortDirectionIcon />
        </SortIconSlot>
        <span>{sortLabel[value]}</span>
        <SortIconSlot $muted>
          <ChevronDownIcon />
        </SortIconSlot>
      </SortButton>

      {open && (
        <SortMenu role="menu">
          {options.map((mode) => {
            const selected = mode === value;
            return (
              <SortMenuItem
                key={mode}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                $selected={selected}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(mode)}
              >
                <span>{sortLabel[mode]}</span>
                <SortIconSlot>{selected ? <CheckIcon /> : <ThumbsUpIcon />}</SortIconSlot>
              </SortMenuItem>
            );
          })}
        </SortMenu>
      )}
    </SortMenuWrapper>
  );
};

export default QuestionSortDropdown;
