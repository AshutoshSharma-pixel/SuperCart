import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import type { Transaction } from '../types'

export default function Dashboard() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ revenue: 0, transactions: 0, products: 0, lowStock: 0 })
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
    const [lowStockProducts, setLowStockProducts] = useState<any[]>([])

    useEffect(() => {
        let active = true
        const fetchData = async () => {
            try {
                // Fetch products and transactions in parallel
                // For the mock, we will try to fetch from store endpoints. If transactions 404s, we handle gracefully.
                const [prodRes, txRes] = await Promise.allSettled([
                    api.get('/products/store'),
                    api.get('/payment/transactions') // Store-scoped transaction route placeholder
                ])

                if (!active) return

                let products: any[] = []
                let txs: Transaction[] = []

                if (prodRes.status === 'fulfilled') {
                    products = prodRes.value.data || []
                }
                if (txRes.status === 'fulfilled') {
                    txs = txRes.value.data || []
                }

                const lowStock = products.filter(p => p.quantity <= p.lowStockThreshold)

                // Mock revenue for today based on transactions (fallback to 0 if no endpoint)
                const revenue = txs.filter(t => t.status === 'paid').reduce((acc, t) => acc + (t.amount || 0), 0)

                setStats({
                    revenue,
                    transactions: txs.length,
                    products: products.length,
                    lowStock: lowStock.length
                })

                setLowStockProducts(lowStock.slice(0, 6))
                setRecentTransactions(txs.slice(0, 6))

            } catch (err) {
                console.error('Failed to load dashboard data:', err)
            } finally {
                if (active) setLoading(false)
            }
        }
        fetchData()
        return () => { active = false }
    }, [])

    if (loading) {
        return <div style={{ color: 'var(--mut)' }}>Loading dashboard metrics...</div>
    }

    const statCards = [
        { label: "Today's Revenue", value: `₹${(stats.revenue).toLocaleString()}`, color: 'var(--accent)', glow: 'rgba(26,31,58,0.05)' },
        { label: "Transactions", value: stats.transactions.toLocaleString(), color: 'var(--blu)', glow: 'var(--blu-bg)' },
        { label: "Total Products", value: stats.products.toLocaleString(), color: 'var(--grn)', glow: 'var(--grn-bg)' },
        { label: "Low Stock", value: stats.lowStock.toLocaleString(), color: 'var(--amb)', glow: 'var(--amb-bg)' }
    ]

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }}>

            {/* Alert Banner */}
            {stats.lowStock > 0 && (
                <div style={{ background: 'var(--amb-bg)', border: '1px solid var(--amb-bdr)', color: 'var(--amb)', padding: '12px 16px', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontWeight: 600 }}>
                        <span>⚠️</span> {stats.lowStock} products are running low on stock.
                    </div>
                    <button onClick={() => navigate('/stock')} style={{ background: 'none', border: 'none', color: 'var(--amb)', fontWeight: 700, cursor: 'pointer', fontSize: 13, textDecoration: 'underline' }}>View →</button>
                </div>
            )}

            {/* Grid Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                {statCards.map((s, i) => (
                    <div key={i} style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 12, padding: 24, position: 'relative', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}
                        onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.06)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)'; }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.color }} />
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(circle at top right, ${s.glow} 0%, transparent 70%)`, pointerEvents: 'none' }} />
                        <div style={{ fontSize: 11, color: 'var(--mut)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 12 }}>{s.label}</div>
                        <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 32, color: 'var(--ink)' }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Bottom Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, flex: 1, minHeight: 400 }}>
                {/* Recent Transactions */}
                <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16 }}>Recent Transactions</h3>
                        <button onClick={() => navigate('/transactions')} style={{ background: 'none', border: 'none', color: 'var(--blu)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>View all →</button>
                    </div>

                    {recentTransactions.length === 0 ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--mut)' }}>
                            <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.5 }}>🛒</div>
                            <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink2)' }}>No transactions yet</div>
                            <div style={{ fontSize: 13, textAlign: 'center', maxWidth: 280, marginTop: 8 }}>Transactions will appear here once customers start scanning and shopping.</div>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '12px 0', borderBottom: '1px solid var(--bdr)', fontSize: 11, color: 'var(--mut)', fontWeight: 600, letterSpacing: '0.05em' }}>TXN ID</th>
                                    <th style={{ textAlign: 'left', padding: '12px 0', borderBottom: '1px solid var(--bdr)', fontSize: 11, color: 'var(--mut)', fontWeight: 600, letterSpacing: '0.05em' }}>AMOUNT</th>
                                    <th style={{ textAlign: 'left', padding: '12px 0', borderBottom: '1px solid var(--bdr)', fontSize: 11, color: 'var(--mut)', fontWeight: 600, letterSpacing: '0.05em' }}>STATUS</th>
                                    <th style={{ textAlign: 'right', padding: '12px 0', borderBottom: '1px solid var(--bdr)', fontSize: 11, color: 'var(--mut)', fontWeight: 600, letterSpacing: '0.05em' }}>TIME</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTransactions.map(t => (
                                    <tr key={t.id}>
                                        <td style={{ padding: '14px 0', borderBottom: '1px solid var(--bdr2)', fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--accent)' }}>TXN-{String(t.id).padStart(4, '0')}</td>
                                        <td style={{ padding: '14px 0', borderBottom: '1px solid var(--bdr2)', fontWeight: 600 }}>₹{t.amount?.toLocaleString()}</td>
                                        <td style={{ padding: '14px 0', borderBottom: '1px solid var(--bdr2)' }}>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, fontFamily: 'JetBrains Mono',
                                                background: t.status === 'paid' ? 'var(--grn-bg)' : t.status === 'flagged' ? 'var(--red-bg)' : 'var(--amb-bg)',
                                                color: t.status === 'paid' ? 'var(--grn)' : t.status === 'flagged' ? 'var(--red)' : 'var(--amb)',
                                                border: `1px solid ${t.status === 'paid' ? 'var(--grn-bdr)' : t.status === 'flagged' ? 'var(--red-bdr)' : 'var(--amb-bdr)'}`
                                            }}>
                                                {t.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 0', borderBottom: '1px solid var(--bdr2)', textAlign: 'right', fontSize: 13, color: 'var(--mut)' }}>
                                            {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Low Stock Alerts */}
                <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16 }}>Low Stock Alerts</h3>
                        <button onClick={() => navigate('/stock')} style={{ background: 'none', border: 'none', color: 'var(--blu)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Manage →</button>
                    </div>

                    {lowStockProducts.length === 0 ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--mut)' }}>
                            <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.5 }}>📦</div>
                            <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink2)' }}>Stock is healthy</div>
                            <div style={{ fontSize: 13, textAlign: 'center', maxWidth: 280, marginTop: 8 }}>No products are currently below their low stock threshold.</div>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '12px 0', borderBottom: '1px solid var(--bdr)', fontSize: 11, color: 'var(--mut)', fontWeight: 600, letterSpacing: '0.05em' }}>PRODUCT</th>
                                    <th style={{ textAlign: 'left', padding: '12px 0', borderBottom: '1px solid var(--bdr)', fontSize: 11, color: 'var(--mut)', fontWeight: 600, letterSpacing: '0.05em' }}>STOCK</th>
                                    <th style={{ textAlign: 'right', padding: '12px 0', borderBottom: '1px solid var(--bdr)', fontSize: 11, color: 'var(--mut)', fontWeight: 600, letterSpacing: '0.05em' }}>THRESHOLD</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lowStockProducts.map(p => (
                                    <tr key={p.id}>
                                        <td style={{ padding: '14px 0', borderBottom: '1px solid var(--bdr2)' }}>
                                            <div style={{ fontWeight: 600, marginBottom: 2 }}>{p.name}</div>
                                            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--mut)' }}>{p.barcode}</div>
                                        </td>
                                        <td style={{ padding: '14px 0', borderBottom: '1px solid var(--bdr2)' }}>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600, fontFamily: 'JetBrains Mono',
                                                background: p.quantity === 0 ? 'var(--red-bg)' : 'var(--amb-bg)',
                                                color: p.quantity === 0 ? 'var(--red)' : 'var(--amb)',
                                            }}>
                                                {p.quantity} LEFT
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 0', borderBottom: '1px solid var(--bdr2)', textAlign: 'right', fontSize: 13, fontWeight: 600, color: 'var(--mut)' }}>
                                            ≤ {p.lowStockThreshold}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}
