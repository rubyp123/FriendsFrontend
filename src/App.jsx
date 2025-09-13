// App.jsx
import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import SignUpPage from "./components/SignUpPage";
import LoginPage from "./components/LoginPage";
import RoomPage from "./components/RoomPage";
import LandingPageAfterLogin from "./components/LandingPageAfterLogin";
import "react-toastify/dist/ReactToastify.css";

function Home({ token, setToken }) {
  return token ? (
    <LandingPageAfterLogin setToken={setToken} />
  ) : (
    <LandingPage />
  );
}

function RequireAuth({ token, children }) {
  return token ? children : <Navigate to="/login" replace />;
}

function RequireNoAuth({ token, children }) {
  return token ? <Navigate to="/" replace /> : children;
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const onStorage = () => setToken(localStorage.getItem("token"));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Single canonical home route */}
        <Route path="/" element={<Home token={token} setToken={setToken} />} />

        {/* Auth-free routes redirect home if already logged in */}
        <Route
          path="/login"
          element={
            <RequireNoAuth token={token}>
              <LoginPage setToken={setToken} />
            </RequireNoAuth>
          }
        />
        <Route
          path="/signup"
          element={
            <RequireNoAuth token={token}>
              <SignUpPage />
            </RequireNoAuth>
          }
        />

        {/* Protected route(s) */}
        <Route
          path="/room/:roomId"
          element={
            <RequireAuth token={token}>
              <RoomPage />
            </RequireAuth>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer position="top-center" autoClose={3000} />
    </BrowserRouter>
  );
}
