/**
 * Exports an array of ticket objects to a CSV file and triggers a browser download.
 * Handles proper escaping of commas, quotes, and newlines.
 */
export function exportTicketsToCSV(tickets = [], filename = "servicedesk_tickets.csv") {
    if (!tickets || tickets.length === 0) {
        throw new Error("No tickets available to export.");
    }

    const headers = [
        "Ticket ID",
        "Title",
        "Status",
        "Priority",
        "Category",
        "Requester",
        "Assigned Agent",
        "Created At",
        "SLA Breached"
    ];

    const escapeCSV = (val) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
    };

    const rows = tickets.map((t) => {
        const isBreached = t.createdAt && (t.status === "OPEN" || t.status === "ASSIGNED" || t.status === "IN_PROGRESS")
            ? (Date.now() - new Date(t.createdAt).getTime()) > 4 * 60 * 60 * 1000 ? "YES" : "NO"
            : "NO";

        return [
            escapeCSV(`#${t.id}`),
            escapeCSV(t.title),
            escapeCSV(t.status),
            escapeCSV(t.priority),
            escapeCSV(t.category),
            escapeCSV(t.createdByName || "Customer"),
            escapeCSV(t.assignedToName || "Unassigned"),
            escapeCSV(t.createdAt ? new Date(t.createdAt).toLocaleString() : ""),
            escapeCSV(isBreached)
        ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
