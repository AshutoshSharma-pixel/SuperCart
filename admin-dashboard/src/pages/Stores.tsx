import React, { useEffect, useState } from 'react';
import { styles } from '../styles';
import { Badge } from '../components/Badge';
import api from '../api/client';

interface Store {
    id: number;
    name: string;
    shopId: string;
    planTier: string;
    planExpiresAt: string | null;
    gracePeriodEndsAt: string | null;
    isLocked: boolean;
    ownerName: string | null;
    ownerPhone: string | null;
    ownerEmail: string | null;
    shopAddress: string | null;
    location: string;
    createdAt: string;
}

const Stores = () => {
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);

    useEffect(() => {
        const fetchStores = async () => {
            try {
                // The api client already handles the token from localStorage ('token')
                const res = await api.get('/admin/stores');
                setStores(res.data);
            } catch (err: any) {
                setError(err.response?.data?.error || "Failed to fetch stores");
            } finally {
                setLoading(false);
            }
        };
        fetchStores();
    }, []);

    const getDaysLeft = (expiry: string | null) => {
        if (!expiry) return "N/A";
        const diff = new Date(expiry).getTime() - new Date().getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? `${days}d` : "Expired";
    };

    if (loading) return <div style={{ color: "#556080", padding: 32, fontFamily: "'Inter', sans-serif" }}>Loading store directory...</div>;
    if (error) return <div style={{ color: "#F43F5E", padding: 32, fontFamily: "'Inter', sans-serif" }}>Error: {error}</div>;

    return (
        <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {stores.map((store) => (
                    <div 
                        key={store.id} 
                        style={{ ...styles.statCard, cursor: "pointer", transition: "transform 0.2s" } as any}
                        onClick={() => setSelectedStore(store)}
                        onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
                        onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                            <div style={{ width: 40, height: 40, background: "linear-gradient(135deg, #1A1E30, #252A40)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⊞</div>
                            <Badge status={store.isLocked ? "FLAGGED" : "PAID"} />
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, color: "#F3F4F6" }}>{store.name}</div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#C9A84C", marginBottom: 12 }}>
                            {store.shopId}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#556080" }}>
                            <span>{store.planTier} Plan</span>
                            <span>{getDaysLeft(store.planExpiresAt)} left</span>
                        </div>
                        <div style={{ fontSize: 11, color: "#4B5563", marginTop: 12, borderTop: "1px solid #1A1E30", paddingTop: 8 }}>
                            📍 {store.location}
                        </div>
                    </div>
                ))}
            </div>

            {selectedStore && (
                <div style={modalOverlayStyle} onClick={() => setSelectedStore(null)}>
                    <div style={modalStyle} onClick={e => e.stopPropagation()}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32, alignItems: "center" }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Store Intelligence</h2>
                                <div style={{ fontSize: 12, color: "#556080", marginTop: 4 }}>Detailed registry information for {selectedStore.shopId}</div>
                            </div>
                            <button onClick={() => setSelectedStore(null)} style={closeBtnStyle}>✕</button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                            <div>
                                <h3 style={sectionTitleStyle}>General Configuration</h3>
                                <div style={infoRowStyle}><label style={labelStyle}>Business Name</label><span style={valStyle}>{selectedStore.name}</span></div>
                                <div style={infoRowStyle}><label style={labelStyle}>Store ID</label><span style={{ ...valStyle, color: "#C9A84C", fontFamily: "'JetBrains Mono', monospace" }}>{selectedStore.shopId}</span></div>
                                <div style={infoRowStyle}><label style={labelStyle}>Global Location</label><span style={valStyle}>{selectedStore.location}</span></div>
                                <div style={infoRowStyle}><label style={labelStyle}>Registry Date</label><span style={valStyle}>{new Date(selectedStore.createdAt).toLocaleString()}</span></div>
                            </div>
                            <div>
                                <h3 style={sectionTitleStyle}>Subscription & Status</h3>
                                <div style={infoRowStyle}><label style={labelStyle}>Current Tier</label><span style={valStyle}>{selectedStore.planTier}</span></div>
                                <div style={infoRowStyle}><label style={labelStyle}>License Expiry</label><span style={valStyle}>{selectedStore.planExpiresAt ? new Date(selectedStore.planExpiresAt).toLocaleDateString() : 'No active plan'}</span></div>
                                <div style={infoRowStyle}><label style={labelStyle}>Operational Status</label>
                                    <div style={{ marginTop: 4 }}>
                                        <Badge status={selectedStore.isLocked ? "LOCKED" : "ACTIVE"} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 32, borderTop: "1px solid #1A1E30", paddingTop: 32 }}>
                            <h3 style={sectionTitleStyle}>Ownership & Contact</h3>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                                <div style={infoRowStyle}><label style={labelStyle}>Owner Full Name</label><span style={valStyle}>{selectedStore.ownerName || 'Not provided'}</span></div>
                                <div style={infoRowStyle}><label style={labelStyle}>Contact Number</label><span style={valStyle}>{selectedStore.ownerPhone || 'Not provided'}</span></div>
                                <div style={infoRowStyle}><label style={labelStyle}>Email Address</label><span style={valStyle}>{selectedStore.ownerEmail || 'Not provided'}</span></div>
                                <div style={infoRowStyle}><label style={labelStyle}>Physical Address</label><span style={valStyle}>{selectedStore.shopAddress || 'Not provided'}</span></div>
                            </div>
                        </div>

                        <div style={{ marginTop: 40, display: "flex", justifyContent: "flex-end" }}>
                            <button 
                                onClick={() => setSelectedStore(null)}
                                style={{ background: "#1A1D27", border: "1px solid #2A2D3A", color: "#F3F4F6", padding: "10px 24px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                            >
                                Close Registry
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Internal styles for high-fidelity modal
const modalOverlayStyle: React.CSSProperties = {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(3,4,7,0.85)", display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, backdropFilter: "blur(8px)"
};

const modalStyle: React.CSSProperties = {
    background: "#0C0E1A", border: "1px solid #1A1E30", borderRadius: 20,
    padding: 40, width: "100%", maxWidth: 720, boxShadow: "0 30px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(201,168,76,0.1)",
    position: "relative", fontFamily: "'Inter', sans-serif"
};

const closeBtnStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.03)", border: "1px solid #1A1E30", color: "#6B7280", 
    cursor: "pointer", fontSize: 14, width: 32, height: 32, borderRadius: 8, display: "flex", 
    alignItems: "center", justifyContent: "center"
};

const sectionTitleStyle: React.CSSProperties = {
    fontSize: 11, color: "#C9A84C", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 20, fontWeight: 700
};

const infoRowStyle: React.CSSProperties = {
    marginBottom: 20, display: "flex", flexDirection: "column", gap: 6
};

const labelStyle: React.CSSProperties = { fontSize: 11, color: "#556080", fontWeight: 600, letterSpacing: "0.02em" };
const valStyle: React.CSSProperties = { fontSize: 14, color: "#F3F4F6", fontWeight: 500 };

export default Stores;

