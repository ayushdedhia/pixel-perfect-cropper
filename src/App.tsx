import { lazy, Suspense, useMemo } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";

import { LoadingScreen } from "./components/LoadingScreen";
import { ProtectedLayout, PublicLayout } from "./components/RouteGuards";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

const ForgotPasswordPage = lazy(() =>
  import("./pages/ForgotPasswordPage").then((m) => ({ default: m.ForgotPasswordPage }))
);
const HomePage = lazy(() => import("./pages/HomePage").then((m) => ({ default: m.HomePage })));
const LoginPage = lazy(() => import("./pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() =>
  import("./pages/RegisterPage").then((m) => ({ default: m.RegisterPage }))
);
const ResetPasswordPage = lazy(() =>
  import("./pages/ResetPasswordPage").then((m) => ({ default: m.ResetPasswordPage }))
);
const SettingsPage = lazy(() =>
  import("./pages/SettingsPage").then((m) => ({ default: m.SettingsPage }))
);
const StorePage = lazy(() =>
  import("./pages/StorePage").then((m) => ({ default: m.StorePage }))
);

function AppRouter() {
  const router = useMemo(
    () =>
      createBrowserRouter([
        {
          element: <PublicLayout />,
          children: [
            { path: "/login", element: <LoginPage /> },
            { path: "/register", element: <RegisterPage /> },
            { path: "/forgot-password", element: <ForgotPasswordPage /> },
            { path: "/reset-password", element: <ResetPasswordPage /> },
          ],
        },
        {
          element: <ProtectedLayout />,
          children: [
            { path: "/", element: <HomePage /> },
            { path: "/settings", element: <SettingsPage /> },
            { path: "/store", element: <StorePage /> },
          ],
        },
        { path: "*", element: <Navigate to="/" replace /> },
      ]),
    []
  );

  return (
    <Suspense fallback={<LoadingScreen />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Toaster theme="dark" position="bottom-center" richColors className="font-sans!" />
        <AppRouter />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
