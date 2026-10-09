import { useAuth } from "../../context/AuthContext";

function AdminDashboard() {

    const { user, logout } = useAuth();

    return (
        <div>
            <h1>Admin Dashboard</h1>

            <p>Welcome, {user?.name}</p>

            <p>Email: {user?.email}</p>

            <p>Role: {user?.role}</p>

            <button onClick={logout}>
                Logout
            </button>
        </div>
    );
}

export default AdminDashboard;