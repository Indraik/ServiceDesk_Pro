import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function RoleRoute({ allowedRoles, children }) {

    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!user || !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default RoleRoute;