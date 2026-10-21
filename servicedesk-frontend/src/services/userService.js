import api from "./api";

/**
 * Fetch all registered users (Admin only)
 * @returns {Promise<Array>} List of users with id, name, email, role
 */
export async function getUsers() {
    const response = await api.get("/users");
    return response.data;
}

/**
 * Update a user's role (Admin only)
 * @param {number|string} userId
 * @param {string} role "CUSTOMER" | "AGENT" | "ADMIN"
 * @returns {Promise<Object>} Updated user object
 */
export async function updateUserRole(userId, role) {
    const response = await api.put(`/users/${userId}/role`, { role });
    return response.data;
}
