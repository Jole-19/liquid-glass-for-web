/**
 * Switch.
 *
 * Built on `<button role="switch">` rather than a styled checkbox. A checkbox
 * is announced as "checked / not checked", which is wrong for a control that
 * takes effect immediately; `role="switch"` is announced as "on / off". The
 * button also gets Space and Enter activation for free.
 *
 * Supports both controlled (`checked` + `onChange`) and uncontrolled
 * (`defaultChecked`) use.
 */
import { forwardRef, useCallback, useId, useState } from 'react';
import type { ButtonHTMLAttributes, MouseEvent, ReactNode, Ref } from 'react';
import { cx } from '../../utils/cx';

export type SwitchSize = 'sm' | 'md' | 'lg';

export interface SwitchProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'onChange' | 'type' | 'value'
  > {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  /** Rendered beside the track and wired up as the accessible name. */
  label?: ReactNode;
  /** Puts the label before the track. */
  labelPosition?: 'start' | 'end';
  size?: SwitchSize;
}

export const Switch = forwardRef(function Switch(
  {
    checked,
    defaultChecked = false,
    onChange,
    label,
    labelPosition = 'end',
    size = 'md',
    disabled,
    className,
    id,
    onClick,
    ...rest
  }: SwitchProps,
  ref: Ref<HTMLButtonElement>,
) {
  const autoId = useId();
  const switchId = id ?? `lg-switch-${autoId}`;
  const labelId = `${switchId}-label`;

  const [uncontrolled, setUncontrolled] = useState(defaultChecked);
  const isControlled = checked !== undefined;
  const isOn = isControlled ? checked : uncontrolled;

  const toggle = useCallback(() => {
    if (disabled) return;
    if (!isControlled) setUncontrolled(!isOn);
    onChange?.(!isOn);
  }, [disabled, isControlled, isOn, onChange]);

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      toggle();
    },
    [onClick, toggle],
  );

  const track = (
    <button
      {...rest}
      key="track"
      ref={ref}
      id={switchId}
      type="button"
      role="switch"
      aria-checked={isOn}
      aria-labelledby={label ? labelId : rest['aria-labelledby']}
      disabled={disabled}
      onClick={handleClick}
      className="lg-surface lg-switch__track lg-focusable"
      data-elevation="flat"
    >
      <span className="lg-switch__thumb" aria-hidden="true" />
    </button>
  );

  // A `<label for>` pointing at a button does not forward clicks the way it
  // does for a real form control, so the text gets its own handler to keep the
  // hit target the size a user expects.
  const text = label ? (
    <span key="label" className="lg-switch__label" id={labelId} onClick={toggle}>
      {label}
    </span>
  ) : null;

  return (
    <span
      className={cx('lg-switch', className)}
      data-size={size}
      data-checked={isOn ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      data-label={label ? labelPosition : undefined}
    >
      {labelPosition === 'start' ? [text, track] : [track, text]}
    </span>
  );
});

Switch.displayName = 'Switch';
