import React from "react";

type PillSize = "sm" | "md" | "lg";
type PillTone = "nominal" | "critical" | "warning" | "muted";

interface StatusPillProps {
    children: React.ReactNode;
    tone?: PillTone;
    size?: PillSize;
    title?: string;
}

export function StatusPill({
                               children,
                               tone = "muted",
                               size = "md",
                               title,
                           }: Readonly<StatusPillProps>) {
    return <span
        className={`statusPill statusPill--${tone} statusPill--${size}`}
        data-status-tone={tone}
        title={title ?? String(children)}
    >
        {children}
    </span>;
}
