import { createContext, useContext, useState, useCallback, useRef } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const [confirmState, setConfirmState] = useState(null);
    const confirmResolverRef = useRef(null);

    // Toast functions
    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback((message, type = "info", duration = 4000) => {
        const id = Date.now() + Math.random().toString(36).substring(2, 9);
        const newToast = { id, message, type, duration };

        setToasts((prev) => [...prev, newToast]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
        return id;
    }, [removeToast]);

    const success = useCallback((msg, duration) => showToast(msg, "success", duration), [showToast]);
    const error = useCallback((msg, duration) => showToast(msg, "error", duration), [showToast]);
    const warning = useCallback((msg, duration) => showToast(msg, "warning", duration), [showToast]);
    const info = useCallback((msg, duration) => showToast(msg, "info", duration), [showToast]);

    // Confirmation Modal function (Promise-based)
    const confirm = useCallback(({
        title = "Are you sure?",
        message = "Do you want to proceed with this action?",
        confirmText = "Confirm",
        cancelText = "Cancel",
        type = "danger" // danger, warning, primary
    } = {}) => {
        return new Promise((resolve) => {
            confirmResolverRef.current = resolve;
            setConfirmState({
                title,
                message,
                confirmText,
                cancelText,
                type
            });
        });
    }, []);

    const handleConfirmClose = (result) => {
        if (confirmResolverRef.current) {
            confirmResolverRef.current(result);
            confirmResolverRef.current = null;
        }
        setConfirmState(null);
    };

    return (
        <ToastContext.Provider value={{ showToast, success, error, warning, info, confirm }}>
            {children}

            {/* Floating Toast Notification Container */}
            <div className="toast-portal-container" aria-live="polite">
                {toasts.map((toast) => {
                    const icons = {
                        success: <CheckCircle2 size={18} className="toast-icon text-success" />,
                        error: <AlertCircle size={18} className="toast-icon text-danger" />,
                        warning: <AlertTriangle size={18} className="toast-icon text-warning" />,
                        info: <Info size={18} className="toast-icon text-accent" />
                    };
                    return (
                        <div key={toast.id} className={`toast-card toast-${toast.type}`}>
                            <div className="toast-icon-wrap">
                                {icons[toast.type] || icons.info}
                            </div>
                            <div className="toast-content">
                                <p className="toast-message">{toast.message}</p>
                            </div>
                            <button
                                type="button"
                                className="toast-close-btn"
                                onClick={() => removeToast(toast.id)}
                                aria-label="Dismiss toast"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Custom Confirmation Modal */}
            {confirmState && (
                <div className="modal-backdrop" onClick={() => handleConfirmClose(false)}>
                    <div
                        className="confirm-modal-box"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="confirm-modal-header">
                            <div className={`modal-icon-badge badge-${confirmState.type}`}>
                                {confirmState.type === "danger" && <AlertCircle size={22} />}
                                {confirmState.type === "warning" && <AlertTriangle size={22} />}
                                {confirmState.type === "primary" && <Info size={22} />}
                            </div>
                            <h3 className="modal-title">{confirmState.title}</h3>
                        </div>

                        <div className="confirm-modal-body">
                            <p>{confirmState.message}</p>
                        </div>

                        <div className="confirm-modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleConfirmClose(false)}
                            >
                                {confirmState.cancelText}
                            </button>
                            <button
                                type="button"
                                className={`btn btn-sm ${
                                    confirmState.type === "danger"
                                        ? "btn-danger-solid"
                                        : confirmState.type === "warning"
                                        ? "btn-warning-solid"
                                        : "btn-primary"
                                }`}
                                onClick={() => handleConfirmClose(true)}
                            >
                                {confirmState.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
