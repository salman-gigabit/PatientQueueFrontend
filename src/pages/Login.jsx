import { useState } from "react";
import { login, getCurrentUser, setAuthToken } from "../api/auth";
import "./Auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login(email, password);

      // Extract token
      const token =
        response.data?.token ||
        response.data?.authToken ||
        response.data?.access_token ||
        response.data?.accessToken ||
        response.data?.jwt ||
        response.data?.jwt_token;

      if (!token) throw new Error("No token received from server");

      // Store token
      const cleanToken = token.trim();
      localStorage.setItem("token", cleanToken);
      localStorage.setItem("isLoggedIn", "true");
      setAuthToken(cleanToken);

      // Fetch full user
      let user;
      try {
        const userResponse = await getCurrentUser();
        user = userResponse.data;
      } catch {
        // fallback to login response
        user =
          response.data?.user ||
          response.data?.data?.user ||
          (response.data?.email
            ? { email: response.data.email, name: response.data.name, role: response.data.role || "user", id: response.data.id }
            : null) ||
          { email, name: "", role: "user" };
      }

      if (!user.role) user.role = "user";
      if (!user.email) user.email = email;
      if (!user.name) user.name = "";

      localStorage.setItem("currentUser", JSON.stringify(user));
      window.dispatchEvent(new CustomEvent("auth", { detail: { type: "login" } }));

      window.location.href = "/";
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
        </form>
        <p>
          Don't have an account? <a href="/signup">Sign up</a>
        </p>
      </div>
    </div>
  );
}
