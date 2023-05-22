import { useEffect, useMemo, useRef, useState } from "react";
import { Actions, Slots } from "./types";
import { Context, defaultSlots } from "./context";
import { bufferToNum, hexStrToArray } from "./helpers";
import { clear } from "console";

const namePrefix = "Desk";
const max = 6500;
const min = 0;
const serviceID = "99fa0001-338a-1024-8a49-009c0215f78a";
const charID = "99fa0002-338a-1024-8a49-009c0215f78a";

const positionServiceID = "99fa0020-338a-1024-8a49-009c0215f78a";
const positionCharID = "99fa0021-338a-1024-8a49-009c0215f78a";

export const DeskController = ({ children }) => {
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [service, setService] = useState<BluetoothRemoteGATTService | null>(
    null
  );
  const [server, setServer] = useState<BluetoothRemoteGATTServer | null>(null);
  const [characteristic, setCharacteristic] =
    useState<BluetoothRemoteGATTCharacteristic | null>(null);

  const [currentPosition, setCurrentPosition] = useState<number | null>(null);
  const [slots, setSlots] = useState<Slots>(defaultSlots);

  const interval = useRef(null);
  const longInterval = useRef(null);

  const actions: Actions = useMemo(
    () => ({
      setSlot: (slot, value) => {
        const current = value ?? currentPosition;
        setSlots((items) => {
          const newItems = new Map(items);
          newItems.set(slot, current);
          return newItems;
        });
      },
      onPair: async () => {
        if (navigator.bluetooth === undefined)
          return alert("Bluetooth not supported");

        // device
        const reqDevice: BluetoothDevice =
          await navigator.bluetooth.requestDevice({
            optionalServices: [serviceID, positionServiceID],
            filters: [{ namePrefix }],
          });

        if (!reqDevice) return alert("No device selected");
        setDevice(reqDevice);

        // server
        const reqServer: BluetoothRemoteGATTServer =
          await reqDevice.gatt.connect();
        setServer(reqServer);

        // service
        const reqService: BluetoothRemoteGATTService =
          await reqServer.getPrimaryService(serviceID);
        setService(reqService);

        // position service
        const reqServicePos: BluetoothRemoteGATTService =
          await reqServer.getPrimaryService(positionServiceID);

        // characteristic
        const reqChar: BluetoothRemoteGATTCharacteristic =
          await reqServicePos.getCharacteristic(positionCharID);
        setCharacteristic(reqChar);
      },
    }),
    [currentPosition]
  );

  const sendCmd = async (cmd: string) => {
    if (service === null) throw "Service is not connected.";
    // SEND COMMAND -> once ended set is Not Doing
    const char = await service.getCharacteristic(charID);
    await char.writeValue(hexStrToArray(cmd)).then((v) => {
      console.log("writeValue", v);
    });
  };

  const moveUp = async (speed: "long" | "short" = "long") => {
    if (speed === "long") {
      sendCmd("4700");
      interval.current = setInterval(() => {
        sendCmd("4700");
      }, 500);
    } else {
      await sendCmd("4700");
      await sendCmd("FF00");
    }
  };

  const moveDown = async (speed: "long" | "short" = "long") => {
    if (speed === "long") {
      sendCmd("4600");
      interval.current = setInterval(() => {
        sendCmd("4600");
      }, 500);
    } else {
      clearInterval(interval.current);
      await sendCmd("4600");
      await sendCmd("FF00");
    }
  };

  const moveTo = async (position: number) => {
    if (position < min || position > max)
      throw "Position must be between 0 and 6500";

    longInterval.current = setInterval(() => {
      setCurrentPosition((curr) => {
        const diff = position - curr;
        const needed = Math.abs(diff);
        const move_way = diff > 0 ? "up" : "down";
        const speed = needed > 200 ? "long" : "short";
        console.log({ diff, needed, move_way });
        if (needed < 50) {
          console.log("STOP", { diff, needed, move_way });
          stop();
        } else {
          move_way === "up" ? moveUp(speed) : moveDown(speed);
        }
        return curr;
      });
    }, 300);
  };

  // CURRENT POSITION: 2176 / POSITION: 2482
  // CURR: 2417
  const stop = async () => {
    clearInterval(interval.current);
    clearInterval(longInterval.current);
    setTimeout(() => {
      sendCmd("FF00");
    }, 200);
  };

  const desk = {
    moveUp,
    moveDown,
    moveTo,
    stop,
  };

  const handleDisconnect = () => {
    new Notification("IDASEN Desk disconnected!", {
      body: "please re-connect!",
    });
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
      }
    );
  }, [characteristic]);

  return (
    <Context.Provider
      value={{
        state: {
          slots,
          currentPosition,
          device,
          service,
          server,
          characteristic,
        },
        actions,
        desk,
      }}
    >
      {children}
    </Context.Provider>
  );
};
