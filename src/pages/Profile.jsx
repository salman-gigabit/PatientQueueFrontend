import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../api/auth";
import "./Auth.css";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    window.dispatchEvent(new CustomEvent("auth", { detail: { type: "logout" } }));
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const cachedUser = localStorage.getItem("currentUser");
        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
          setLoading(false);
        }

        // Fetch fresh user data
        const response = await getCurrentUser();
        const userData = response.data;
        setUser(userData);
        localStorage.setItem("currentUser", JSON.stringify(userData));
      } catch (err) {
        console.error("Failed to load user:", err);
        setError("Failed to load profile. Please try again.");
        if (err.response?.status === 401 || err.response?.status === 403) {
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [handleLogout, navigate]);

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="error-message">{error}</div>
          <button onClick={() => navigate("/")} style={{ marginTop: "20px", padding: "10px 20px" }}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: "600px" }}>
        <h2>User Profile</h2>
        {error && <div className="error-message">{error}</div>}
        
        {user && (
          <div style={{ marginTop: "20px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "30px" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: "#667eea",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "36px",
                  fontWeight: "600",
                  textTransform: "uppercase"
                }}
              >
                {(user.name || user.email || "U").charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="form-group">
              <label>Name</label>
              <div style={{ 
                padding: "10px", 
                background: "#f5f5f5", 
                borderRadius: "4px",
                fontSize: "16px"
              }}>
                {user.name || "N/A"}
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <div style={{ 
                padding: "10px", 
                background: "#f5f5f5", 
                borderRadius: "4px",
                fontSize: "16px"
              }}>
                {user.email || "N/A"}
              </div>
            </div>

            <div className="form-group">
              <label>Role</label>
              <div style={{ 
                padding: "10px", 
                background: "#f5f5f5", 
                borderRadius: "4px",
                fontSize: "16px",
                textTransform: "capitalize"
              }}>
                {user.role || "user"}
              </div>
            </div>

            {user.id && (
              <div className="form-group">
                <label>User ID</label>
                <div style={{ 
                  padding: "10px", 
                  background: "#f5f5f5", 
                  borderRadius: "4px",
                  fontSize: "14px",
                  color: "#666"
                }}>
                  {user.id}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", marginTop: "30px" }}>
              <button
                onClick={() => navigate("/")}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "16px"
                }}
              >
                Back to Home
              </button>
              <button
                onClick={handleLogout}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "16px"
                }}
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

