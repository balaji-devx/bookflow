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
        const message =
          data?.message ||
          (Array.isArray(data?.errors) &&
            data.errors.map((e) => e.msg).join(", ")) ||
          "Login failed";

        setError(message);
        setLoading(false);
        return;
      }

      // Save token & user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userEmail", data.user.email);

      // Redirect to home
      window.location.href = "/";
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Make sure backend is running.");
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
