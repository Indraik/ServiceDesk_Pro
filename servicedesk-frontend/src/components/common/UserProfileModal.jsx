import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { RoleBadge } from "./Badge";
import {
    X,
    User,
    Mail,
    Shield,
    Sun,
    Moon,
    RefreshCw,
    Command,
    LogOut,
    CheckCircle2,
    Calendar,
    Key
} from "lucide-react";

export default function UserProfileModal({ isOpen, onClose }) {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const toast = useToast();

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const initials = (user?.name || user?.email || "U")
        .substring(0, 2)
        .toUpperCase();

    const handleLogout = () => {
        onClose();
        logout();
        window.location.href = "/login";
    };

    return (
        <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
            <div
                className="user-profile-modal-box"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="profile-modal-header">
                    <div className="profile-header-user">
                        <div className="profile-avatar-lg">
                            {initials}
                        </div>
                        <div className="profile-header-details">
                            <h2 className="profile-user-name">{user?.name || "Support User"}</h2>
                            <p className="profile-user-email">{user?.email}</p>
                            <div className="profile-role-row">
                                <RoleBadge role={user?.role} />
                                <span className="profile-status-pill">
                                    <span className="live-pulse-dot" />
                                    Active Session
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="modal-close-icon-btn"
                        onClick={onClose}
                        aria-label="Close Profile"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="profile-modal-body">
                    {/* Account Details Section */}
                    <div className="profile-section">
                        <h4 className="profile-section-title">
                            <User size={14} />
                            <span>Account Details</span>
                        </h4>
                        <div className="profile-details-grid">
                            <div className="profile-detail-card">
                                <span className="detail-label">User ID</span>
                                <span className="detail-value font-mono">#{user?.id || "N/A"}</span>
                            </div>
                            <div className="profile-detail-card">
                                <span className="detail-label">Assigned Role</span>
                                <span className="detail-value font-semibold">{user?.role || "CUSTOMER"}</span>
                            </div>
                            <div className="profile-detail-card">
                                <span className="detail-label">Email Verified</span>
                                <span className="detail-value text-success flex-center-gap">
                                    <CheckCircle2 size={13} /> Yes
                                </span>
                            </div>
                            <div className="profile-detail-card">
                                <span className="detail-label">Security Tier</span>
                                <span className="detail-value text-accent">Enterprise RBAC</span>
                            </div>
                        </div>
                    </div>

                    {/* Preferences Section */}
                    <div className="profile-section">
                        <h4 className="profile-section-title">
                            <Sun size={14} />
                            <span>Interface Preferences</span>
                        </h4>
                        <div className="profile-pref-row">
                            <div className="pref-info">
                                <span className="pref-name">Appearance Theme</span>
                                <span className="pref-sub">Select your preferred color scheme</span>
                            </div>
                            <div className="theme-toggle-pills">
                                <button
                                    type="button"
                                    className={`theme-pill ${theme === "light" ? "active" : ""}`}
                                    onClick={() => setTheme("light")}
                                >
                                    <Sun size={14} />
                                    <span>Light</span>
                                </button>
                                <button
                                    type="button"
                                    className={`theme-pill ${theme === "dark" ? "active" : ""}`}
                                    onClick={() => setTheme("dark")}
                                >
                                    <Moon size={14} />
                                    <span>Dark</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Shortcuts Cheat Sheet */}
                    <div className="profile-section">
                        <h4 className="profile-section-title">
                            <Command size={14} />
                            <span>Quick Shortcuts</span>
                        </h4>
                        <div className="shortcut-pills-row">
                            <div className="shortcut-item">
                                <kbd>Ctrl</kbd> + <kbd>K</kbd>
                                <span>Command Palette</span>
                            </div>
                            <div className="shortcut-item">
                                <kbd>Esc</kbd>
                                <span>Close Modals / Overlays</span>
                            </div>
                            <div className="shortcut-item">
                                <kbd>F5</kbd>
                                <span>Refresh Data</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="profile-modal-footer">
                    <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={handleLogout}
                    >
                        <LogOut size={15} />
                        <span>Sign Out</span>
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                            if (toast?.success) {
                                toast.success("Preferences saved successfully!");
                            }
                            onClose();
                        }}
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
