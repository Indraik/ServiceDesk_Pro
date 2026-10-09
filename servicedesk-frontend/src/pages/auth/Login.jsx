import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const { login } = useAuth();

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {

            const response = await api.post("/auth/login", {
                email,
                password
            });

            login(
                response.data.token,
                response.data.user
            );

            const role = response.data.user.role;

            if (role === "CUSTOMER") {
                navigate("/customer/dashboard");
            } else if (role === "AGENT") {
                navigate("/agent/dashboard");
            } else if (role === "ADMIN") {
                navigate("/admin/dashboard");
            } else {
                navigate("/");
            }

        } catch (error) {

            console.error(error);

            if (error.response) {
                setError(
                    error.response.data.message ||
                    "Login failed"
                );
            } else {
                setError("Unable to connect to server");
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">

            <div className="auth-card">

                <h2>Login</h2>

                {error && (
                    <p className="error-message">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Email</label>

                        <input
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>

                        <input
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                <p className="auth-link">
                    Don't have an account?{" "}
                    <Link to="/register">
                        Register
                    </Link>
                </p>

            </div>

        </div>
    );
}

export default Login;