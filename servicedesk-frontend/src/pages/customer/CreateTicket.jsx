import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createTicket } from "../../services/ticketService";
import MarkdownContent from "../../components/common/MarkdownContent";
import {
    PlusCircle,
    ArrowLeft,
    Send,
    AlertCircle,
    Info,
    HelpCircle,
    Cpu,
    AppWindow,
    Wifi,
    Key,
    MoreHorizontal,
    Sparkles,
    Eye,
    Edit3,
    FileText,
    Check
} from "lucide-react";

const TICKET_TEMPLATES = [
    {
        id: "bug",
        label: "Bug Report",
        category: "SOFTWARE",
        priority: "HIGH",
        titlePrefix: "[Bug] ",
        text: `### Summary
Brief description of what went wrong.

### Steps to Reproduce
1. Navigate to...
2. Click on...
3. Observe unexpected behavior.

### Expected vs Actual
- **Expected**: Behavior that was expected to occur
- **Actual**: Error or failure observed

### Environment
- OS / Browser / Version:`
    },
    {
        id: "hardware",
        label: "Hardware Request",
        category: "HARDWARE",
        priority: "MEDIUM",
        titlePrefix: "[Hardware] ",
        text: `### Equipment Details
- **Device Type**: (Laptop / External Monitor / Docking Station / Keyboard)
- **Asset Tag / Model**: 

### Issue or Replacement Reason
Describe the physical failure or reason for hardware request.

### Work Impact
Can you continue working with existing backup peripherals?`
    },
    {
        id: "network",
        label: "Network / VPN",
        category: "NETWORK",
        priority: "HIGH",
        titlePrefix: "[Network] ",
        text: `### Connection Information
- **Network Environment**: (Office Ethernet / Wi-Fi / Remote Home)
- **VPN Client**: 

### Error Code / Message
\`\`\`
Paste connection error message or gateway status here
\`\`\`

### Troubleshooting Performed
- Re-authenticated VPN credentials
- Rebooted local modem / router`
    },
    {
        id: "access",
        label: "Access Request",
        category: "ACCESS_REQUEST",
        priority: "MEDIUM",
        titlePrefix: "[Access] ",
        text: `### Resource & Permissions
- **System / Repository**: 
- **Requested Permission Level**: (Read-Only / Member / Admin)

### Business Justification
Explain why this access is required for your project or duties.

### Approving Lead / Manager
- **Manager Name**:`
    }
];

