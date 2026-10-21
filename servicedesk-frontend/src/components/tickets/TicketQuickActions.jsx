import React, { useState } from "react";
import { Copy, Check, Printer, RotateCw } from "lucide-react";
import { useToast } from "../../context/ToastContext";

export default function TicketQuickActions({ onRefresh, isRefreshing = false }) {
    const [copied, setCopied] = useState(false);
    const { success } = useToast();

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            success("Ticket link copied to clipboard.");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            const el = document.createElement("textarea");
            el.value = window.location.href;
            document.body.appendChild(el);
            el.select();
            document.execCommand("copy");
            document.body.removeChild(el);
            setCopied(true);
            success("Ticket link copied to clipboard.");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="ticket-quick-actions-bar">
            {onRefresh && (
                <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    title="Refresh ticket data"
                >
                    <RotateCw size={13} className={isRefreshing ? "spin-animation" : ""} />
                    <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
                </button>
            )}

            <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleCopyLink}
                title="Copy direct link to this ticket"
            >
                {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                <span>{copied ? "Link Copied" : "Copy Link"}</span>
            </button>

            <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handlePrint}
                title="Print ticket summary report"
            >
                <Printer size={13} />
                <span>Print</span>
            </button>
        </div>
    );
}
