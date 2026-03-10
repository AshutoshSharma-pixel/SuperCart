import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { SCLogo } from '../components/SCLogo';
import { styles } from '../styles';

const DashboardLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const navItems = [
        { id: "", path: "/", label: "Dashboard", icon: "▦" },
        { id: "transactions", path: "/transactions", label: "Transactions", icon: "⇄" },
        { id: "flags", path: "/flags", label: "Flags & Alerts", icon: "⚑" },
        { id: "stores", path: "/stores", label: "Stores", icon: "⊞" },
    ];

    const currentPath = location.pathname;
    const activeRouteId = currentPath === '/' ? '' : currentPath.substring(1);
    const activeLabel = navItems.find(n => n.id === activeRouteId)?.label || 'Dashboard';

    return (
        <div style={styles.page as any}>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
            <div style={styles.layout as any}>

                {/* Sidebar */}
                <div style={styles.sidebar as any}>
                    <div style={{ padding: "0 20px 32px", borderBottom: "1px solid #1A1E30", marginBottom: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <SCLogo size={34} />
                            <div style={{ marginLeft: 8 }}>
                                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: "0.08em", textTransform: "uppercase" }}>SuperCart</div>
                                <div style={{ fontSize: 10, color: "#6B7280", letterSpacing: "0.05em", textTransform: "uppercase", marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>Admin Console</div>
                            </div>
                        </div>
                    </div>

                    <nav style={{ flex: 1, padding: "0 12px" }}>
                        {navItems.map(item => {
                            const isActive = activeRouteId === item.id;
                            return (
                                <button key={item.id} onClick={() => navigate(item.path)} style={{
                                    width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 16px",
                                    borderRadius: 8, border: "none", cursor: "pointer", textAlign: "left", marginBottom: 2,
                                    background: isActive ? "rgba(201,168,76,0.1)" : "transparent",
                                    color: isActive ? "#C9A84C" : "#556080",
                                    fontFamily: "inherit", fontSize: 14, fontWeight: isActive ? 600 : 400,
                                    transition: "all 0.15s", borderLeft: isActive ? "2px solid #C9A84C" : "2px solid transparent",
                                }}>
                                    <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>
                                    <span style={{ flex: 1 }}>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>

                    <div style={{ padding: "16px 12px", borderTop: "1px solid #1A1E30" }}>
                        <button onClick={handleLogout} style={{
                            width: "100%", background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.15)",
                            borderRadius: 8, padding: "10px 16px", color: "#F43F5E", fontSize: 13,
                            cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
                        }}>Sign Out</button>
                    </div>
                </div>

                {/* Main */}
                <div style={styles.main as any}>
                    {/* Topbar */}
                    <div style={styles.topbar as any}>
                        <div>
                            <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 18 }}>
                                {activeLabel}
                            </div>
                            <div style={{ fontSize: 11, color: "#556080", marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>
                                {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                            </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 6, padding: "6px 14px", fontSize: 12, color: "#22C55E", fontFamily: "'JetBrains Mono', monospace" }}>
                                ● LIVE
                            </div>
                            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #C9A84C, #8A6E2F)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#060811" }}>A</div>
                        </div>
                    </div>

                    <div style={styles.content as any}>
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
