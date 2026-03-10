export const Badge = ({ status }: { status: string }) => {
    const cfg = {
        PAID: { bg: "rgba(34,197,94,0.12)", color: "#22C55E", border: "rgba(34,197,94,0.25)" },
        FLAGGED: { bg: "rgba(244,63,94,0.12)", color: "#F43F5E", border: "rgba(244,63,94,0.25)" },
        PENDING: { bg: "rgba(245,158,11,0.12)", color: "#F59E0B", border: "rgba(245,158,11,0.25)" },
    }[status] || { bg: "transparent", color: "#EDF0FF", border: "#1A1E30" };

    return (
        <span style={{
            background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
            padding: "3px 10px", borderRadius: 4, fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase"
        }}>{status}</span>
    );
};
