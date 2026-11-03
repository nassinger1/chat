import { useEffect } from "react";

export const useUnreadTitle = (unreadCount: number) => {
  useEffect(() => {
    document.title =
      unreadCount > 0 ? `(${unreadCount}) Mensagens` : "Mensagens";
  }, [unreadCount]);
};
