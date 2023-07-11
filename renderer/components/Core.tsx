import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faCog, faMinus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { ipcRenderer } from "electron";
import Link from "next/link";
interface Props {
  title: string;
  children: React.ReactNode;
}

const Core: React.FC<Props> = ({ children, title }) => {
  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl">
      <header className="border-b border-zinc-800 p-[.4rem] h-8 items-center justify-center grid grid-cols-12">
        <div className="col-span-4 flex items-center justify-start gap-1">
          <button
            className="w-[1.1rem] aspect-square text-[0.7rem] leading-none flex items-center justify-center rounded-full bg-zinc-700 hover:bg-zinc-600 text-white"
            onClick={() => {
              ipcRenderer.send("app-quit");
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
          <button
            className="w-[1.1rem] aspect-square text-[0.7rem] leading-none flex items-center justify-center rounded-full hover:bg-zinc-800 text-zinc-400"
            onClick={() => {
              ipcRenderer.send("app-minimize");
            }}
          >
            <FontAwesomeIcon icon={faMinus} />
          </button>
        </div>
        <div className="col-span-4 text-center">
          {title && (
            <h1 className="font-semibold text-zinc-300 text-sm leading-none">
              {title}
            </h1>
          )}
        </div>
        <div className="col-span-4 flex items-center justify-end gap-1">
          <button
            className="w-[1.1rem] aspect-square text-[0.7rem] leading-none flex items-center justify-center rounded-full hover:bg-zinc-800 text-zinc-400"
            onClick={() => {
              // ipcRenderer.send("app-settings");
              alert("TODO: Settings")
            }}
          >
            <FontAwesomeIcon icon={faCog} />
          </button>
        </div>
      </header>
      <div className="flex-1 px-3">{children}</div>
      <footer className="px-3 py-2 flex items-center justify-between border-t border-zinc-800">
        <Link
          href={"https://github.com/glimse-io/idasen-kontrol"}
          target="_blank"
        >
          <a className="text-xs text-zinc-300 hover:underline underline-offset-2">
            <FontAwesomeIcon icon={faGithub} /> glimse-io/idasen-kontrol
          </a>
        </Link>
        <span className="text-xs text-zinc-300">v0.0.1-alpha</span>
      </footer>
    </div>
  );
};
export default Core;
