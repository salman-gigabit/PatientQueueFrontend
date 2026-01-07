import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { getCurrentUser, setAuthToken } from "./api/auth";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import "./style.css";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const isLogged = localStorage.getItem("isLoggedIn");

      if (!token || isLogged !== "true") {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      setAuthToken(token); // Attach token globally

      const cachedUser = localStorage.getItem("currentUser");

      if (cachedUser) {
        try {
          JSON.parse(cachedUser); // Validate JSON
          setIsLoggedIn(true);
          setLoading(false); // Don't wait for backend verification
          
          getCurrentUser()
            .then((response) => {
              const user = response.data;
              localStorage.setItem("currentUser", JSON.stringify(user));
              localStorage.setItem("isLoggedIn", "true");
              setIsLoggedIn(true);
            })
            .catch((err) => {
              if (err.response?.status === 401 || err.response?.status === 403) {
                console.warn("Backend returned 401/403 but cached user exists - keeping auth state");
              }
            });
          return; // Exit early since we used cached data
        } catch {
          localStorage.removeItem("currentUser");
        }
      }

      try {
        const response = await getCurrentUser();
        const user = response.data;
        localStorage.setItem("currentUser", JSON.stringify(user));
        localStorage.setItem("isLoggedIn", "true");
        setIsLoggedIn(true);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.warn("Token invalid and no cached user, clearing auth");
          localStorage.removeItem("token");
          localStorage.removeItem("currentUser");
          localStorage.removeItem("isLoggedIn");
          setIsLoggedIn(false);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth events
    const handleAuth = () => checkAuth();
    window.addEventListener("auth", handleAuth);
    window.addEventListener("storage", handleAuth);

    return () => {
      window.removeEventListener("auth", handleAuth);
      window.removeEventListener("storage", handleAuth);
    };
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Home />
            ) : (
              <Navigate to="/signup" replace />
            )
          }
        />
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={isLoggedIn ? <Navigate to="/" replace /> : <Signup />}
        />
        <Route
          path="/profile"
          element={
            isLoggedIn ? (
              <Profile />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}
