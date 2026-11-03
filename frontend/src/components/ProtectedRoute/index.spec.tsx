import { AuthContext, type AuthContextValue } from "@contexts/authContext";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./index";

const renderRoute = (value: Partial<AuthContextValue>) =>
  render(
    <AuthContext.Provider value={value as AuthContextValue}>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/login" element={<p>login</p>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<p>private</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );

describe("ProtectedRoute", () => {
  it("shows nothing while loading", () => {
    renderRoute({ user: null, isLoading: true });

    expect(screen.queryByText("private")).not.toBeInTheDocument();
    expect(screen.queryByText("login")).not.toBeInTheDocument();
  });

  it("redirects when there is no user", () => {
    renderRoute({ user: null, isLoading: false });

    expect(screen.getByText("login")).toBeInTheDocument();
  });

  it("shows the page for a user", () => {
    const user = { id: "1", name: "Ana", email: "ana@test.com" };

    renderRoute({ user, isLoading: false });

    expect(screen.getByText("private")).toBeInTheDocument();
  });
});
