import type { ChatEvent } from "@services/api.types";
import { AuthApi } from "@services/authApi";
import {
  type BrokerConnection,
  openBrokerConnection,
  watchReconnects,
} from "@services/brokerClient";
import { PresenceApi } from "@services/presenceApi";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useAuth } from "./useAuth";

const HEARTBEAT_INTERVAL_IN_MS = 20_000;
const RENEW_BEFORE_EXPIRY_IN_MS = 60_000;

type EventListener = (event: ChatEvent) => void;
type ReconnectListener = () => void;

export type RealtimeContextValue = {
  subscribe: (listener: EventListener) => () => void;
  subscribeToReconnect: (listener: ReconnectListener) => () => void;
};

export const RealtimeContext = createContext<RealtimeContextValue | null>(null);

export function RealtimeContextProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const userId = user?.id;
  const eventListeners = useRef(new Set<EventListener>());
  const reconnectListeners = useRef(new Set<ReconnectListener>());

  const dispatchEvent = useCallback((event: ChatEvent) => {
    for (const listener of eventListeners.current) listener(event);
  }, []);

  const dispatchReconnect = useCallback(() => {
    for (const listener of reconnectListeners.current) listener();
  }, []);

  useEffect(() => {
    if (!userId) return;

    let isCancelled = false;
    let connection: BrokerConnection | null = null;
    let renewTimer: number | undefined;

    const connect = async () => {
      const credentials = await AuthApi.getBrokerCredentials();
      const opened = await openBrokerConnection(
        credentials,
        userId,
        dispatchEvent,
      );

      if (isCancelled) {
        await opened.close();
        return;
      }

      const previous = connection;

      connection = opened;
      void watchReconnects(opened, dispatchReconnect);

      if (previous) {
        await previous.close();
        dispatchReconnect();
      }

      const expiresAt = new Date(credentials.expiresAt).getTime();
      const delay = expiresAt - Date.now() - RENEW_BEFORE_EXPIRY_IN_MS;

      renewTimer = window.setTimeout(() => void connect(), delay);
    };

    void connect();
    void PresenceApi.heartbeat();

    const heartbeatTimer = window.setInterval(
      () => void PresenceApi.heartbeat(),
      HEARTBEAT_INTERVAL_IN_MS,
    );

    return () => {
      isCancelled = true;
      window.clearTimeout(renewTimer);
      window.clearInterval(heartbeatTimer);
      void connection?.close();
    };
  }, [userId, dispatchEvent, dispatchReconnect]);

  const value = useMemo(
    () => ({
      subscribe: (listener: EventListener) => {
        eventListeners.current.add(listener);

        return () => {
          eventListeners.current.delete(listener);
        };
      },
      subscribeToReconnect: (listener: ReconnectListener) => {
        reconnectListeners.current.add(listener);

        return () => {
          reconnectListeners.current.delete(listener);
        };
      },
    }),
    [],
  );

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}
