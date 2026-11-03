import { AuthContextProvider } from "@contexts/authContext";
import { RealtimeContextProvider } from "@contexts/realtimeContext";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./main.css";
import { router } from "./router";

const root = document.getElementById("root");

if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <AuthContextProvider>
      <RealtimeContextProvider>
        <RouterProvider router={router} />
      </RealtimeContextProvider>
    </AuthContextProvider>
  </StrictMode>,
);
