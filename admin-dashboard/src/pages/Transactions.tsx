import { useEffect, useState } from 'react';
import { getAdminTransactions } from '../api/client';
import { Badge } from '../components/Badge';
import { styles } from '../styles';

const Transactions = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAdminTransactions()
            .then(res => setData(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div style={styles.statCard as any}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 20 }}>All Transactions</div>

            {loading ? (
                <div style={{ color: "#556080" }}>Loading transactions...</div>
            ) : data.length === 0 ? (
                <div style={{ color: "#556080" }}>No transactions recorded yet.</div>
            ) : (
                <table style={styles.table}>
                    <thead><tr>
                        {["TXN ID", "Store", "Customer", "Amount", "Status", "Time"].map(h => <th key={h} style={styles.th}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                        {data.map(t => (
                            <tr key={t.id}>
                                <td style={{ ...styles.td, fontFamily: "'JetBrains Mono', monospace", color: "#C9A84C", fontSize: 12 }}>TXN-{String(t.id).padStart(4, '0')}</td>
                                <td style={styles.td}>{t.store?.name || 'Unknown Store'}</td>
                                <td style={{ ...styles.td, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{t.user?.phone || 'N/A'}</td>
                                <td style={{ ...styles.td, fontWeight: 600, color: "#EDF0FF" }}>₹{(t.totalAmount || 0).toLocaleString()}</td>
                                <td style={styles.td}><Badge status={t.status} /></td>
                                <td style={{ ...styles.td, color: "#3D4468", fontSize: 12 }}>{new Date(t.updatedAt).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Transactions;
