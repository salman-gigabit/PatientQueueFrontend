import { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import "./Auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (isLoggedIn) {
      const user = JSON.parse(localStorage.getItem("currentUser") || "null");
      setCurrentUser(user);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      
      // Find user by email (only for email/password auth)
      const user = users.find(
        (u) => u.email === email && u.password === password && (!u.authProvider || u.authProvider === "email")
      );

      if (user) {
        // Set login state
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("currentUser", JSON.stringify(user));
        
        // Redirect to home or refresh
        window.location.href = "/";
      } else {
        setError("Invalid email or password");
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    window.location.reload();
  };

  // If user is already logged in, show logged in state
  if (currentUser) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Welcome Back!</h2>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <p>You are logged in as:</p>
            <p style={{ fontWeight: "600", fontSize: "18px", color: "#667eea" }}>
              {currentUser.name}
            </p>
            <p style={{ color: "#666", fontSize: "14px" }}>{currentUser.email}</p>
          </div>
          <button onClick={handleLogout} className="auth-button" style={{ background: "#dc3545" }}>
            Logout
          </button>
        </div>
      </div>
    );
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setLoading(true);

    try {
      // Decode the JWT token to get user info
      const base64Url = credentialResponse.credential.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const userInfo = JSON.parse(jsonPayload);

      const users = JSON.parse(localStorage.getItem("users") || "[]");

      // Find existing user or create new one
      let user = users.find((u) => u.email === userInfo.email);

      if (!user) {
        // Create new user from Google
        user = {
          id: Date.now(),
          name: userInfo.name,
          email: userInfo.email,
          role: "user", // Default role for new Google users
          authProvider: "google",
          picture: userInfo.picture,
        };
        users.push(user);
        localStorage.setItem("users", JSON.stringify(users));
      }

      // Set login state
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("currentUser", JSON.stringify(user));

      // Redirect to home
      window.location.href = "/";
    } catch (err) {
      setError("Google login failed. Please try again.");
      console.error("Google login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed. Please try again.");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        
        <div style={{ margin: "20px 0", textAlign: "center" }}>
          <div style={{ margin: "15px 0", color: "#666" }}>OR</div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
          </div>
        </div>

        <p className="auth-link">
          Don't have an account? <a href="/signup">Sign up</a>
        </p>
      </div>
    </div>
  );
}

