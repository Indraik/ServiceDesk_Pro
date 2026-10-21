import React from "react";

export function Skeleton({ className = "", width, height, style = {} }) {
    return (
        <div
            className={`skeleton-box ${className}`}
            style={{
                width,
                height,
                ...style
            }}
        />
    );
}

export function TableSkeleton({ rows = 5, cols = 6 }) {
    return (
        <div className="table-skeleton-wrap">
            <div className="skeleton-table-header">
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton key={i} height="16px" width={i === 1 ? "180px" : "80px"} />
                ))}
            </div>
            {Array.from({ length: rows }).map((_, r) => (
                <div className="skeleton-table-row" key={r}>
                    <Skeleton height="20px" width="50px" />
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <Skeleton height="16px" width="220px" />
                        <Skeleton height="12px" width="140px" />
                    </div>
                    <Skeleton height="22px" width="70px" style={{ borderRadius: "20px" }} />
                    <Skeleton height="20px" width="60px" />
                    <Skeleton height="20px" width="80px" />
                    <Skeleton height="16px" width="90px" />
                </div>
            ))}
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="dashboard-skeleton-view">
            <div className="skeleton-banner">
                <Skeleton height="24px" width="160px" />
                <Skeleton height="36px" width="300px" />
                <Skeleton height="16px" width="450px" />
            </div>

            <div className="stat-cards-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="stat-card">
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                            <Skeleton height="14px" width="80px" />
                            <Skeleton height="32px" width="32px" style={{ borderRadius: "6px" }} />
                        </div>
                        <Skeleton height="32px" width="60px" />
                        <Skeleton height="12px" width="110px" style={{ marginTop: "10px" }} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function DetailSkeleton() {
    return (
        <div className="detail-skeleton-view">
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                <Skeleton height="16px" width="120px" />
                <Skeleton height="32px" width="360px" />
                <div style={{ display: "flex", gap: "10px" }}>
                    <Skeleton height="24px" width="80px" style={{ borderRadius: "20px" }} />
                    <Skeleton height="24px" width="70px" />
                    <Skeleton height="24px" width="90px" />
                </div>
            </div>

            <div className="detail-card" style={{ marginBottom: "20px" }}>
                <Skeleton height="40px" width="100%" />
            </div>

            <div className="ticket-detail-grid">
                <div className="ticket-main-col">
                    <div className="detail-card" style={{ marginBottom: "20px" }}>
                        <Skeleton height="20px" width="140px" style={{ marginBottom: "16px" }} />
                        <Skeleton height="16px" width="100%" style={{ marginBottom: "8px" }} />
                        <Skeleton height="16px" width="90%" style={{ marginBottom: "8px" }} />
                        <Skeleton height="16px" width="70%" />
                    </div>
                </div>

                <div className="ticket-side-col">
                    <div className="detail-card">
                        <Skeleton height="20px" width="100px" style={{ marginBottom: "16px" }} />
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
                                <Skeleton height="14px" width="70px" />
                                <Skeleton height="14px" width="100px" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
