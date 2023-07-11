import React from "react";
import { twMerge } from "tailwind-merge";

const sizes = {
  lg: "h-11 px-5 text-lg",
  md: "h-9 px-3 text-base",
  sm: "h-9 px-3 text-base",
};

type Sizes = keyof typeof sizes;
interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: Sizes;
}

export default function Button({
  className,
  children,
  size = "md",
  ...props
}: Props) {
  return (
    <button
      className={twMerge(
        "text-lg ring-1 rounded leading-none flex items-center justify-center shadow-lg uppercase font-medium",
        "transition-all duration-150 ease-in-out", // transition
        "ring-zinc-700 text-zinc-400 shadow-zinc-900", // colors
        "hover:bg-blue-900/30 active:ring hover:text-blue-500 hover:ring-blue-500/25 hover:shadow-blue-800/20", // hover
        sizes[size], // size
        className,
        props.disabled && "opacity-50 pointer-events-none" // disabled
      )}
      draggable={false}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
