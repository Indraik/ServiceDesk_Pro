import { useState, useEffect, useRef } from "react";
import {
    Link,
    NavLink,
    useLocation,
    useNavigate
} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../common/ThemeToggle";
import { RoleBadge } from "../common/Badge";
import {
    LayoutDashboard,
    Ticket,
    PlusCircle,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
    LogOut,
    User,
    Headphones,
    Shield,
    Sparkles,
    ChevronDown,
    Home as HomeIcon,
    ArrowRight,
    Search,
    Command,
    Users
} from "lucide-react";
import CommandPalette from "../common/CommandPalette";
import UserProfileModal from "../common/UserProfileModal";

const navigationByRole = {
    CUSTOMER: [
        {
            label: "Dashboard",
            path: "/customer/dashboard",
            icon: LayoutDashboard,
            end: true
        },
        {
            label: "My Tickets",
            path: "/customer/tickets",
            icon: Ticket
        },
        {
            label: "New Ticket",
            path: "/customer/tickets/new",
            icon: PlusCircle
        }
    ],
    AGENT: [
        {
            label: "Dashboard",
            path: "/agent/dashboard",
            icon: LayoutDashboard,
            end: true
        },
        {
            label: "Assigned Tickets",
            path: "/agent/tickets",
            icon: Ticket
        }
    ],
    ADMIN: [
        {
            label: "Dashboard",
            path: "/admin/dashboard",
            icon: LayoutDashboard,
            end: true
        },
        {
            label: "All Tickets",
            path: "/admin/tickets",
            icon: Ticket
        },
        {
            label: "User Management",
            path: "/admin/users",
            icon: Users
        }
    ]
};

function getBreadcrumbs(pathname) {
    if (pathname === "/") return [{ label: "Home", path: "/" }];
    if (pathname === "/login") return [{ label: "Login", path: "/login" }];
    if (pathname === "/register") return [{ label: "Register", path: "/register" }];

    const crumbs = [];

    if (pathname.startsWith("/customer")) {
        crumbs.push({ label: "Customer Portal", path: "/customer/dashboard" });
    } else if (pathname.startsWith("/agent")) {
        crumbs.push({ label: "Agent Workspace", path: "/agent/dashboard" });
    } else if (pathname.startsWith("/admin")) {
        crumbs.push({ label: "Admin Console", path: "/admin/dashboard" });
    }

    if (pathname.includes("/dashboard")) {
        crumbs.push({ label: "Dashboard" });
    } else if (pathname.includes("/tickets/new")) {
        crumbs.push({ label: "Tickets", path: pathname.replace("/new", "") });
        crumbs.push({ label: "Create Ticket" });
    } else if (pathname.includes("/users")) {
        crumbs.push({ label: "User Management" });
    } else if (/\/tickets\/\d+/.test(pathname)) {
        const ticketId = pathname.split("/").pop();
        crumbs.push({ label: "Tickets", path: pathname.substring(0, pathname.lastIndexOf("/")) });
        crumbs.push({ label: `#${ticketId}` });
    } else if (pathname.includes("/tickets")) {
        crumbs.push({ label: "Tickets" });
    }

    return crumbs;
}

