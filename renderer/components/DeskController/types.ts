export type Slots = Map<number, number | null>;

export type State = {
  slots: Slots;
  currentPosition: number | null;
  device: BluetoothDevice | null;
  server: BluetoothRemoteGATTServer | null;
  service: BluetoothRemoteGATTService | null;
  characteristic: BluetoothRemoteGATTCharacteristic | null;
  autoMove: boolean;
  slotSaving: boolean;
}

export type Actions = {
  onPair: () => void;
  setSlot: (slot: number, value?: number | null) => void;
  removeSlot: (slot: number) => void;
  toggleAutoMove: () => void;
  setSlotSaving: (value: boolean) => void;
  onDisconnect: () => void;
};

export type Desk = {
  moveUp: () => void;
  moveDown: () => void;
  stop: () => void;
  longMoveUp: () => void;
  longMoveDown: () => void;
  moveTo: (position: number) => void;
}

export interface ContextProps {
  state: State;
  actions: Actions;
  desk: Desk
}

export interface Props {
  children: React.ReactNode;
}
