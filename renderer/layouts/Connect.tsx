import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../components/Button";
import { useController } from "../components/DeskController/useController";
import { faBluetooth } from "@fortawesome/free-brands-svg-icons";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

export const Connect = () => {
  const {
    actions: { onPair },
  } = useController();
  return (
    <div className="flex flex-col h-full w-full items-center justify-center relative">
      <Button
        onClick={() => {
          onPair();
        }}
        size="lg"
      >
        <FontAwesomeIcon icon={faBluetooth} />
        &nbsp;Connect!
      </Button>
      <p className="absolute bottom-3 text-zinc-500 text-xs">
        <FontAwesomeIcon icon={faExclamationCircle} />
        &nbsp;tip: make sure you're connected to your desk from your os
        settings!
      </p>
    </div>
  );
};
