import { useEffect, useMemo, useRef, useState } from "react";
import type { Actions, Slots, Mode, ContextProps } from "./types";
import { Context } from "./context";
import { bufferToNum, hexStrToArray } from "./helpers";
import _ from "lodash";
import { useLocalStorage } from "../../hooks/use-local-storage";
import {
  CHAR_ID,
  CMD_DOWN,
  CMD_STOP,
  CMD_UP,
  MAX,
  MIN,
  NAME_PREFIX,
  ONEMMTOPOS,
  POSITION_CHAR_ID,
  POSITION_SERVICE_ID,
  SERVICE_ID,
} from "../../constants";

export const DeskController = ({ children }) => {
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [service, setService] = useState<BluetoothRemoteGATTService | null>(
    null,
  );

  const [server, setServer] = useState<BluetoothRemoteGATTServer | null>(null);
  const [characteristic, setCharacteristic] =
    useState<BluetoothRemoteGATTCharacteristic | null>(null);
  const [currentPosition, setCurrentPosition] = useState<number | null>(null);

  const longInterval = useRef(null);
  const [autoMove, setAutoMove] = useState<boolean>(false);
  const [mode, setMode] = useState<Mode>("normal");
  const [slotState, setSlotState] = useLocalStorage<Map<string, number | null>>(
    "slots",
    new Map(),
    {
      serializer: (value) =>
        JSON.stringify(Object.fromEntries(value.entries())),
      deserializer: (value) => {
        return new Map(Object.entries(JSON.parse(value)));
      },
    },
  );

  const actions: Actions = useMemo(
    () => ({
      // REST
      onDisconnect: () => {
        if (!device) return;
        device.gatt.disconnect();
      },
      onPair: async () => {
        if (navigator.bluetooth === undefined)
          return alert("Bluetooth not supported");

        // device
        const reqDevice: BluetoothDevice = await navigator.bluetooth
          .requestDevice({
            optionalServices: [SERVICE_ID, POSITION_SERVICE_ID],
            filters: [{ namePrefix: NAME_PREFIX }],
          })
          .catch(() => {
            alert(
              "Please make sure your desk is on and paired to you computer.",
            );
            return null;
          });

        if (!reqDevice) return null;
        setDevice(reqDevice);

        // server
        const reqServer: BluetoothRemoteGATTServer =
          await reqDevice.gatt.connect();
        setServer(reqServer);

        // service
        const reqService: BluetoothRemoteGATTService =
          await reqServer.getPrimaryService(SERVICE_ID);
        setService(reqService);

        // position service
        const reqServicePos: BluetoothRemoteGATTService =
          await reqServer.getPrimaryService(POSITION_SERVICE_ID);

        // characteristic
        const reqChar: BluetoothRemoteGATTCharacteristic =
          await reqServicePos.getCharacteristic(POSITION_CHAR_ID);
        setCharacteristic(reqChar);
      },
      toggleAutoMove: () => {
        setAutoMove((curr) => !curr);
      },
      changeMode: (newMode: Mode) => setMode(newMode),
    }),
    [currentPosition],
  );

  const slots: ContextProps["slots"] = {
    value: slotState,
    remove: (key) =>
      setSlotState((items) => {
        const newItems = new Map(items);
        newItems.delete(key);
        return newItems;
      }),
    set: (slot, value) => {
      const current = value ?? currentPosition;
      setSlotState((items) => {
        // update current slot
        const newItems = new Map(items);
        newItems.set(slot, current);
        return newItems;
      });
      setMode("normal");
    },
  };

  /**
   * command sender to device
   * @param cmd
   */
  const sendCmd = async (cmd: string) => {
    if (service === null) throw "Service is not connected.";
    // SEND COMMAND -> once ended set is Not Doing
    const char = await service.getCharacteristic(CHAR_ID);
    await char.writeValue(hexStrToArray(cmd));
  };

  const desk = {
    // TODO: implement onMouseDown -> keep moveUp/Down until onMouseUp
    moveUp: async () => {
      await sendCmd(CMD_UP);
      await sendCmd(CMD_STOP);
    },
    moveDown: async () => {
      await sendCmd(CMD_DOWN);
      await sendCmd(CMD_STOP);
    },
    longMoveDown: async () => {
      await sendCmd(CMD_DOWN);
      await sendCmd(CMD_DOWN);
      await sendCmd(CMD_DOWN);
      await sendCmd(CMD_DOWN);
      await sendCmd(CMD_DOWN);
    },
    longMoveUp: async () => {
      await sendCmd(CMD_UP);
      await sendCmd(CMD_UP);
      await sendCmd(CMD_UP);
      await sendCmd(CMD_UP);
      await sendCmd(CMD_UP);
    },
    stop: async () => {
      await sendCmd(CMD_STOP);
      await sendCmd(CMD_STOP);
      await sendCmd(CMD_STOP);
    },
    moveTo: async (position: number) => {
      if (position < MIN || position > MAX)
        throw "Position must be between 0 and 6500";

      longInterval.current = setInterval(() => {
        setCurrentPosition((curr) => {
          const diff = position - curr;
          const needed = Math.abs(diff);
          const move_way = diff > 0 ? "up" : "down";
          if (needed <= ONEMMTOPOS / 2 && needed >= -(ONEMMTOPOS / 2)) {
            stop();
            clearInterval(longInterval.current);
          } else if (needed > 50) {
            move_way === "up" ? desk.longMoveUp() : desk.longMoveDown();
          } else {
            move_way === "up" ? desk.moveUp() : desk.moveDown();
          }
          return curr;
        });
      }, 500);
    },
  };

  const handleDisconnect = () => {
    new Notification("Desk disconnected!");
    setDevice(null);
    setService(null);
    setServer(null);
    setCharacteristic(null);
  };

  /**
   * Add event listener for disconnection
   */
  useEffect(() => {
    if (device) {
      device.addEventListener("gattserverdisconnected", handleDisconnect);
      return () => {
        device.removeEventListener("gattserverdisconnected", handleDisconnect);
      };
    }
  }, [device]);

  /**
   * onConnect -> move up slighty to get latest position & data
   * TODO: re-code
   */
  useEffect(() => {
    if (service !== null) desk.moveUp();
  }, [service]);

  /**
   * Start notifications for position
   */
  useEffect(() => {
    if (characteristic === null) return;
    const startNotifications = async () => {
      await characteristic.startNotifications();
    };
    startNotifications();
    characteristic.addEventListener(
      "characteristicvaluechanged",
      (evt: any) => {
        const position = bufferToNum(evt.target.value.buffer);
        setCurrentPosition(position);
      },
    );
  }, [characteristic]);

  return (
    <Context.Provider
      value={{
        state: {
          currentPosition,
          device,
          autoMove,
          mode,
        },
        actions,
        desk,
        slots,
      }}
    >
      {children}
    </Context.Provider>
  );
};
