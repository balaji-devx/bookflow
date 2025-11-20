import { useState } from 'react';
import NavBar from '../components/Navbar.jsx';
import '../pages/css/App.css';

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const registerUser = async (e) => {
  e.preventDefault();

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Backend validation errors
      alert(data.message || "Registration failed");
      return;
    }

    // Store token + user info
    localStorage.setItem("token", data.token);
    localStorage.setItem("userName", data.user.name);
    localStorage.setItem("userEmail", data.user.email);

    // Redirect to home
    window.location.href = "/";
  } catch (error) {
    console.error("Registration error:", error);
    alert("Something went wrong. Try again!");
  }
};


  return (
    <>
      <NavBar />

      <div className="signup-container">
        <div className="signup-box">
          <div className="logo">📚 BookFlow</div>
          <h2>Create Your Account</h2>

          <form onSubmit={registerUser}>
            <div className="input-group">
              <label>Full Name</label>
              <input 
                type="text" 
                placeholder="Enter your full name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
              />
            </div>

            <div className="input-group">
              <label>Email</label>
              <input 
                type="email" 
                placeholder="you@example.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="Enter password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
              />
            </div>

            <div className="input-group">
              <label>Confirm Password</label>
              <input 
                type="password" 
                placeholder="Re-enter password" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                required 
              />
            </div>

            <button type="submit">Sign Up</button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Signup;
