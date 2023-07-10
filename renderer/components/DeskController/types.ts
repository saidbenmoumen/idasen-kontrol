export type Slots = Map<number, number | null>;

export type Actions = {
  onPair: () => void;
  setSlot: (slot: number, value?: number | null) => void;
  toggleAutoMove: () => void;
  setSlotSaving: (value: boolean) => void;
};

export interface ContextProps {
  state: {
    slots: Slots;
    currentPosition: number | null;
    device: BluetoothDevice | null;
    server: BluetoothRemoteGATTServer | null;
    service: BluetoothRemoteGATTService | null;
    characteristic: BluetoothRemoteGATTCharacteristic | null;
    autoMove: boolean;
    slotSaving: boolean;
  };
  actions: Actions;
}

export interface Props {
  children: React.ReactNode;
}
