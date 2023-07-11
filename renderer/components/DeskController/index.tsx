import { useEffect, useMemo, useRef, useState } from "react";
import { Actions, Slots } from "./types";
import { Context, defaultSlots } from "./context";
import { bufferToNum, hexStrToArray } from "./helpers";
import _ from "lodash";
const MINUTE_MS = 1000 * 60;
const INTERVAL_MS = MINUTE_MS * 5;

const onemmtopos = 10;
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
  const [autoMove, setAutoMove] = useState<boolean>(false);
  const [server, setServer] = useState<BluetoothRemoteGATTServer | null>(null);
  const [characteristic, setCharacteristic] =
    useState<BluetoothRemoteGATTCharacteristic | null>(null);
  const [currentPosition, setCurrentPosition] = useState<number | null>(null);
  const [slots, setSlots] = useState<Slots>(defaultSlots);
  const [slotSaving, setSlotSaving] = useState<boolean>(false);
  const [currentSlot, setCurrentSlot] = useState<number | null>(null);

  const longInterval = useRef(null);

  const actions: Actions = useMemo(
    () => ({
      setSlot: (slot, value) => {
        const current = value ?? currentPosition;
        setSlots((items) => {
          // update current slot
          const newItems = new Map(items);
          newItems.set(slot, current);

          // update local storage
          const current_slots = Array.from(newItems).map(([k, v]) => ({
            key: k,
            value: v,
          }));
          const stored_slots = JSON.parse(localStorage.getItem("slots"));
          if (!_.isEqual(current_slots, stored_slots))
            localStorage.setItem("slots", JSON.stringify(current_slots));

          return newItems;
        });
        setSlotSaving(false);
      },
      onDisconnect: async () => {
        if (!device) return;
        await device.gatt.disconnect();
      },
      onPair: async () => {
        if (navigator.bluetooth === undefined)
          return alert("Bluetooth not supported");

        // device
        const reqDevice: BluetoothDevice = await navigator.bluetooth
          .requestDevice({
            optionalServices: [serviceID, positionServiceID],
            filters: [{ namePrefix }],
          })
          .catch(() => {
            alert(
              "Please make sure your desk is on and paired to you computer."
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
      toggleAutoMove: () => {
        setAutoMove((curr) => !curr);
      },
      setSlotSaving,
    }),
    [currentPosition]
  );

  const slotsObj = useMemo(
    () =>
      Array.from(slots)
        .map(([key, value]) => ({ key, value }))
        .filter(({ value }) => value !== null)
        .sort((a, b) => a.value - b.value),
    [slots]
  );

  /**
   * command sender to device
   * @param cmd
   */
  const sendCmd = async (cmd: string) => {
    if (service === null) throw "Service is not connected.";
    // SEND COMMAND -> once ended set is Not Doing
    const char = await service.getCharacteristic(charID);
    await char.writeValue(hexStrToArray(cmd));
  };

  const desk = {
    moveUp: async () => {
      await sendCmd("4700");
      await sendCmd("FF00");
    },
    moveDown: async () => {
      await sendCmd("4600");
      await sendCmd("FF00");
    },
    moveTo: async (position: number) => {
      if (position < min || position > max)
        throw "Position must be between 0 and 6500";

      longInterval.current = setInterval(() => {
        setCurrentPosition((curr) => {
          const diff = position - curr;
          const needed = Math.abs(diff);
          const move_way = diff > 0 ? "up" : "down";
          if (needed <= onemmtopos / 2 && needed >= -(onemmtopos / 2)) {
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
    longMoveDown: async () => {
      await sendCmd("4600");
      await sendCmd("4600");
      await sendCmd("4600");
      await sendCmd("4600");
      await sendCmd("4600");
    },
    longMoveUp: async () => {
      await sendCmd("4700");
      await sendCmd("4700");
      await sendCmd("4700");
      await sendCmd("4700");
      await sendCmd("4700");
    },
    stop: async () => {
      await sendCmd("FF00");
      await sendCmd("FF00");
      await sendCmd("FF00");
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
   * Load slots from local storage
   */
  useEffect(() => {
    const stored_slots = JSON.parse(localStorage.getItem("slots"));
    if (stored_slots !== null) {
      const new_slots = new Map();
      Object.keys(stored_slots).map((key) => {
        new_slots.set(key, stored_slots[key].value);
      });
      setSlots(new_slots);
    }
  }, []);

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
      }
    );
  }, [characteristic]);

  /**
   * Auto Move Table
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlot((s) => {
        const next_slot: number =
          s === null
            ? Number(slotsObj[0].key)
            : slotsObj.length - 1 > s
            ? s + 1
            : Number(slotsObj[0].key);
        return next_slot;
      });
    }, INTERVAL_MS);

    if (slotsObj.length < 2) {
      console.log("Not enough slots to auto move");
      setCurrentSlot(null);
      clearInterval(interval);
      return;
    }

    if (!autoMove) {
      clearInterval(interval);
      setCurrentSlot(null);
      return;
    }

    return () => {
      clearInterval(interval);
      setCurrentSlot(null);
    }; // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
  }, [autoMove]);

  /**
   * Desk Mover
   */
  useEffect(() => {
    if (currentSlot !== null && autoMove) {
      const target_position = slotsObj[currentSlot].value;
      desk.moveTo(target_position);
    }
  }, [currentSlot]);

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
          autoMove,
          slotSaving,
        },
        actions,
        desk,
      }}
    >
      {children}
    </Context.Provider>
  );
};
