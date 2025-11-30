import { useState } from "react";
import NavBar from "../components/Navbar.jsx";
import "../pages/css/App.css";

function Login() {
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
      const res = await fetch("http://localhost:5000/api/auth/login", {
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

      // --- 🎯 NEW & UPDATED LOGIC HERE ---
      
      // 1. Save token & basic user info
      localStorage.setItem("token", data.token);
      
      // NOTE: Your backend must send these fields in the response body.
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userEmail", data.user.email);
      
      // 2. CRITICAL: Save the role and check it for redirection
      const userRole = data.user.role; // 👈 Assuming backend sends { token: ..., user: { name: ..., role: ... } }

      if (userRole) {
        localStorage.setItem("userRole", userRole);
      }
      
      // 3. Conditional Redirection
      if (userRole === "admin") {
        // Redirect Admin users to the dedicated admin page
        window.location.href = "/admin"; 
      } else {
        // Redirect standard users to the home page
        window.location.href = "/";
      }
      
      // --- END OF NEW & UPDATED LOGIC ---
      
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