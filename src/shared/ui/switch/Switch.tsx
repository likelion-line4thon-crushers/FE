import type { ChangeEventHandler, InputHTMLAttributes } from "react";
import { SwitchInput } from "./Switch.styles";

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  checked: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
}

const Switch = ({ checked, onChange, ...props }: SwitchProps) => (
  <SwitchInput checked={checked} onChange={onChange} {...props} />
);

export default Switch;
