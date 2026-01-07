import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signup, login, getCurrentUser, setAuthToken } from "../api/auth";
import "./Auth.css";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("token") && localStorage.getItem("isLoggedIn") === "true") {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (password !== confirmPassword) throw new Error("Passwords do not match");
      if (password.length < 8) throw new Error("Password must be at least 8 characters");

      const response = await signup(name, email, password);

      // Extract token
      let token =
        response.data?.token ||
        response.data?.authToken ||
        response.data?.access_token ||
        response.data?.accessToken ||
        response.data?.jwt ||
        response.data?.jwt_token;

      if (!token) {
        const loginResp = await login(email, password);
        token =
          loginResp.data?.token ||
          loginResp.data?.authToken ||
          loginResp.data?.access_token ||
          loginResp.data?.accessToken ||
          loginResp.data?.jwt ||
          loginResp.data?.jwt_token;
      }

      if (!token) throw new Error("Authentication failed");

      // Store token
      const cleanToken = token.trim();
      localStorage.setItem("token", cleanToken);
      localStorage.setItem("isLoggedIn", "true");
      setAuthToken(cleanToken);

      // Fetch full user
      let user;
      try {
        const userResp = await getCurrentUser();
        user = userResp.data;
      } catch {
        user =
          response.data?.user ||
          response.data?.data?.user ||
          { email, name, role: "user" };
      }

      if (!user.role) user.role = "user";
      if (!user.email) user.email = email;
      if (!user.name) user.name = name;

      localStorage.setItem("currentUser", JSON.stringify(user));
      window.dispatchEvent(new CustomEvent("auth", { detail: { type: "login" } }));

      window.location.href = "/";
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Sign Up</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} />
          </div>
          <button type="submit" disabled={loading}>{loading ? "Signing up..." : "Sign Up"}</button>
        </form>
        <p>
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
}
