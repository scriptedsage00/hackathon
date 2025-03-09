import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import "./Navbar.css"; 

export default function Navigation() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    return (
        <div className="navbar">
            {/* Left Section */}
            <div className="nav-left">
                <button onClick={() => navigate(-1)}>Back</button>
                <button onClick={() => navigate(1)}>Next</button>
                <Link to="/">
                    <button>Home</button>
                </Link>
                <Link to="/selection">  
                    <button>Selection Page</button>  {/* ✅ Added Selection Page Button */}
                </Link>
            </div>

            {/* Right Section */}
            <div className="nav-right">
                {user ? (
                    <button onClick={logout}>Logout</button>
                ) : (
                    <>
                        <Link to="/register">
                            <button>Register</button>
                        </Link>
                        <Link to="/login">
                            <button>Login</button>
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
