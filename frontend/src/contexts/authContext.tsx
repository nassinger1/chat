import type { InputLogin, SessionUser } from "@services/api.types";
import { AuthApi } from "@services/authApi";
import {
  createContext,
  type PropsWithChildren,
  useEffect,
  useState,
} from "react";

export type AuthContextValue = {
  user: SessionUser | null;
  isLoading: boolean;
  signIn: (input: InputLogin) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthContextProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AuthApi.getSession()
      .then((session) => setUser(session.user))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = async (input: InputLogin) => {
    const session = await AuthApi.login(input);

    setUser(session.user);
  };

  const signOut = async () => {
    await AuthApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
