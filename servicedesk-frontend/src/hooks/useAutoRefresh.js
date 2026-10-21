import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Custom hook for live auto-refreshing data on a configurable interval.
 * Includes manual trigger and persistent state.
 */
export function useAutoRefresh(refreshFn, intervalMs = 30000, initialEnabled = false) {
    const [enabled, setEnabled] = useState(() => {
        const stored = localStorage.getItem("sd_auto_refresh");
        return stored !== null ? stored === "true" : initialEnabled;
    });
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastRefreshed, setLastRefreshed] = useState(new Date());
    const refreshFnRef = useRef(refreshFn);

    useEffect(() => {
        refreshFnRef.current = refreshFn;
    }, [refreshFn]);

    const triggerRefresh = useCallback(async () => {
        if (isRefreshing) return;
        setIsRefreshing(true);
        try {
            if (refreshFnRef.current) {
                await refreshFnRef.current();
            }
            setLastRefreshed(new Date());
        } catch (err) {
            console.error("Refresh error:", err);
        } finally {
            setIsRefreshing(false);
        }
    }, [isRefreshing]);

    const toggleEnabled = useCallback(() => {
        setEnabled((prev) => {
            const next = !prev;
            localStorage.setItem("sd_auto_refresh", String(next));
            return next;
        });
    }, []);

    useEffect(() => {
        if (!enabled) return;

        const interval = setInterval(() => {
            triggerRefresh();
        }, intervalMs);

        return () => clearInterval(interval);
    }, [enabled, intervalMs, triggerRefresh]);

    return {
        enabled,
        toggleEnabled,
        isRefreshing,
        lastRefreshed,
        triggerRefresh
    };
}
