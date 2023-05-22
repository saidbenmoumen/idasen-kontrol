import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  fa1,
  fa2,
  fa3,
  fa4,
  faChevronDown,
  faChevronUp,
  faFloppyDisk,
  faHashtag,
  faX,
} from "@fortawesome/free-solid-svg-icons";
import Button from "../components/Button";
import { useController } from "../components/DeskController/useController";
import { posToCm } from "../components/DeskController/helpers";
import { faHashnode } from "@fortawesome/free-brands-svg-icons";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

export const Desk = () => {
  const [isSlotSaving, setIsSlotSaving] = useState(false);

  const {
    state: { device, currentPosition, slots },
    actions: { setSlot },
    desk,
  } = useController();
  if (device === null) return <div>loading...</div>;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-end pt-2">
        <h1 className="text-5xl text-zinc-300 font-thin leading-none">
          {posToCm(currentPosition)}
        </h1>
        <h1 className="text-xl font-thin text-zinc-400">{device.name}</h1>
      </div>
      <div className="grid grid-cols-7 gap-2">
        <Button onMouseDown={() => desk.moveUp()} onMouseUp={() => desk.stop()}>
          <FontAwesomeIcon icon={faChevronUp} />
        </Button>
        <Button
          onMouseDown={() => desk.moveDown()}
          onMouseUp={() => desk.stop()}
        >
          <FontAwesomeIcon icon={faChevronDown} />
        </Button>
        {Array.from(slots).map(([slot, value]) => (
          <Button
            key={`slot-${slot}`}
            className={twMerge(
              isSlotSaving
                ? "border-indigo-500 animate-pulse"
                : value
                ? "text-white"
                : "",
              "hover:animate-none"
            )}
            onClick={() => {
              if (isSlotSaving) {
                setSlot(slot);
              } else {
                desk.moveTo(value);
              }
            }}
            disabled={isSlotSaving ? false : value === null}
          >
            <span className={twMerge(value && "text-sm")}>
              {value ? posToCm(value) : slot + 1}
            </span>
          </Button>
        ))}
        <Button
          onClick={() => {
            setIsSlotSaving((s) => !s);
          }}
        >
          <FontAwesomeIcon icon={isSlotSaving ? faX : faFloppyDisk} />
        </Button>
      </div>
    </div>
  );
};
