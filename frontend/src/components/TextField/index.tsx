import { type InputHTMLAttributes, useId } from "react";
import "./styles.css";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function TextField({ label, ...inputProps }: TextFieldProps) {
  const id = useId();

  return (
    <div className="text-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} {...inputProps} />
    </div>
  );
}
