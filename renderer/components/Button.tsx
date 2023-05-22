import React from "react";
import { twMerge } from "tailwind-merge";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export default function Button({ className, children, ...props }: Props) {
  return (
    <button
      className={twMerge(
        "text-lg border px-3 rounded h-9 leading-none flex items-center justify-center shadow-lg uppercase font-light",
        "transition-all duration-150 ease-in-out", // transition
        "border-zinc-700 text-zinc-400 shadow-zinc-900", // colors
        "hover:bg-zinc-700 hover:text-zinc-100 hover:shadow-zinc-800", // hover
        className,
        props.disabled && "opacity-50 pointer-events-none", // disabled
        
      )}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
