import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAnglesDown,
  faAnglesUp,
  faChevronDown,
  faChevronUp,
  faCircleNotch,
  faFloppyDisk,
  faMinus,
  faPowerOff,
  faStop,
  faToggleOff,
  faToggleOn,
  faX,
} from "@fortawesome/free-solid-svg-icons";
import Button from "../components/Button";
import { useController } from "../components/DeskController/useController";
import { posToCm } from "../components/DeskController/helpers";
import { twMerge } from "tailwind-merge";

export const Desk = () => {
  const {
    state: { device, currentPosition, autoMove, mode },
    actions: { toggleAutoMove, changeMode, onDisconnect },
    desk,
    slots,
  } = useController();

  if (device === null)
    return (
      <FontAwesomeIcon icon={faCircleNotch} className="animate-spin text-xl" />
    );

  return (
    <div className="flex flex-col gap-2 max-w-xl w-full mx-auto">
      <div className="flex justify-between items-end">
        <h1 className="text-5xl text-white font-bold leading-none">
          {posToCm(currentPosition).toFixed(0)}
          <small className="font-semibold text-2xl px-1 text-zinc-400">
            CM
          </small>
        </h1>
        <h1 className="text-xl font-light text-blue-500 border-blue-900 border bg-blue-900/30 px-2 rounded">
          {device.name}
        </h1>
      </div>
      <div className="grid grid-cols-6 gap-2">
        <Button
          className="text-red-500 hover:bg-red-900/30 hover:text-red-500 hover:ring-red-500/25 hover:shadow-red-800/20"
          onClick={() => onDisconnect()}
        >
          <FontAwesomeIcon icon={faPowerOff} />
        </Button>
        <Button onClick={() => desk.stop()}>
          <FontAwesomeIcon icon={faStop} />
        </Button>
        <Button onClick={() => desk.moveUp()}>
          <FontAwesomeIcon icon={faChevronUp} />
        </Button>
        <Button onClick={() => desk.moveDown()}>
          <FontAwesomeIcon icon={faChevronDown} />
        </Button>
        <Button onClick={() => desk.longMoveUp()}>
          <FontAwesomeIcon icon={faAnglesUp} />
        </Button>
        <Button onClick={() => desk.longMoveDown()}>
          <FontAwesomeIcon icon={faAnglesDown} />
        </Button>
        <Button
          className="hover:bg-yellow-900/30 hover:text-yellow-500 hover:ring-yellow-500/25 hover:shadow-yellow-800/20"
          onClick={() =>
            changeMode(mode === "slot-editor" ? "normal" : "slot-editor")
          }
        >
          <FontAwesomeIcon icon={mode === "slot-editor" ? faX : faFloppyDisk} />
        </Button>
        <Button
          className={twMerge(
            "hover:bg-emerald-900/30 hover:text-emerald-500 hover:ring-emerald-500/25 hover:shadow-emerald-800/20",
            autoMove &&
              "bg-emerald-500/25 ring-emerald-500/25 text-white hover:bg-emerald-500/30",
          )}
          disabled
          onClick={() => toggleAutoMove()}
        >
          <FontAwesomeIcon icon={autoMove ? faToggleOn : faToggleOff} />
        </Button>
        {Array.from({ length: 4 }).map((_, slotIndex) => {
          const slotKey = slotIndex.toString();
          const slotValue = slots.value.get(slotKey) ?? null;
          return (
            <Button
              key={`slot-${slotKey}`}
              className={twMerge(
                "relative",
                mode === "slot-editor"
                  ? "border-indigo-500 animate-pulse"
                  : slotValue
                    ? "text-white"
                    : "",
                "hover:animate-none",
              )}
              onClick={() => {
                if (mode === "slot-editor") {
                  slots.set(slotKey);
                } else {
                  desk.moveTo(slotValue);
                }
              }}
              disabled={mode === "slot-editor" ? false : !slotValue}
            >
              {slotValue ? (
                <button
                  className="bg-red-500 text-white absolute top-0 right-0 z-10 h-4 w-4 translate-x-1/2 -translate-y-1/3 rounded-full flex items-center justify-center"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    slots.remove(slotKey);
                  }}
                >
                  <FontAwesomeIcon icon={faMinus} className="text-[.68rem]" />
                </button>
              ) : null}
              <span
                className={twMerge(
                  slotValue && "text-sm font-semibold text-zinc-300",
                )}
              >
                {slotValue
                  ? `${posToCm(slotValue).toFixed(0)}cm`
                  : `#${Number(slotValue) + 1}`}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
