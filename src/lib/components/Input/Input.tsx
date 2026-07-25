/**
 * Text input.
 *
 * The glass here is *recessed* rather than raised -- the specular runs along
 * the bottom edge and the inner shadow along the top, inverting the surface's
 * default lighting. That inversion is the whole reason a field reads as
 * something you type into rather than something you press.
 *
 * The label, hint and error are part of the component rather than the caller's
 * job, because wiring `id`, `aria-describedby` and `aria-invalid` correctly is
 * exactly the part everyone skips.
 */
import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode, Ref } from 'react';
import { cx } from '../../utils/cx';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'className'> {
  label?: ReactNode;
  /** Helper text below the field. Hidden while an error is showing. */
  hint?: ReactNode;
  /** Any truthy value marks the field invalid and replaces the hint. */
  error?: ReactNode;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  inputSize?: InputSize;
  block?: boolean;
  /** Applied to the outer wrapper, not the `<input>`. */
  className?: string;
  /** Applied to the `<input>` itself. */
  inputClassName?: string;
}

export const Input = forwardRef(function Input(
  {
    label,
    hint,
    error,
    startIcon,
    endIcon,
    inputSize = 'md',
    block = false,
    className,
    inputClassName,
    id,
    disabled,
    required,
    ...rest
  }: InputProps,
  ref: Ref<HTMLInputElement>,
) {
  const autoId = useId();
  const inputId = id ?? `lg-input-${autoId}`;
  const messageId = `${inputId}-message`;
  const invalid = Boolean(error);
  const message = error ?? hint;

  return (
    <div
      className={cx('lg-field', className)}
      data-size={inputSize}
      data-block={block ? 'true' : undefined}
      data-invalid={invalid ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
    >
      {label ? (
        <label className="lg-field__label" htmlFor={inputId}>
          {label}
          {required ? (
            <span className="lg-field__required" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}

      {/* The surface class is on the wrapper, not the input, so the icons sit
          inside the same pane of glass as the text rather than on top of it. */}
      <div className="lg-surface lg-field__box" data-elevation="flat">
        {startIcon ? (
          <span className="lg-field__icon" aria-hidden="true">
            {startIcon}
          </span>
        ) : null}
        <input
          {...rest}
          ref={ref}
          id={inputId}
          className={cx('lg-field__input', inputClassName)}
          disabled={disabled}
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={message ? messageId : undefined}
        />
        {endIcon ? (
          <span className="lg-field__icon" aria-hidden="true">
            {endIcon}
          </span>
        ) : null}
      </div>

      {message ? (
        <p
          className="lg-field__message"
          id={messageId}
          // Errors appear after the user has moved on, so they have to be
          // announced; a hint is present from the start and must not be.
          role={invalid ? 'alert' : undefined}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
