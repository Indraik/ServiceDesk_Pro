import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
    Headphones,
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    AlertCircle,
    CheckCircle2,
    Shield
} from "lucide-react";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            await api.post("/auth/register", {
                name: name.trim(),
                email: email.trim(),
                password
            });

            navigate("/login?registered=true");
        } catch (err) {
            console.error(err);
            if (err.response) {
                setError(
                    err.response.data?.message ||
                    "Registration failed. Email might already be taken."
                );
            } else {
                setError("Unable to connect to server. Please try again later.");
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
                            <h2>Join ServiceDesk Pro</h2>
                            <p>
                                Set up your customer account to raise support tickets, communicate directly with technical
                                specialists, and receive timely resolutions.
                            </p>
                        </div>

                        <div className="auth-features-list">
                            <div className="auth-feature-row">
                                <div className="feature-dot"><CheckCircle2 size={16} /></div>
                                <span>Default access with Customer role for end-user support</span>
                            </div>
                            <div className="auth-feature-row">
                                <div className="feature-dot"><CheckCircle2 size={16} /></div>
                                <span>Track your issues with real-time status notifications</span>
                            </div>
                            <div className="auth-feature-row">
                                <div className="feature-dot"><CheckCircle2 size={16} /></div>
                                <span>Full control to confirm resolution and close tickets</span>
                            </div>
                        </div>

                        <div className="auth-panel-footer">
                            <p className="auth-security-note">
                                <Shield size={14} /> Enterprise-grade security & privacy guaranteed
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Form Card */}
                <div className="auth-form-panel">
                    <div className="auth-card-box">
                        <div className="auth-card-header">
                            <h1 className="auth-title">Create an Account</h1>
                            <p className="auth-subtitle">Get started with your IT support portal</p>
                        </div>

                        {error && (
                            <div className="auth-error-banner" role="alert">
                                <AlertCircle size={18} className="error-icon" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label className="form-label" htmlFor="register-name">
                                    Full Name
                                </label>
                                <div className="input-with-icon">
                                    <User size={18} className="field-icon" />
                                    <input
                                        id="register-name"
                                        type="text"
                                        placeholder="Alex Johnson"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="form-control"
                                        required
                                        autoComplete="name"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="register-email">
                                    Email Address
                                </label>
                                <div className="input-with-icon">
                                    <Mail size={18} className="field-icon" />
                                    <input
                                        id="register-email"
                                        type="email"
                                        placeholder="alex@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="form-control"
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="register-password">
                                    Password
                                </label>
                                <div className="input-with-icon">
                                    <Lock size={18} className="field-icon" />
                                    <input
                                        id="register-password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="At least 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="form-control password-input"
                                        required
                                        minLength={6}
                                        autoComplete="new-password"
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
                                        <span className="spinner" /> Creating account...
                                    </span>
                                ) : (
                                    <>
                                        <span>Create Account</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="auth-card-footer">
                            <p className="auth-switch-text">
                                Already have an account?{" "}
                                <Link to="/login" className="auth-switch-link">
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}