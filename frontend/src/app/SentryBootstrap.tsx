"use client";

import { useEffect } from "react";

export default function SentryBootstrap() {
    useEffect(() => {
        // Client-only lazy init
        import("@/app/analytics/sentry.client").catch(() => { });
    }, []);

    return null;
}
