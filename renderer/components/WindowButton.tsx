import React from "react";
import { twMerge } from "tailwind-merge";

interface Props
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  type: "close" | "minimize" | "maximize";
}

const colors = {
  close: "bg-red-500 border border-red-600 shadow-lg shadow-red-500",
  minimize:
    "bg-yellow-500 border border-yellow-600 shadow-lg shadow-yellow-500",
  maximize: "bg-green-500 border border-green-600 shadow-lg shadow-green-500",
};

function WindowButton({ type, className, ...props }: Props) {
  return (
    <button
      className={twMerge(
        "border shadow-lg h-3 w-3 rounded-full flex items-center justify-center text-white leading-3 text-[0.6rem]",
        colors[type]
      )}
      type="button"
      {...props}
    >
      {type === "close" ? "×" : type === "minimize" ? "-" : "□"}
    </button>
  );
}

export default WindowButton;
