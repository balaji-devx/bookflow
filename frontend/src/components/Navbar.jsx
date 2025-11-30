import React, { useState, useEffect } from 'react'; // 👈 Import useState and useEffect
import { Link, useNavigate } from "react-router-dom"; // 👈 Import useNavigate
import logo from '../assets/logo.png';
import '../pages/css/App.css';

function NavBar() {
    const navigate = useNavigate();
    // 🎯 NEW STATE: Tracks user's login status and search input
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // --- 1. CHECK LOGIN STATUS ---
    useEffect(() => {
        // Check for the presence of the authentication token
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token); 
    }, []); // Run only once on mount

    // --- Logout Handler ---
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole'); // Clear all auth data
        setIsLoggedIn(false);
        navigate('/login'); // Redirect to login page
    };

    // --- 2. SEARCH HANDLER ---
    const handleSearch = (e) => {
        // This is where you would call an API or filter results in a real app.
        if (e.key === 'Enter' || e.type === 'click') {
            if (searchTerm.trim()) {
                // Navigate to a search results page with the query parameter
                navigate(`/shop?q=${encodeURIComponent(searchTerm.trim())}`);
                // Clear the search bar after navigation
                setSearchTerm('');
            }
        }
    };

    return (
        <>
            <nav className="nav-container">
                {/* Left: Logo */}
                <div className="nav-left">
                    <Link to="/" className="nav-logo">
                        <img className="logo-img" src={logo} alt="BookFlow Logo" />
                    </Link>
                </div>

                {/* Middle: Search Bar */}
                <div className="nav-middle">
                    <input
                        type="text"
                        className="nav-search"
                        placeholder="Search for books..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleSearch} // Trigger search on Enter key
                    />
                    <button onClick={handleSearch} className="nav-search-btn" aria-label="Search">
                        {/* Example Search Icon (Use your own icon/SVG) */}
                        🔍
                    </button>
                </div>

                {/* Right: Icons + Auth Links */}
                <div className="nav-right">
                    <Link to="/shop" className="nav-item">Shop</Link>
                    <Link to="/cart" className="nav-item">Cart</Link>
                    
                    {isLoggedIn ? (
                        <>
                            <Link to="/profile" className="nav-item">Profile</Link>
                            <button 
                                onClick={handleLogout} 
                                className="nav-signup nav-logout-btn" // Use the signup style for logout button
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-item">Login</Link>
                            <Link to="/signup" className="nav-signup">Sign Up</Link>
                        </>
                    )}
                </div>

            </nav>
        </>
    );
}

export default NavBar;