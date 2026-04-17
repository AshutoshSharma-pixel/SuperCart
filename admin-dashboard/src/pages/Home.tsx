import { useEffect, useState } from 'react';
import api, { getAdminTransactions } from '../api/client';
import { Badge } from '../components/Badge';
import { styles } from '../styles';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalStores: 0,
        activeStores: 0,
        totalTransactions: 0,
        totalRevenue: 0,
        newStoresToday: 0,
        transactionsToday: 0
    });
    const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, txRes] = await Promise.all([
                    api.get('/admin/stats'),
                    getAdminTransactions()
                ]);

                if (statsRes.data) {
                    setStats(statsRes.data);
                }
                
                if (txRes.data) {
                    setRecentTransactions(txRes.data.slice(0, 5));
                }
            } catch (err) {
                console.error('Failed to load dashboard data:', err);
                // Keep default 0 values as requested
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div style={{ 
                height: "60vh", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                color: "#556080", 
                fontFamily: "'Inter', sans-serif" 
            }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 24, marginBottom: 12 }}>⏳</div>
                    <div>Loading dashboard metrics...</div>
                </div>
            </div>
        );
    }

    const cards = [
        { label: "Platform Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, sub: "All time completed", color: "#C9A84C", glow: "rgba(201,168,76,0.08)" },
        { label: "Total Transactions", value: stats.totalTransactions.toLocaleString(), sub: `${stats.transactionsToday} completed today`, color: "#60A5FA", glow: "rgba(96,165,250,0.08)" },
        { label: "Active Stores", value: stats.activeStores, sub: "Currently operational", color: "#22C55E", glow: "rgba(34,197,94,0.08)" },
        { label: "Total Stores", value: stats.totalStores, sub: `${stats.newStoresToday} joined today`, color: "#A78BFA", glow: "rgba(167,139,250,0.08)" },
    ];

    return (
        <div>
            {/* Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
                {cards.map((s, i) => (
                    <div key={i} style={{ ...styles.statCard, position: 'relative', background: `radial-gradient(ellipse at top left, ${s.glow} 0%, #0C0E1A 60%)` } as any}>
                        <div style={{ fontSize: 11, color: "#556080", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16, fontWeight: 600 }}>{s.label}</div>
                        <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Inter', sans-serif", color: s.color, marginBottom: 6 }}>{s.value}</div>
                        <div style={{ fontSize: 12, color: "#3D4468" }}>{s.sub}</div>
                        <div style={{ position: "absolute", top: 20, right: 20, width: 6, height: 6, borderRadius: "50%", background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
                    </div>
                ))}
            </div>

            {/* Recent Activity Section */}
            <div style={styles.statCard as any}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 15 }}>Recent Activity</div>
                    <button onClick={() => navigate('/transactions')} style={{ background: "none", border: "none", color: "#C9A84C", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>View all →</button>
                </div>
                {recentTransactions.length === 0 ? (
                    <div style={{ color: "#556080", padding: "20px 0" }}>No recent activity to show.</div>
                ) : (
                    <table style={styles.table}>
                        <thead><tr>
                            {["TXN ID", "Store", "Customer", "Amount", "Status", "Time"].map(h => <th key={h} style={styles.th}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                            {recentTransactions.map(t => (
                                <tr key={t.id} style={{ cursor: "pointer" }}>
                                    <td style={{ ...styles.td, fontFamily: "'JetBrains Mono', monospace", color: "#C9A84C", fontSize: 12 }}>TXN-{String(t.id).padStart(4, '0')}</td>
                                    <td style={styles.td}>{t.store?.name || 'Unknown Store'}</td>
                                    <td style={{ ...styles.td, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{t.user?.phone || 'N/A'}</td>
                                    <td style={{ ...styles.td, fontWeight: 600, color: "#EDF0FF" }}>₹{(t.totalAmount || 0).toLocaleString()}</td>
                                    <td style={styles.td}><Badge status={t.status} /></td>
                                    <td style={{ ...styles.td, color: "#3D4468", fontSize: 12 }}>{new Date(t.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Home;
