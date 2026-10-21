import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { getTickets } from "../../services/ticketService";
import {
    Search,
    LayoutDashboard,
    Ticket,
    PlusCircle,
    Sun,
    Moon,
    LogOut,
    ArrowRight,
    Command,
    X,
    Clock,
    Flame,
    Users
} from "lucide-react";

export default function CommandPalette({ isOpen, onClose }) {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const inputRef = useRef(null);

    const role = user?.role;

    // Define commands based on role
    const defaultCommands = [
        {
            id: "nav-dash",
            title: "Go to Dashboard",
            category: "Navigation",
            icon: LayoutDashboard,
            action: () => {
                if (role === "ADMIN") navigate("/admin/dashboard");
                else if (role === "AGENT") navigate("/agent/dashboard");
                else navigate("/customer/dashboard");
            }
        },
        {
            id: "nav-tickets",
            title: "View All Tickets",
            category: "Navigation",
            icon: Ticket,
            action: () => {
                if (role === "ADMIN") navigate("/admin/tickets");
                else if (role === "AGENT") navigate("/agent/tickets");
                else navigate("/customer/tickets");
            }
        },
        ...(role === "CUSTOMER"
            ? [
                  {
                      id: "action-new-ticket",
                      title: "Create New Support Ticket",
                      category: "Actions",
                      icon: PlusCircle,
                      action: () => navigate("/customer/tickets/new")
                  }
              ]
            : []),
        ...(role === "ADMIN"
            ? [
                  {
                      id: "nav-users",
                      title: "Manage Users & Role Assignment",
                      category: "Administration",
                      icon: Users,
                      action: () => navigate("/admin/users")
                  },
                  {
                      id: "filter-open",
                      title: "Filter Unassigned / Open Tickets",
                      category: "Quick Filters",
                      icon: Clock,
                      action: () => navigate("/admin/tickets?status=OPEN")
                  }
              ]
            : []),
        {
            id: "theme-toggle",
            title: isDark ? "Switch to Light Mode" : "Switch to Dark Mode",
            category: "Preferences",
            icon: isDark ? Sun : Moon,
            action: () => toggleTheme()
        },
        {
            id: "auth-logout",
            title: "Sign Out",
            category: "Account",
            icon: LogOut,
            action: () => {
                logout();
                navigate("/login");
            }
        }
    ];

    // Filtered static commands
    const filteredCommands = defaultCommands.filter((cmd) =>
        cmd.title.toLowerCase().includes(query.toLowerCase())
    );

    // Live search tickets if user types
    useEffect(() => {
        if (!query.trim() || query.length < 2) {
            setSearchResults([]);
            return;
        }

        let active = true;
        const debounceTimer = setTimeout(async () => {
            try {
                setSearching(true);
                const data = await getTickets({
                    search: query.trim(),
                    size: 5
                });
                if (active) {
                    setSearchResults(data.content || []);
                }
            } catch (err) {
                console.error("Command palette search failed", err);
            } finally {
                if (active) setSearching(false);
            }
        }, 250);

        return () => {
            active = false;
            clearTimeout(debounceTimer);
        };
    }, [query]);

    // Combined items for keyboard navigation
    const allItems = [
        ...filteredCommands.map((c) => ({ type: "command", data: c })),
        ...searchResults.map((t) => ({ type: "ticket", data: t }))
    ];

    // Auto-focus input when opened
    useEffect(() => {
        if (isOpen) {
            setQuery("");
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Keyboard navigation (Arrow keys, Enter, Esc)
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose();
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % (allItems.length || 1));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + (allItems.length || 1)) % (allItems.length || 1));
            } else if (e.key === "Enter") {
                e.preventDefault();
                const selected = allItems[selectedIndex];
                if (selected) {
                    executeItem(selected);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, selectedIndex, allItems]);

    const executeItem = (item) => {
        onClose();
        if (item.type === "command") {
            item.data.action();
        } else if (item.type === "ticket") {
            const ticket = item.data;
            if (role === "ADMIN") navigate(`/admin/tickets/${ticket.id}`);
            else if (role === "AGENT") navigate(`/agent/tickets/${ticket.id}`);
            else navigate(`/customer/tickets/${ticket.id}`);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="command-palette-backdrop" onClick={onClose}>
            <div
                className="command-palette-box"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                {/* Search Header */}
                <div className="command-search-header">
                    <Search size={18} className="command-search-icon" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Type a command or search tickets (e.g. #102, VPN)..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        className="command-search-input"
                    />
                    <span className="command-esc-badge">ESC</span>
                </div>

                {/* Results List */}
                <div className="command-results-list">
                    {/* Live Ticket Search Results */}
                    {searchResults.length > 0 && (
                        <div className="command-group">
                            <span className="command-group-heading">Matching Tickets</span>
                            {searchResults.map((t, idx) => {
                                const itemIndex = filteredCommands.length + idx;
                                const isSelected = selectedIndex === itemIndex;
                                return (
                                    <div
                                        key={t.id}
                                        className={`command-item ${isSelected ? "selected" : ""}`}
                                        onClick={() => executeItem({ type: "ticket", data: t })}
                                        onMouseEnter={() => setSelectedIndex(itemIndex)}
                                    >
                                        <div className="command-item-left">
                                            <span className="id-badge">#{t.id}</span>
                                            <span className="command-item-title">{t.title}</span>
                                        </div>
                                        <div className="command-item-right">
                                            <span className="command-ticket-status">{t.status}</span>
                                            <ArrowRight size={14} className="command-arrow" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Commands */}
                    {filteredCommands.length > 0 && (
                        <div className="command-group">
                            <span className="command-group-heading">Quick Actions</span>
                            {filteredCommands.map((cmd, idx) => {
                                const isSelected = selectedIndex === idx;
                                const Icon = cmd.icon;
                                return (
                                    <div
                                        key={cmd.id}
                                        className={`command-item ${isSelected ? "selected" : ""}`}
                                        onClick={() => executeItem({ type: "command", data: cmd })}
                                        onMouseEnter={() => setSelectedIndex(idx)}
                                    >
                                        <div className="command-item-left">
                                            <div className="command-icon-box">
                                                <Icon size={16} />
                                            </div>
                                            <span className="command-item-title">{cmd.title}</span>
                                        </div>
                                        <div className="command-item-right">
                                            <span className="command-category-tag">{cmd.category}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {allItems.length === 0 && (
                        <div className="command-empty-state">
                            <p>No matching commands or tickets found for "{query}"</p>
                        </div>
                    )}
                </div>

                {/* Footer Bar */}
                <div className="command-palette-footer">
                    <span>Use <kbd>↑</kbd> <kbd>↓</kbd> to navigate</span>
                    <span><kbd>Enter</kbd> to select</span>
                    <span><kbd>Esc</kbd> to dismiss</span>
                </div>
            </div>
        </div>
    );
}
