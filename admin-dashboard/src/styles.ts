export const styles = {
    page: { minHeight: "100vh", background: "#0F1117", color: "#F3F4F6", fontFamily: "'Inter', system-ui, sans-serif" },
    loginWrap: {
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.08) 0%, transparent 70%), #0F1117",
        padding: 24,
    },
    loginCard: {
        width: "100%", maxWidth: 420, background: "#0C0E1A",
        border: "1px solid #1A1E30", borderRadius: 16, padding: 48,
        boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.05)",
    },
    goldLine: { width: 40, height: 3, background: "linear-gradient(90deg, #6366F1, transparent)", borderRadius: 2, marginBottom: 24 },
    input: {
        width: "100%", background: "#1A1D27", border: "1px solid #2A2D3A", borderRadius: 8,
        padding: "13px 16px", color: "#F3F4F6", fontSize: 14, fontFamily: "'JetBrains Mono', monospace",
        outline: "none", boxSizing: "border-box" as "border-box", transition: "border-color 0.2s",
    },
    btnGold: {
        width: "100%", background: "linear-gradient(135deg, #6366F1, #4F46E5)", border: "none",
        borderRadius: 8, padding: "14px", color: "#FFFFFF", fontSize: 15, fontWeight: 700,
        cursor: "pointer", fontFamily: "'Inter', sans-serif", letterSpacing: "0.04em",
        boxShadow: "0 4px 20px rgba(99,102,241,0.3)", transition: "opacity 0.2s",
    },
    sidebar: {
        width: 240, minHeight: "100vh", background: "#0A0C18", borderRight: "1px solid #1A1E30",
        display: "flex", flexDirection: "column", padding: "24px 0", flexShrink: 0,
    },
    layout: { display: "flex", minHeight: "100vh" },
    main: { flex: 1, background: "#060811", overflow: "auto" },
    topbar: {
        height: 64, borderBottom: "1px solid #1A1E30", display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 32px", background: "#07080E",
        position: "sticky", top: 0, zIndex: 10,
    },
    content: { padding: "32px" },
    statCard: {
        background: "#0C0E1A", border: "1px solid #1A1E30", borderRadius: 12, padding: "24px",
        position: "relative" as "relative", overflow: "hidden",
    },
    table: { width: "100%", borderCollapse: "collapse" as "collapse" },
    th: { textAlign: "left" as "left", padding: "12px 16px", color: "#556080", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as "uppercase", borderBottom: "1px solid #1A1E30" },
    td: { padding: "14px 16px", fontSize: 14, borderBottom: "1px solid #111420", color: "#BCC0D8" },
};

