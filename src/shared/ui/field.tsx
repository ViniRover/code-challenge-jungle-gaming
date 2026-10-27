import type { InputHTMLAttributes, ReactNode } from "react";

export function Field({
  label,
  error,
  id,
  children,
  required,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  children?: ReactNode;
}) {
  const fieldId = id || props.name;

  return (
    <div className="field">
      <label htmlFor={fieldId}>
        {label}
        {required && (
          <span aria-hidden="true" className="required">
            *
          </span>
        )}
      </label>
      {children || (
        <input
          aria-label={label}
          id={fieldId}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          required={required}
          {...props}
        />
      )}
      {error && (
        <span id={`${fieldId}-error`} className="field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