export default function Navbar({ children }) {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [collapsed, setCollapsed] = useState(() => {
        return localStorage.getItem("sidebar_collapsed") === "true";
    });
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const userMenuRef = useRef(null);

    const isPublicPage = location.pathname === "/" || location.pathname === "/login" || location.pathname === "/register";

    // Global Ctrl+K / Cmd+K listener
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                setCommandPaletteOpen((prev) => !prev);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const toggleCollapsed = () => {
        setCollapsed((prev) => {
            const next = !prev;
            localStorage.setItem("sidebar_collapsed", String(next));
            return next;
        });
    };

    // Close user dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setUserDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close mobile sidebar on route change
    useEffect(() => {
        setMobileOpen(false);
        setUserDropdownOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        setUserDropdownOpen(false);
        logout();
        navigate("/login");
    };

    const role = user?.role;
    const navigation = navigationByRole[role] || [];
    const breadcrumbs = getBreadcrumbs(location.pathname);

    // Initial avatar letters
    const initials = (user?.name || user?.email || "U")
        .substring(0, 2)
        .toUpperCase();

    // If on public home/login/register, render public navbar + page content
    if (isPublicPage) {
        return (
            <div className="public-shell">
                <header className="public-header">
                    <div className="public-header-inner">
                        <Link to="/" className="brand-logo">
                            <div className="brand-icon-box">
                                <Headphones size={20} className="brand-icon" />
                            </div>
                            <span className="brand-name">
                                ServiceDesk <span className="brand-badge-pro">PRO</span>
                            </span>
                        </Link>

                        <div className="public-nav-actions">
                            <ThemeToggle />

                            {isAuthenticated ? (
                                <Link
                                    to={
                                        role === "ADMIN"
                                            ? "/admin/dashboard"
                                            : role === "AGENT"
                                            ? "/agent/dashboard"
                                            : "/customer/dashboard"
                                    }
                                    className="btn btn-primary btn-sm"
                                >
                                    <span>Go to Dashboard</span>
                                    <ArrowRight size={15} />
                                </Link>
                            ) : (
                                <div className="public-auth-links">
                                    <Link to="/login" className="btn btn-ghost btn-sm">
                                        Log In
                                    </Link>
                                    <Link to="/register" className="btn btn-primary btn-sm">
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="public-content">
                    {children}
                </main>
            </div>
        );
    }

    // Authenticated App Shell with Collapsible Sidebar & Top Action Bar
    return (
        <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
            {/* Mobile Backdrop */}
            {mobileOpen && (
                <div
                    className="mobile-backdrop"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Collapsible Sidebar */}
            <aside className={`app-sidebar ${mobileOpen ? "mobile-open" : ""}`}>
                <div className="sidebar-header">
                    <Link to="/" className="brand-logo">
                        <div className="brand-icon-box">
                            <Headphones size={18} className="brand-icon" />
                        </div>
                        {!collapsed && (
                            <div className="brand-info">
                                <span className="brand-name">
                                    ServiceDesk <span className="brand-badge-pro">PRO</span>
                                </span>
                                <span className="brand-role-caption">
                                    {role === "ADMIN" ? "Admin Console" : role === "AGENT" ? "Agent Workspace" : "Customer Portal"}
                                </span>
                            </div>
                        )}
                    </Link>

                    <button
                        type="button"
                        className="sidebar-close-mobile"
                        onClick={() => setMobileOpen(false)}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Sidebar Navigation */}
                <div className="sidebar-nav-container">
                    {!collapsed && (
                        <div className="nav-group-title">MAIN NAVIGATION</div>
                    )}
                    <nav className="sidebar-nav">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.end}
                                    className={({ isActive }) =>
                                        `sidebar-nav-item ${isActive ? "active" : ""}`
                                    }
                                    title={collapsed ? item.label : undefined}
                                >
                                    <Icon size={18} className="nav-item-icon" />
                                    {!collapsed && (
                                        <span className="nav-item-label">{item.label}</span>
                                    )}
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>

                {/* Sidebar Footer */}
                <div className="sidebar-footer">
                    <button
                        type="button"
                        className="sidebar-collapse-toggle desktop-only"
                        onClick={toggleCollapsed}
                        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {collapsed ? <ChevronRight size={16} /> : (
                            <>
                                <ChevronLeft size={16} />
                                <span>Collapse Sidebar</span>
                            </>
                        )}
                    </button>

                    <div
                        className="sidebar-user-mini clickable"
                        onClick={() => setProfileModalOpen(true)}
                        role="button"
                        tabIndex={0}
                        title="View profile & settings"
                    >
                        <div className="user-avatar-mini" title={user?.name || user?.email}>
                            {initials}
                        </div>
                        {!collapsed && (
                            <div className="user-info-mini">
                                <span className="user-name-mini">{user?.name || "User"}</span>
                                <RoleBadge role={role} />
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Application Area */}
            <div className="app-main-area">
                {/* Top Header */}
                <header className="app-topbar">
                    <div className="topbar-left">
                        <button
                            type="button"
                            className="mobile-menu-btn"
                            onClick={() => setMobileOpen(true)}
                            aria-label="Open navigation menu"
                        >
                            <Menu size={20} />
                        </button>

                        <button
                            type="button"
                            className="desktop-collapse-btn"
                            onClick={toggleCollapsed}
                            aria-label="Toggle sidebar"
                            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                        >
                            <Menu size={18} />
                        </button>

                        {/* Breadcrumbs */}
                        <nav className="topbar-breadcrumbs" aria-label="Breadcrumb">
                            <Link to="/" className="breadcrumb-item breadcrumb-home" title="Home">
                                <HomeIcon size={14} />
                            </Link>
                            {breadcrumbs.map((crumb, idx) => (
                                <span key={idx} className="breadcrumb-wrapper">
                                    <span className="breadcrumb-separator">/</span>
                                    {crumb.path ? (
                                        <Link to={crumb.path} className="breadcrumb-item">
                                            {crumb.label}
                                        </Link>
                                    ) : (
                                        <span className="breadcrumb-item current">{crumb.label}</span>
                                    )}
                                </span>
                            ))}
                        </nav>
                    </div>

                    <div className="topbar-right">
                        {/* Command Palette Trigger */}
                        <button
                            type="button"
                            className="topbar-search-trigger"
                            onClick={() => setCommandPaletteOpen(true)}
                            title="Open Command Palette (Ctrl+K)"
                            aria-label="Open Command Palette"
                        >
                            <Search size={14} className="trigger-search-icon" />
                            <span className="trigger-text">Search or action...</span>
                            <span className="trigger-kbd-badge">Ctrl K</span>
                        </button>

                        {/* Theme Switcher */}
                        <ThemeToggle />

                        {/* User Profile Dropdown */}
                        <div className="user-menu-wrapper" ref={userMenuRef}>
                            <button
                                type="button"
                                className={`user-menu-btn ${userDropdownOpen ? "open" : ""}`}
                                onClick={() => setUserDropdownOpen((prev) => !prev)}
                            >
                                <div className="user-avatar">
                                    {initials}
                                </div>
                                <div className="user-meta-header">
                                    <span className="user-display-name">{user?.name || "My Account"}</span>
                                    <span className="user-role-label">{role}</span>
                                </div>
                                <ChevronDown size={14} className="user-dropdown-arrow" />
                            </button>

                            {userDropdownOpen && (
                                <div className="user-dropdown-menu">
                                    <div className="dropdown-user-header">
                                        <p className="dropdown-name">{user?.name}</p>
                                        <p className="dropdown-email">{user?.email}</p>
                                        <div className="dropdown-role-tag">
                                            <RoleBadge role={role} />
                                        </div>
                                    </div>
                                    <div className="dropdown-divider" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setUserDropdownOpen(false);
                                            setProfileModalOpen(true);
                                        }}
                                        className="dropdown-item"
                                    >
                                        <User size={16} />
                                        <span>Profile & Settings</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="dropdown-item dropdown-logout-btn"
                                    >
                                        <LogOut size={16} />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Command Palette Modal */}
                <CommandPalette
                    isOpen={commandPaletteOpen}
                    onClose={() => setCommandPaletteOpen(false)}
                />

                {/* User Profile Modal */}
                <UserProfileModal
                    isOpen={profileModalOpen}
                    onClose={() => setProfileModalOpen(false)}
                />

                {/* Page Content */}
                <main className="app-page-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
