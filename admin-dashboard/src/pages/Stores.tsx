import { styles } from '../styles';
import { Badge } from '../components/Badge';

const Stores = () => {
    // Mock data based on the provided design since there isn't a global admin stores API yet
    const stores = ["Mumbai Fresh Mart", "Delhi Quick Shop", "Bangalore Daily", "Chennai Kirana", "Pune Bazaar", "Hyderabad Mart"];

    return (
        <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {stores.map((name, i) => (
                    <div key={i} style={{ ...styles.statCard, cursor: "pointer" } as any}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                            <div style={{ width: 40, height: 40, background: "linear-gradient(135deg, #1A1E30, #252A40)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⊞</div>
                            <Badge status="PAID" />
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{name}</div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#C9A84C", marginBottom: 12 }}>
                            SCRT-{Math.random().toString(36).substring(2, 8).toUpperCase()}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#556080" }}>
                            <span>Growth Plan</span>
                            <span>Expires in {15 + i * 3}d</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Stores;
