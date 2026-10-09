
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTicket } from "../../services/ticketService";

function CreateTicket() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "MEDIUM",
        category: "SOFTWARE"
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setLoading(true);
        setError("");

        try {
            await createTicket(formData);
            navigate("/customer/tickets");
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to create ticket. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ticket-form-container">
            <h1>Create Support Ticket</h1>
            <p>Describe your issue so our support team can help.</p>

            {error && (
                <p className="error-message" role="alert">
                    {error}
                </p>
            )}

            <form onSubmit={handleSubmit} className="ticket-form">
                <div className="form-group">
                    <label htmlFor="title">Ticket Title</label>
                    <input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        maxLength={150}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={5}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="priority">Priority</label>
                    <select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                    >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                    >
                        <option value="HARDWARE">Hardware</option>
                        <option value="SOFTWARE">Software</option>
                        <option value="NETWORK">Network</option>
                        <option value="ACCOUNT">Account</option>
                        <option value="SECURITY">Security</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Ticket"}
                </button>

                <button
                    type="button"
                    className="secondary-button"
                    onClick={() => navigate("/customer/dashboard")}
                >
                    Cancel
                </button>
            </form>
        </div>
    );
}

export default CreateTicket;
