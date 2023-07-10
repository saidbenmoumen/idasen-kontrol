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
    <div className="h-screen w-screen flex flex-col bg-zinc-900 border-b border-x border-zinc-800 text-zinc-100 rounded-bl-xl rounded-br-xl">
      <div className="flex-1 px-3">{children}</div>
      <footer className="px-3 py-2 flex items-center justify-between border-t border-zinc-800">
        <span className="text-xs text-zinc-300">
          <FontAwesomeIcon icon={faGithub} /> glimse-io/idasen-kontrol
        </span>
        <span className="text-xs text-zinc-300">v0.0.1-alpha</span>
      </footer>
    </div>
  );
};
export default Core;
