import { clsx } from "clsx";
import React from "react";

export const COMMON_STYLES_BASE = clsx(
  "rounded px-3 py-2 focus:border-primary-default focus:outline-none [border:2px_solid_#ccc]",
  "[transition:border-color_ease-in-out_0.15s]",
);
export const COMMON_STYLES = clsx(COMMON_STYLES_BASE, "w-full");

export const Input = React.forwardRef<
  HTMLInputElement,
  React.PropsWithChildren<React.JSX.IntrinsicElements["input"]>
>(function Input(props, ref) {
  const { children, className, ...rest } = props;
  return (
    <input className={clsx(COMMON_STYLES, className)} ref={ref} {...rest}>
      {children}
    </input>
  );
});

export const InputWithButton = React.forwardRef<
  HTMLInputElement,
  React.PropsWithChildren<React.JSX.IntrinsicElements["input"]>
>(function InputWithButton(props, ref) {
  const { children, className, ...rest } = props;
  return (
    <input
      className={clsx(COMMON_STYLES, "rounded-r-none", className)}
      ref={ref}
      {...rest}
    >
      {children}
    </input>
  );
});

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.PropsWithChildren<React.JSX.IntrinsicElements["select"]>
>(function Select(props, ref) {
  const { children, className, ...rest } = props;
  return (
    <select className={clsx(COMMON_STYLES, className)} ref={ref} {...rest}>
      {children}
    </select>
  );
});

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.PropsWithChildren<React.JSX.IntrinsicElements["textarea"]>
>(function Textarea(props, ref) {
  const { children, ...rest } = props;
  return (
    <textarea className={COMMON_STYLES} ref={ref} {...rest}>
      {children}
    </textarea>
  );
});
