export type Slots = Map<number, number | null>;

export type State = {
  currentPosition: number | null;
  device: BluetoothDevice | null;
  autoMove: boolean;
  mode: Mode;
};

export type Actions = {
  onPair: () => void;
  toggleAutoMove: () => void;
  changeMode: (mode: Mode) => void;
  onDisconnect: () => void;
};

export type Desk = {
  moveUp: () => void;
  moveDown: () => void;
  stop: () => void;
  longMoveUp: () => void;
  longMoveDown: () => void;
  moveTo: (position: number) => void;
};

export interface ContextProps {
  state: State;
  actions: Actions;
  desk: Desk;
  slots: {
    value: Map<string, number | null>;
    set: (key: string, value?: number | null) => void;
    remove: (key: string) => void;
  };
}

export interface Props {
  children: React.ReactNode;
}

export type Mode = "slot-editor" | "normal";
