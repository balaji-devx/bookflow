import '../pages/css/App.css';
import { Link } from "react-router-dom";
import logo from '../assets/logo.png';

function NavBar() {
  return (
    <>
      <nav className="nav-container">

        {/* Left: Logo */}
        <div className="nav-left">
          <Link to="/" className="nav-logo">
            <img className="logo-img" src={logo} alt="Logo" />
          </Link>
        </div>

        {/* Middle: Search Bar */}
        <div className="nav-middle">
          <input
            type="text"
            className="nav-search"
            placeholder="Search for books..."
          />
        </div>

        {/* Right: Icons + Login + Sign Up */}
        <div className="nav-right">
          <Link to="/shop" className="nav-item">Shop</Link>
          <Link to="/cart" className="nav-item">Cart</Link>
          <Link to="/profile" className="nav-item">Profile</Link>
          <Link to="/login" className="nav-item">Login</Link>
          <Link to="/signup" className="nav-signup">Sign Up</Link>
        </div>

      </nav>
    </>
  );
}

export default NavBar;
