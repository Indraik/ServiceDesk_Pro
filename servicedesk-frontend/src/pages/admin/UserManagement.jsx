import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getUsers, updateUserRole } from "../../services/userService";
import { RoleBadge } from "../../components/common/Badge";
import { TableSkeleton } from "../../components/common/Skeleton";
import {
    Users,
    Search,
    X,
    Shield,
    Headphones,
    User,
    RefreshCw,
    AlertCircle,
    Check,
    Lock,
    UserCheck,
    Filter
} from "lucide-react";

export default function UserManagement() {
    const { user: currentUser } = useAuth();
    const { success, error, confirm } = useToast();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    
    // Track pending role selections per user: { [userId]: selectedRole }
    const [pendingRoles, setPendingRoles] = useState({});
    // Track saving state per user: { [userId]: boolean }
    const [savingUserId, setSavingUserId] = useState(null);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setFetchError("");
            const data = await getUsers();
            setUsers(data || []);
            // Initialize pending roles to current roles
            const initialPending = {};
            (data || []).forEach((u) => {
                initialPending[u.id] = u.role;
            });
            setPendingRoles(initialPending);
        } catch (err) {
            console.error("Failed to load users:", err);
            setFetchError(
                err.response?.data?.message ||
                "Failed to fetch user list. Please verify admin privileges."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    // Filtered users by search query and role filter
    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            const matchesSearch =
                !searchQuery.trim() ||
                (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase().trim())) ||
                (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase().trim()));

            const matchesRole = !roleFilter || u.role === roleFilter;

            return matchesSearch && matchesRole;
        });
    }, [users, searchQuery, roleFilter]);

    // Role counts for header stats
    const stats = useMemo(() => {
        const total = users.length;
        const admins = users.filter((u) => u.role === "ADMIN").length;
        const agents = users.filter((u) => u.role === "AGENT").length;
        const customers = users.filter((u) => u.role === "CUSTOMER").length;
        return { total, admins, agents, customers };
    }, [users]);

    const handleRoleSelect = (userId, newRole) => {
        setPendingRoles((prev) => ({
            ...prev,
            [userId]: newRole
        }));
    };

    const handleSaveRole = async (targetUser) => {
        const targetUserId = targetUser.id;
        const newRole = pendingRoles[targetUserId];

        // Guard: role unchanged
        if (!newRole || newRole === targetUser.role) {
            return;
        }

        // Guard: Self-modification attempt
        if (targetUser.email?.toLowerCase() === currentUser?.email?.toLowerCase()) {
            error("Administrators cannot change their own role.");
            setPendingRoles((prev) => ({ ...prev, [targetUserId]: targetUser.role }));
            return;
        }

        // Guard: Last Admin check
        if (targetUser.role === "ADMIN" && newRole !== "ADMIN" && stats.admins <= 1) {
            error("Cannot demote the last administrator. At least one administrator is required.");
            setPendingRoles((prev) => ({ ...prev, [targetUserId]: targetUser.role }));
            return;
        }

        // Prompt confirmation
        const confirmed = await confirm({
            title: "Confirm Role Change",
            message: `Are you sure you want to change the role for ${targetUser.name} (${targetUser.email}) from ${targetUser.role} to ${newRole}?`,
            confirmText: `Change to ${newRole}`,
            cancelText: "Cancel",
            type: "warning"
        });

        if (!confirmed) {
            // Revert pending selection
            setPendingRoles((prev) => ({
                ...prev,
                [targetUserId]: targetUser.role
            }));
            return;
        }

        try {
            setSavingUserId(targetUserId);
            await updateUserRole(targetUserId, newRole);
            success(`Successfully changed role for ${targetUser.name} to ${newRole}.`);
            await loadUsers();
        } catch (err) {
            console.error("Failed to update role:", err);
            error(
                err.response?.data?.message ||
                "Failed to update user role. Please try again."
            );
            // Revert pending selection
            setPendingRoles((prev) => ({
                ...prev,
                [targetUserId]: targetUser.role
            }));
        } finally {
            setSavingUserId(null);
        }
    };

    const clearFilters = () => {
        setSearchQuery("");
        setRoleFilter("");
    };

    return (
        <div className="user-management-page">
            {/* Page Header */}
            <div className="page-header-block">
                <div className="page-header-title-wrap">
                    <div className="page-header-badge">
                        <Users size={16} />
                        <span>System Administration</span>
                    </div>
                    <h1 className="page-title">User Management</h1>
                    <p className="page-subtitle">
                        View registered accounts, verify credentials, and manage role permissions across the organization.
                    </p>
                </div>
                <div className="page-header-actions">
                    <button
                        type="button"
                        onClick={loadUsers}
                        className="btn btn-secondary btn-sm"
                        disabled={loading}
                        title="Refresh user list"
                    >
                        <RefreshCw size={15} className={loading ? "spin" : ""} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Quick Stat Cards */}
            <div className="user-stats-grid">
                <div className="user-stat-card">
                    <div className="user-stat-icon icon-total">
                        <Users size={20} />
                    </div>
                    <div className="user-stat-meta">
                        <span className="user-stat-num">{stats.total}</span>
                        <span className="user-stat-lbl">Total Registered Users</span>
                    </div>
                </div>

                <div className="user-stat-card">
                    <div className="user-stat-icon icon-admin">
                        <Shield size={20} />
                    </div>
                    <div className="user-stat-meta">
                        <span className="user-stat-num">{stats.admins}</span>
                        <span className="user-stat-lbl">Administrators</span>
                    </div>
                </div>

                <div className="user-stat-card">
                    <div className="user-stat-icon icon-agent">
                        <Headphones size={20} />
                    </div>
                    <div className="user-stat-meta">
                        <span className="user-stat-num">{stats.agents}</span>
                        <span className="user-stat-lbl">Support Agents</span>
                    </div>
                </div>

                <div className="user-stat-card">
                    <div className="user-stat-icon icon-customer">
                        <User size={20} />
                    </div>
                    <div className="user-stat-meta">
                        <span className="user-stat-num">{stats.customers}</span>
                        <span className="user-stat-lbl">Customers</span>
                    </div>
                </div>
            </div>

            {/* Search and Filters Card */}
            <div className="filter-card">
                <div className="search-form-row">
                    <div className="search-input-wrapper">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by user name or email address..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input-field"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                className="search-clear-btn"
                                onClick={() => setSearchQuery("")}
                                title="Clear search"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <div className="dropdown-filters-group">
                        <div className="filter-select-wrapper">
                            <Filter size={15} className="filter-select-icon" />
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="filter-select"
                                aria-label="Filter by role"
                            >
                                <option value="">All Roles</option>
                                <option value="ADMIN">Administrators</option>
                                <option value="AGENT">Agents</option>
                                <option value="CUSTOMER">Customers</option>
                            </select>
                        </div>

                        {(searchQuery || roleFilter) && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="btn btn-ghost btn-sm"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Error Banner */}
            {fetchError && (
                <div className="dashboard-error-banner" role="alert">
                    <AlertCircle size={18} />
                    <span>{fetchError}</span>
                </div>
            )}

            {/* Users Table */}
            {loading ? (
                <div className="table-responsive-container">
                    <TableSkeleton rows={5} cols={5} />
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="empty-state-view">
                    <div className="empty-icon-wrap">
                        <Users size={32} />
                    </div>
                    <h3>No users found</h3>
                    <p>
                        {searchQuery || roleFilter
                            ? "No users match your search and filter criteria."
                            : "There are currently no registered users in the database."}
                    </p>
                    {(searchQuery || roleFilter) && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="btn btn-secondary btn-sm"
                        >
                            Reset Search & Filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="table-responsive-container">
                    <table className="modern-data-table users-management-table">
                        <thead>
                            <tr>
                                <th style={{ width: "90px" }}>User ID</th>
                                <th>Name & Profile</th>
                                <th>Email Address</th>
                                <th style={{ width: "140px" }}>Current Role</th>
                                <th style={{ width: "220px" }}>Assign Role</th>
                                <th style={{ width: "110px", textAlign: "right" }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((u) => {
                                const isSelf = u.email?.toLowerCase() === currentUser?.email?.toLowerCase();
                                const isOnlyAdmin = u.role === "ADMIN" && stats.admins <= 1;
                                const selectedRole = pendingRoles[u.id] || u.role;
                                const hasChanged = selectedRole !== u.role;
                                const isSaving = savingUserId === u.id;
                                const initials = (u.name || u.email || "U").substring(0, 2).toUpperCase();

                                return (
                                    <tr key={u.id} className={`data-row ${isSelf ? "current-user-row" : ""}`}>
                                        {/* User ID */}
                                        <td className="cell-id">
                                            <span className="id-badge">#{u.id}</span>
                                        </td>

                                        {/* Name & Avatar */}
                                        <td>
                                            <div className="user-cell-meta">
                                                <div className="user-table-avatar" title={u.name}>
                                                    {initials}
                                                </div>
                                                <div className="user-table-info">
                                                    <div className="user-name-line">
                                                        <span className="user-table-name">{u.name}</span>
                                                        {isSelf && (
                                                            <span className="self-tag-badge" title="Your account">
                                                                (You)
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Email Address */}
                                        <td>
                                            <span className="user-table-email">{u.email}</span>
                                        </td>

                                        {/* Current Role */}
                                        <td>
                                            <RoleBadge role={u.role} />
                                        </td>

                                        {/* Assign Role Dropdown */}
                                        <td>
                                            {isSelf ? (
                                                <div className="role-locked-pill" title="You cannot modify your own role">
                                                    <Lock size={13} />
                                                    <span>Self-Locked</span>
                                                </div>
                                            ) : (
                                                <select
                                                    value={selectedRole}
                                                    onChange={(e) => handleRoleSelect(u.id, e.target.value)}
                                                    disabled={isSaving}
                                                    className="role-selector-select"
                                                    aria-label={`Select role for ${u.name}`}
                                                >
                                                    <option value="CUSTOMER">Customer</option>
                                                    <option value="AGENT">Agent</option>
                                                    <option value="ADMIN">Admin</option>
                                                </select>
                                            )}
                                            {!isSelf && isOnlyAdmin && (
                                                <span className="last-admin-note" title="Last admin cannot be demoted">
                                                    Sole Admin
                                                </span>
                                            )}
                                        </td>

                                        {/* Action Button */}
                                        <td style={{ textAlign: "right" }}>
                                            {isSelf ? (
                                                <span className="action-na-text">—</span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => handleSaveRole(u)}
                                                    disabled={!hasChanged || isSaving}
                                                    className={`btn btn-sm ${
                                                        hasChanged ? "btn-primary" : "btn-ghost"
                                                    } role-save-btn`}
                                                    title={
                                                        hasChanged
                                                            ? `Save role change to ${selectedRole}`
                                                            : "Select a different role to enable saving"
                                                    }
                                                >
                                                    {isSaving ? (
                                                        <span className="spinner-sm" />
                                                    ) : hasChanged ? (
                                                        <>
                                                            <Check size={14} />
                                                            <span>Save</span>
                                                        </>
                                                    ) : (
                                                        <span>Saved</span>
                                                    )}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
