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
  faRotateRight,
  faStop,
  faToggleOff,
  faToggleOn,
  faTurnDown,
  faTurnUp,
  faX,
} from "@fortawesome/free-solid-svg-icons";
import Button from "../components/Button";
import { useController } from "../components/DeskController/useController";
import { posToCm } from "../components/DeskController/helpers";
import { faHashnode } from "@fortawesome/free-brands-svg-icons";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

export const Desk = () => {
  const {
    state: { device, currentPosition, slots, autoMove, slotSaving },
    actions: { setSlot, toggleAutoMove, setSlotSaving },
    desk,
  } = useController();
  if (device === null) return <div>loading...</div>;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-end pt-2">
        <h1 className="text-5xl text-white font-extralight leading-none">
          {posToCm(currentPosition)}
          <small className="font-semibold text-2xl px-1 text-zinc-400">
            CM
          </small>
        </h1>
        <h1 className="text-xl font-light text-zinc-900 bg-zinc-500 px-2 rounded">
          {device.name}
        </h1>
      </div>
      <div className="grid grid-cols-24 gap-2">
        <Button className="col-span-3" onClick={() => desk.stop()}>
          <FontAwesomeIcon icon={faStop} />
        </Button>
        <Button className="col-span-3" onClick={() => desk.stop()}>
          <FontAwesomeIcon icon={faRotateRight} />
        </Button>
        <Button className="col-span-3" onClick={() => desk.moveUp()}>
          <FontAwesomeIcon icon={faChevronUp} />
        </Button>
        <Button className="col-span-3" onClick={() => desk.moveDown()}>
          <FontAwesomeIcon icon={faChevronDown} />
        </Button>
        <Button className="col-span-3" onClick={() => desk.longMoveUp()}>
          <FontAwesomeIcon icon={faTurnUp} />
        </Button>
        <Button className="col-span-3" onClick={() => desk.longMoveDown()}>
          <FontAwesomeIcon icon={faTurnDown} />
        </Button>
        <Button
          className={twMerge(
            "col-span-3",
            autoMove
              ? "bg-emerald-500/25 border-emerald-500/25 text-white hover:bg-emerald-500/30"
              : ""
          )}
          onClick={() => toggleAutoMove()}
        >
          <FontAwesomeIcon icon={autoMove ? faToggleOn : faToggleOff} />
        </Button>
        <Button
          className="col-span-3"
          onClick={() => {
            setSlotSaving((n) => !n);
          }}
        >
          <FontAwesomeIcon icon={slotSaving ? faX : faFloppyDisk} />
        </Button>
        {Array.from(slots).map(([slot, value]) => (
          <Button
            key={`slot-${slot}`}
            className={twMerge(
              "col-span-6",
              slotSaving
                ? "border-indigo-500 animate-pulse"
                : value
                ? "text-white"
                : "",
              "hover:animate-none"
            )}
            onClick={() => {
              if (slotSaving) {
                setSlot(slot);
              } else {
                desk.moveTo(value);
              }
            }}
            disabled={slotSaving ? false : value === null}
          >
            <span
              className={twMerge(
                value && "text-sm font-semibold text-zinc-300"
              )}
            >
              {value ? `${posToCm(value)} CM` : `#${Number(slot) + 1}`}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};
