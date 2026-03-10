import { useEffect, useState } from 'react';
import { getAdminFlags } from '../api/client';
import { styles } from '../styles';

const Flags = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAdminFlags()
            .then(res => setData(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div style={styles.statCard as any}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 15 }}>Flagged Security Sessions</div>
                {!loading && data.length > 0 && (
                    <span style={{ background: "rgba(244,63,94,0.12)", color: "#F43F5E", border: "1px solid rgba(244,63,94,0.2)", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                        {data.length} ALERTS
                    </span>
                )}
            </div>

            {loading ? (
                <div style={{ color: "#556080" }}>Loading security flags...</div>
            ) : data.length === 0 ? (
                <div style={{ color: "#10B981" }}>No flagged sessions detected. The platform is secure.</div>
            ) : (
                <table style={styles.table}>
                    <thead><tr>
                        {["Flag ID", "Store", "Customer", "Trust Score", "Amount", "Time"].map(h => <th key={h} style={styles.th}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                        {data.map(f => {
                            const trust = f.user?.trustScore ?? 100;
                            const trustColor = trust < 40 ? "#F43F5E" : trust < 60 ? "#F59E0B" : "#22C55E";
                            return (
                                <tr key={f.id}>
                                    <td style={{ ...styles.td, fontFamily: "'JetBrains Mono', monospace", color: "#F43F5E", fontSize: 12 }}>FLG-{String(f.id).padStart(4, '0')}</td>
                                    <td style={styles.td}>{f.store?.name || 'Unknown Store'}</td>
                                    <td style={{ ...styles.td, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{f.user?.phone || 'N/A'}</td>
                                    <td style={styles.td}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <div style={{ flex: 1, height: 4, background: "#1A1E30", borderRadius: 2, maxWidth: 60 }}>
                                                <div style={{ width: `${Math.max(5, trust)}%`, height: "100%", background: trustColor, borderRadius: 2 }} />
                                            </div>
                                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: trustColor }}>{trust}</span>
                                        </div>
                                    </td>
                                    <td style={{ ...styles.td, fontWeight: 600, color: "#EDF0FF" }}>₹{(f.totalAmount || 0).toLocaleString()}</td>
                                    <td style={{ ...styles.td, color: "#3D4468", fontSize: 12 }}>{new Date(f.updatedAt).toLocaleString()}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Flags;
