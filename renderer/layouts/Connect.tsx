import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../components/Button";
import { useController } from "../components/DeskController/useController";
import { faBluetooth } from "@fortawesome/free-brands-svg-icons";

export const Connect = () => {
  const {
    actions: { onPair },
  } = useController();
  return (
    <div className="flex h-full items-center justify-center text-center flex-col gap-2">
      <h1 className="text-sm font-thin">No Desk Connected</h1>
      <Button
        onClick={() => {
          onPair();
        }}
      >
        <FontAwesomeIcon icon={faBluetooth} />
        &nbsp;Connect!
      </Button>
    </div>
  );
};
