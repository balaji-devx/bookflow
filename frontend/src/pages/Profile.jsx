import { useEffect, useState } from 'react';
import NavBar from '../components/Navbar.jsx';
import '../pages/css/App.css';

function Profile() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Load user data from localStorage
  useEffect(() => {
    const storedName = localStorage.getItem("userName") || "Guest User";
    const storedEmail = localStorage.getItem("userEmail") || "guest@example.com";

    setName(storedName);
    setEmail(storedEmail);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    window.location.href = "/login";
  };

  return (
    <>
      <NavBar />
      <div className="login-container">
        <div className="login-box">
          <div className="logo">📚 BookFlow</div>
          <h2>User Profile</h2>

          <div className="input-group">
            <label>Full Name</label>
            <input type="text" value={name} readOnly />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input type="email" value={email} readOnly />
          </div>

          <button className="login-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </>
  );
}

export default Profile;
