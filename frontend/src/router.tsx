import { ProtectedRoute } from "@components/ProtectedRoute";
import { LoginPage } from "@pages/Login";
import { MessagesPage } from "@pages/Messages";
import { RegisterPage } from "@pages/Register";
import { createBrowserRouter, Navigate } from "react-router-dom";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  {
    element: <ProtectedRoute />,
    children: [{ path: "/", element: <MessagesPage /> }],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
