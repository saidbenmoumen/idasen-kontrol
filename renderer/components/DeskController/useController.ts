import { useContext } from "react";
import { Context } from "./context";
import { ContextProps } from "./types";

export const useController = (): ContextProps => {
  return useContext(Context);
};
