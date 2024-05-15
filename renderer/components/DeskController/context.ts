import { createContext } from "react";
import type { ContextProps, Slots } from "./types";

export const defaultSlots: Slots = new Map(
  Array.from({ length: 4 }, (_, i) => [i, null])
);

export const Context = createContext<ContextProps>({
  state: {
    slots: defaultSlots,
    currentPosition: null,
    device: null,
    server: null,
    service: null,
    characteristic: null,
    autoMove: false,
    slotSaving: false
  },
  actions: {
    setSlot: () => {},
    removeSlot: () => {},
    onPair: () => {},
    toggleAutoMove: () => {},
    setSlotSaving: () => {},
    onDisconnect: () => {},
  },
  desk: null
});
