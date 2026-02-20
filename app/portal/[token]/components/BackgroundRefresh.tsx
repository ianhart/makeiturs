"use client";

import { useEffect } from "react";

/**
 * Client component that triggers a background refresh if portal data is stale.
 * Rendered on every portal page load — fires a POST to the refresh endpoint
 * without blocking the page render.
 */
export default function BackgroundRefresh({
  token,
  lastSyncAt,
}: {
  token: string;
  lastSyncAt?: string;
}) {
  useEffect(() => {
    // Check if data is stale (>15 minutes)
    const lastSync = lastSyncAt ? new Date(lastSyncAt).getTime() : 0;
    const staleThreshold = 15 * 60 * 1000; // 15 minutes
    const isStale = Date.now() - lastSync > staleThreshold;

    if (!isStale) return;

    // Fire and forget — don't await, don't block UI
    fetch(`/api/portal/${token}/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }).catch(() => {
      // Silently ignore refresh errors — stale data is better than no data
    });
  }, [token, lastSyncAt]);

  // Renders nothing — purely a side-effect component
  return null;
}
