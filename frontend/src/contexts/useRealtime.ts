import { useContext } from "react";
import { RealtimeContext } from "./realtimeContext";

export const useRealtime = () => {
  const context = useContext(RealtimeContext);

  if (!context) throw new Error("useRealtime needs RealtimeContextProvider");

  return context;
};
