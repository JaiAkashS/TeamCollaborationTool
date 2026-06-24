import { useEffect } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";

import DashboardPage from "./pages/DashboardPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import WorkspacePage from "./pages/WorkspacePage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { fetchCurrentUser } from "./features/authSlice.js";
import store from "./store/store.js";

function AppRoutes() {
  const dispatch = useDispatch();
  const { user, status } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  if (status === "loading" && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-sm text-ink-200">
        Loading session...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute isAllowed={Boolean(user)}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspaces/:workspaceId"
        element={
          <ProtectedRoute isAllowed={Boolean(user)}>
            <WorkspacePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  );
}
