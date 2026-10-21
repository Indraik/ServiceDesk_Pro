import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
    Headphones,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    AlertCircle,
    CheckCircle2,
    Shield,
    Sparkles,
    Clock
} from "lucide-react";

export default function Login() {
    const [searchParams] = useSearchParams();
    const isSessionExpired = searchParams.get("sessionExpired") === "true";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
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
                email: email.trim(),
                password
            });

            login(response.data.token, response.data.user);

            const role = response.data.user?.role;
            if (role === "CUSTOMER") {
                navigate("/customer/dashboard");
            } else if (role === "AGENT") {
                navigate("/agent/dashboard");
            } else if (role === "ADMIN") {
                navigate("/admin/dashboard");
            } else {
                navigate("/");
            }
        } catch (err) {
            console.error(err);
            if (err.response) {
                setError(
                    err.response.data?.message ||
                    "Invalid email or password. Please try again."
                );
            } else {
                setError("Unable to connect to server. Ensure backend is running.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page-wrapper">
            <div className="auth-split-layout">
                {/* Left Brand Showcase */}
                <div className="auth-brand-panel">
                    <div className="auth-panel-glow" />
                    <div className="auth-brand-content">
                        <Link to="/" className="auth-brand-logo">
                            <div className="brand-icon-box">
                                <Headphones size={22} className="brand-icon" />
                            </div>
                            <span className="brand-name">
                                ServiceDesk <span className="brand-badge-pro">PRO</span>
                            </span>
                        </Link>

                        <div className="auth-showcase-text">
                            <h2>Enterprise IT Support & Ticket Resolution</h2>
                            <p>
                                Access your centralized workspace to create tickets, track real-time resolution SLAs,
                                and collaborate seamlessly across support tiers.
                            </p>
                        </div>

                        <div className="auth-features-list">
                            <div className="auth-feature-row">
                                <div className="feature-dot"><CheckCircle2 size={16} /></div>
                                <span>Stateless JWT session security & BCrypt encrypted data</span>
                            </div>
                            <div className="auth-feature-row">
                                <div className="feature-dot"><CheckCircle2 size={16} /></div>
                                <span>Multi-role access for Customers, Support Agents & Admins</span>
                            </div>
                            <div className="auth-feature-row">
                                <div className="feature-dot"><CheckCircle2 size={16} /></div>
                                <span>Auditable state transitions and ticket activity logs</span>
                            </div>
                        </div>

                        <div className="auth-panel-footer">
                            <p className="auth-security-note">
                                <Shield size={14} /> Powered by Spring Boot 4 & PostgreSQL
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Form Card */}
                <div className="auth-form-panel">
                    <div className="auth-card-box">
                        <div className="auth-card-header">
                            <h1 className="auth-title">Welcome back</h1>
                            <p className="auth-subtitle">Please enter your credentials to sign in</p>
                        </div>

                        {isSessionExpired && !error && (
                            <div className="auth-error-banner session-expired-notice" role="alert">
                                <Clock size={18} className="text-warning" />
                                <span>Your session expired for security. Please sign in to resume.</span>
                            </div>
                        )}

                        {error && (
                            <div className="auth-error-banner" role="alert">
                                <AlertCircle size={18} className="error-icon" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label className="form-label" htmlFor="login-email">
                                    Email Address
                                </label>
                                <div className="input-with-icon">
                                    <Mail size={18} className="field-icon" />
                                    <input
                                        id="login-email"
                                        type="email"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="form-control"
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="form-label-row">
                                    <label className="form-label" htmlFor="login-password">
                                        Password
                                    </label>
                                </div>
                                <div className="input-with-icon">
                                    <Lock size={18} className="field-icon" />
                                    <input
                                        id="login-password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="form-control password-input"
                                        required
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="password-toggle-btn"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-block btn-lg"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="btn-spinner-text">
                                        <span className="spinner" /> Signing in...
                                    </span>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="auth-card-footer">
                            <p className="auth-switch-text">
                                Don't have an account yet?{" "}
                                <Link to="/register" className="auth-switch-link">
                                    Create Account
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}