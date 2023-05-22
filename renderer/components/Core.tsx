import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpDown } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import WindowButton from "./WindowButton";

interface Props {
  title: string;
  children: React.ReactNode;
}

const Core: React.FC<Props> = ({ children, title }) => {
  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl">
      <header className="h-8 flex items-center px-3 border-b border-zinc-800">
        <div className="flex-1 flex items-center">
          {title && (
            <h1 className="text-xs text-zinc-400 font-light">
              <FontAwesomeIcon icon={faUpDown} /> {title}
            </h1>
          )}
        </div>
        <div className="flex gap-2">
          <WindowButton type="maximize" />
          <WindowButton type="minimize" />
          <WindowButton type="close" />
        </div>
      </header>
      <div className="flex-1 px-3">{children}</div>
      <footer className="px-3 py-2 flex items-center justify-between">
        <span className="text-[0.6rem] text-zinc-300">
          <FontAwesomeIcon icon={faGithub} /> saidbenmoumen/idasen-control
        </span>
        <span className="text-[0.6rem] text-zinc-300">v0.0.1-alpha</span>
      </footer>
    </div>
  );
};
export default Core;
