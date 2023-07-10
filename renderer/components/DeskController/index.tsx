import { useEffect, useMemo, useRef, useState } from "react";
import { Actions, Slots } from "./types";
import { Context, defaultSlots } from "./context";
import { bufferToNum, hexStrToArray } from "./helpers";
import _ from "lodash";

const interval_duration = 10000;

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

  const slot_interval = useRef(null);
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
    await char.writeValue(hexStrToArray(cmd)).then(() => {
      console.log("writeValue");
    });
  };

  /**
   * stop the desk
   * resets all auto move related stuff
   */
  const resetAutoMove = () => {
    clearTimeout(slot_interval.current);
    if (currentSlot !== null) setCurrentSlot(null);
    if (autoMove) setAutoMove(false);
  };

  const longMoveUp = async () => {
    await sendCmd("4700");
    await sendCmd("4700");
    await sendCmd("4700");
    await sendCmd("4700");
    await sendCmd("4700");
  };

  const longMoveDown = async () => {
    await sendCmd("4600");
    await sendCmd("4600");
    await sendCmd("4600");
    await sendCmd("4600");
    await sendCmd("4600");
  };

  const moveUp = async () => {
    await sendCmd("4700");
    await sendCmd("FF00");
  };

  const moveDown = async () => {
    await sendCmd("4600");
    await sendCmd("FF00");
  };

  const moveTo = async (position: number) => {
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
          move_way === "up" ? longMoveUp() : longMoveDown();
        } else {
          move_way === "up" ? moveUp() : moveDown();
        }
        return curr;
      });
    }, 500);
  };

  const stop = async () => {
    await sendCmd("FF00");
    await sendCmd("FF00");
    await sendCmd("FF00");
  };

  const desk = {
    moveUp,
    moveDown,
    moveTo,
    longMoveDown,
    longMoveUp,
    stop,
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

  useEffect(() => {
    if (autoMove) {
      // check if there are enough slots
      if (slotsObj.length < 2) {
        resetAutoMove();
        alert("Not enough slots to auto move");
        return;
      }
      // start with first slot key
      setCurrentSlot(slotsObj[0].key);
    } else {
      resetAutoMove();
    }
  }, [autoMove]);

  /**
   * Auto move to next slot
   */
  useEffect(() => {
    if (currentSlot !== null && autoMove) {
      slot_interval.current = setTimeout(() => {
        const next_slot =
          slotsObj.length - 1 > currentSlot ? currentSlot + 1 : 0;
        const target_position = slotsObj[next_slot].value;
        moveTo(target_position);
        setCurrentSlot(next_slot);
      }, interval_duration);
    }
  }, [currentSlot]);

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
