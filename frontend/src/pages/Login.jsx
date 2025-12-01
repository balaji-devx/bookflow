import { useState } from "react"; // ✅ Fixed 'Import' capitalization
import { useNavigate } from "react-router-dom"; // 👈 NEW: Import useNavigate
import NavBar from "../components/Navbar.jsx";
import "../pages/css/App.css";
import { API_BASE_URL } from '../utils/apiConfig';

function Login() {
  const navigate = useNavigate(); // 👈 Initialize useNavigate hook
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loginUser = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      // 🎯 API CALL: Use the global constant
      const endpoint = `${API_BASE_URL}/auth/login`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // ... (Error handling remains the same)
        const message =
          data?.message ||
          (Array.isArray(data?.errors) &&
            data.errors.map((e) => e.msg).join(", ")) ||
          "Login failed";

        setError(message);
        setLoading(false);
        return;
      }

      // --- Success Logic ---
      
      // 1. Save token & basic user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userEmail", data.user.email);
      
      // 2. Save the role
      const userRole = data.user.role; 
      if (userRole) {
        localStorage.setItem("userRole", userRole);
      }
      
      // 3. Conditional Redirection
      if (userRole === "admin") {
        // ✅ FIX: Use navigate to keep routing client-side, bypassing server fallback issues
        navigate("/admin"); 
      } else {
        // ✅ FIX: Use navigate for standard users
        navigate("/");
      }
      
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Make sure backend is running.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="login-container">
        <div className="login-box">
          <div className="logo">BookFlow</div>
          <h2>Login to Your Account</h2>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={loginUser}>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;
      