export default function CreateTicket() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "MEDIUM",
        category: "SOFTWARE"
    });

    const [activeTab, setActiveTab] = useState("write"); // "write" | "preview"
    const [selectedTemplateId, setSelectedTemplateId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCategorySelect = (category) => {
        setFormData((prev) => ({ ...prev, category }));
    };

    const handlePrioritySelect = (priority) => {
        setFormData((prev) => ({ ...prev, priority }));
    };

    const handleApplyTemplate = (tpl) => {
        setSelectedTemplateId(tpl.id);
        setFormData((prev) => {
            const hasExistingTitle = prev.title.trim().length > 0;
            const updatedTitle = hasExistingTitle
                ? prev.title
                : `${tpl.titlePrefix}`;

            return {
                ...prev,
                title: updatedTitle,
                category: tpl.category,
                priority: tpl.priority,
                description: tpl.text
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await createTicket(formData);
            navigate("/customer/tickets");
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                "Unable to create ticket. Please verify inputs and try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        { key: "SOFTWARE", label: "Software", icon: AppWindow, desc: "Applications, OS, tools" },
        { key: "HARDWARE", label: "Hardware", icon: Cpu, desc: "Laptops, monitors, peripherals" },
        { key: "NETWORK", label: "Network", icon: Wifi, desc: "VPN, Wi-Fi, connectivity" },
        { key: "ACCESS_REQUEST", label: "Access Request", icon: Key, desc: "Permissions, accounts, keys" },
        { key: "OTHER", label: "Other", icon: MoreHorizontal, desc: "General IT inquiry" }
    ];

    const priorities = [
        { key: "LOW", label: "Low", desc: "Minor issue, general question" },
        { key: "MEDIUM", label: "Medium", desc: "Normal impact, workaround exists" },
        { key: "HIGH", label: "High", desc: "Significant slowdown, core feature affected" },
        { key: "CRITICAL", label: "Critical", desc: "System outage, complete blocker" }
    ];

    return (
        <div className="ticket-page-view">
            <div className="page-header-simple">
                <Link to="/customer/tickets" className="back-nav-link">
                    <ArrowLeft size={16} />
                    <span>Back to My Tickets</span>
                </Link>
                <h1>Create New Support Ticket</h1>
                <p>Submit your technical issue or access request for prompt engineer assignment.</p>
            </div>

            <div className="form-split-grid">
                {/* Main Form Card */}
                <div className="form-card-container">
                    {error && (
                        <div className="auth-error-banner" role="alert">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Quick Templates Selector */}
                    <div className="ticket-templates-bar">
                        <div className="templates-label">
                            <Sparkles size={14} className="text-accent" />
                            <span>Quick Templates:</span>
                        </div>
                        <div className="template-pills-wrap">
                            {TICKET_TEMPLATES.map((tpl) => (
                                <button
                                    key={tpl.id}
                                    type="button"
                                    className={`template-pill-btn ${selectedTemplateId === tpl.id ? "active" : ""}`}
                                    onClick={() => handleApplyTemplate(tpl)}
                                    title={`Pre-fill ${tpl.label} boilerplate`}
                                >
                                    {selectedTemplateId === tpl.id && <Check size={12} />}
                                    <span>{tpl.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="standard-form">
                        <div className="form-group">
                            <div className="form-label-row">
                                <label className="form-label" htmlFor="ticket-title">
                                    Ticket Subject / Title <span className="required-star">*</span>
                                </label>
                                <span className={`char-counter-tag ${formData.title.length > 130 ? "warn" : ""}`}>
                                    {formData.title.length} / 150
                                </span>
                            </div>
                            <input
                                id="ticket-title"
                                name="title"
                                type="text"
                                placeholder="e.g. Cannot connect to staging VPN after OS update"
                                value={formData.title}
                                onChange={handleChange}
                                maxLength={150}
                                className="form-control"
                                required
                            />
                            <span className="form-help-text">
                                Provide a concise summary of the symptom or request
                            </span>
                        </div>

                        {/* Visual Category Selection */}
                        <div className="form-group">
                            <label className="form-label">
                                Category <span className="required-star">*</span>
                            </label>
                            <div className="selection-pill-grid">
                                {categories.map((cat) => {
                                    const Icon = cat.icon;
                                    const isSelected = formData.category === cat.key;
                                    return (
                                        <button
                                            key={cat.key}
                                            type="button"
                                            className={`selection-card ${isSelected ? "selected" : ""}`}
                                            onClick={() => handleCategorySelect(cat.key)}
                                        >
                                            <Icon size={18} className="selection-icon" />
                                            <div className="selection-info">
                                                <span className="selection-title">{cat.label}</span>
                                                <span className="selection-desc">{cat.desc}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Visual Priority Selection */}
                        <div className="form-group">
                            <label className="form-label">
                                Priority Level <span className="required-star">*</span>
                            </label>
                            <div className="priority-pill-grid">
                                {priorities.map((pri) => {
                                    const isSelected = formData.priority === pri.key;
                                    const priClass = `pri-btn-${pri.key.toLowerCase()}`;
                                    return (
                                        <button
                                            key={pri.key}
                                            type="button"
                                            className={`priority-select-btn ${priClass} ${isSelected ? "selected" : ""}`}
                                            onClick={() => handlePrioritySelect(pri.key)}
                                        >
                                            <span className="pri-title">{pri.label}</span>
                                            <span className="pri-desc">{pri.desc}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Detailed Description with Write / Preview Tabs */}
                        <div className="form-group">
                            <div className="desc-header-row">
                                <label className="form-label" htmlFor="ticket-description">
                                    Detailed Description <span className="required-star">*</span>
                                </label>
                                <div className="editor-tab-group">
                                    <button
                                        type="button"
                                        className={`editor-tab-btn ${activeTab === "write" ? "active" : ""}`}
                                        onClick={() => setActiveTab("write")}
                                    >
                                        <Edit3 size={13} />
                                        <span>Write</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`editor-tab-btn ${activeTab === "preview" ? "active" : ""}`}
                                        onClick={() => setActiveTab("preview")}
                                    >
                                        <Eye size={13} />
                                        <span>Preview</span>
                                    </button>
                                </div>
                            </div>

                            {activeTab === "write" ? (
                                <>
                                    <textarea
                                        id="ticket-description"
                                        name="description"
                                        placeholder="Describe what occurred, steps to reproduce, error codes, and the expected behavior (Markdown supported)..."
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={7}
                                        className="form-control textarea-control"
                                        required
                                    />
                                    <div className="desc-footer-row">
                                        <span className="form-help-text">
                                            Supports **bold**, `code`, lists, and ### headers.
                                        </span>
                                        <span className="char-counter-tag">
                                            {formData.description.length} chars
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div className="create-ticket-markdown-preview">
                                    {formData.description.trim() ? (
                                        <MarkdownContent content={formData.description} />
                                    ) : (
                                        <p className="preview-empty-hint">
                                            Nothing to preview yet. Switch to "Write" tab and add ticket details.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="form-actions-row">
                            <Link to="/customer/tickets" className="btn btn-ghost btn-md">
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="btn btn-primary btn-md"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="btn-spinner-text">
                                        <span className="spinner" /> Submitting ticket...
                                    </span>
                                ) : (
                                    <>
                                        <Send size={16} />
                                        <span>Submit Ticket</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Helpful Guidelines Card */}
                <div className="guideline-card">
                    <div className="guideline-header">
                        <Info size={18} className="guideline-icon" />
                        <h3>Writing a Great Ticket</h3>
                    </div>
                    <ul className="guideline-list">
                        <li>
                            <strong>Use Templates:</strong> Click one of the quick template chips above to instantly populate proven reporting formats.
                        </li>
                        <li>
                            <strong>Be Specific:</strong> Include exact error numbers, screenshots, or stack traces where possible.
                        </li>
                        <li>
                            <strong>Add Steps:</strong> What were you doing immediately before the issue occurred?
                        </li>
                        <li>
                            <strong>Category Matters:</strong> Selecting the proper category routes your ticket to the qualified technical agent faster.
                        </li>
                        <li>
                            <strong>Priority Guidelines:</strong> Reserve <em>Critical</em> for system-wide disruptions impacting immediate business operations.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
