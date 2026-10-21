import React from "react";
import { RotateCw, Radio } from "lucide-react";

export default function LiveRefreshControl({
    isRefreshing = false,
    lastRefreshed,
    autoRefreshEnabled = false,
    onToggleAutoRefresh,
    onManualRefresh
}) {
    const formattedTime = lastRefreshed
        ? new Date(lastRefreshed).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        : "";

    return (
        <div className="live-refresh-control-group">
            <button
                type="button"
                className={`btn btn-secondary btn-sm refresh-icon-btn ${isRefreshing ? "refreshing" : ""}`}
                onClick={onManualRefresh}
                disabled={isRefreshing}
                title="Refresh latest updates now"
            >
                <RotateCw size={14} className={isRefreshing ? "spin-animation" : ""} />
                <span>Refresh</span>
            </button>

            <button
                type="button"
                className={`live-auto-toggle-btn ${autoRefreshEnabled ? "active" : ""}`}
                onClick={onToggleAutoRefresh}
                title={autoRefreshEnabled ? "Auto-refresh active (30s interval)" : "Enable 30s auto-refresh"}
            >
                <span className={`live-pulse-dot ${autoRefreshEnabled ? "pulsing" : ""}`} />
                <span className="live-text">
                    {autoRefreshEnabled ? "Live: 30s" : "Live: Off"}
                </span>
            </button>

            {formattedTime && (
                <span className="last-refreshed-hint" title={`Last updated at ${formattedTime}`}>
                    {formattedTime}
                </span>
            )}
        </div>
    );
}
