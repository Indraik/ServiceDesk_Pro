import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Navbar() {

    const { isAuthenticated, user, logout } = useAuth();

    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="navbar">

            <div className="navbar-brand">
                <Link to="/">
                    ServiceDesk Pro
                </Link>
            </div>

            <div className="navbar-links">

                {!isAuthenticated && (
                    <>
                        <Link to="/login">
                            Login
                        </Link>

                        <Link to="/register">
                            Register
                        </Link>
                    </>
                )}

                {isAuthenticated && user?.role === "CUSTOMER" && (
                    <>
                        <Link to="/customer/dashboard">
                            Dashboard
                        </Link>

                        <button onClick={handleLogout}>
                            Logout
                        </button>
                    </>
                )}

                {isAuthenticated && user?.role === "AGENT" && (
                    <>
                        <Link to="/agent/dashboard">
                            Dashboard
                        </Link>

                        <button onClick={handleLogout}>
                            Logout
                        </button>
                    </>
                )}

                {isAuthenticated && user?.role === "ADMIN" && (
                    <>
                        <Link to="/admin/dashboard">
                            Dashboard
                        </Link>

                        <button onClick={handleLogout}>
                            Logout
                        </button>
                    </>
                )}

            </div>

        </nav>
    );
}

export default Navbar;