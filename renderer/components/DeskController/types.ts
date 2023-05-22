export type Slots = Map<number, number | null>;

export type Actions = {
  onPair: () => void;
  setSlot: (slot: number, value?: number | null) => void;
};

export interface ContextProps {
  state: {
    slots: Slots;
    currentPosition: number | null;
    device: BluetoothDevice | null;
    server: BluetoothRemoteGATTServer | null;
    service: BluetoothRemoteGATTService | null;
    characteristic: BluetoothRemoteGATTCharacteristic | null;
  };
  actions: Actions;
}

export interface Props {
  children: React.ReactNode;
}
