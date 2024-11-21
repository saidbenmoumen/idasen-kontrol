import { createContext } from "react";
import type { ContextProps, Slots } from "./types";

export const Context = createContext<ContextProps>({
  state: {
    currentPosition: null,
    device: null,
    autoMove: false,
    mode: "normal",
  },
  actions: {
    changeMode: () => {},
    onPair: () => {},
    toggleAutoMove: () => {},
    onDisconnect: () => {},
  },
  desk: null,
  slots: {
    value: new Map(),
    set: () => {},
    remove: () => {},
  },
});
