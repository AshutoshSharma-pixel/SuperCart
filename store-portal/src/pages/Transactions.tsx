import { useState, useEffect } from 'react'
import api from '../api/client'
import type { Transaction } from '../types'
import Badge from '../components/Badge'

export default function Transactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let active = true
        const fetchTransactions = async () => {
            try {
                // Attempting to fetch store transactions. Fallback graceful empty state.
                const { data } = await api.get('/payment/transactions') // Store-scoped transaction route placeholder
                if (active) setTransactions(data || [])
            } catch (err) {
                console.error('Failed to load transactions:', err)
            } finally {
                if (active) setLoading(false)
            }
        }
        fetchTransactions()
        return () => { active = false }
    }, [])

    return (
        <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 12, display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 120px)' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--bdr)' }}>
                <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 20 }}>Transaction History</h2>
                <p style={{ color: 'var(--mut)', fontSize: 14 }}>All cash and card payments processed at your store.</p>
            </div>

            {loading ? (
                <div style={{ padding: 40, color: 'var(--mut)', textAlign: 'center' }}>Loading transactions...</div>
            ) : transactions.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, color: 'var(--mut)' }}>
                    <div style={{ fontSize: 64, marginBottom: 16, opacity: 0.5 }}>🛒</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>No transactions yet</div>
                    <div style={{ fontSize: 15, textAlign: 'center', maxWidth: 360, marginTop: 8, lineHeight: 1.5 }}>
                        Transactions will appear here once customers start scanning and shopping using your store's QR code.
                    </div>
                </div>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '16px 32px', borderBottom: '1px solid var(--bdr)', fontSize: 11, color: 'var(--mut)', fontWeight: 600, letterSpacing: '0.05em' }}>TXN ID</th>
                            <th style={{ textAlign: 'left', padding: '16px 32px', borderBottom: '1px solid var(--bdr)', fontSize: 11, color: 'var(--mut)', fontWeight: 600, letterSpacing: '0.05em' }}>DATE & TIME</th>
                            <th style={{ textAlign: 'left', padding: '16px 32px', borderBottom: '1px solid var(--bdr)', fontSize: 11, color: 'var(--mut)', fontWeight: 600, letterSpacing: '0.05em' }}>ITEMS</th>
                            <th style={{ textAlign: 'right', padding: '16px 32px', borderBottom: '1px solid var(--bdr)', fontSize: 11, color: 'var(--mut)', fontWeight: 600, letterSpacing: '0.05em' }}>AMOUNT</th>
                            <th style={{ textAlign: 'center', padding: '16px 32px', borderBottom: '1px solid var(--bdr)', fontSize: 11, color: 'var(--mut)', fontWeight: 600, letterSpacing: '0.05em' }}>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(t => (
                            <tr key={t.id} style={{ transition: 'background 0.1s' }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                                <td style={{ padding: '16px 32px', borderBottom: '1px solid var(--bdr2)', fontFamily: 'JetBrains Mono', fontSize: 13, color: 'var(--accent)' }}>TXN-{String(t.id).padStart(4, '0')}</td>
                                <td style={{ padding: '16px 32px', borderBottom: '1px solid var(--bdr2)', fontSize: 14, color: 'var(--ink)' }}>{new Date(t.createdAt).toLocaleString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                <td style={{ padding: '16px 32px', borderBottom: '1px solid var(--bdr2)', fontSize: 14 }}>{t.itemCount || 0} items</td>
                                <td style={{ padding: '16px 32px', borderBottom: '1px solid var(--bdr2)', textAlign: 'right', fontWeight: 600, fontSize: 15 }}>₹{t.amount?.toLocaleString()}</td>
                                <td style={{ padding: '16px 32px', borderBottom: '1px solid var(--bdr2)', textAlign: 'center' }}>
                                    <Badge type={t.status === 'paid' ? 'success' : t.status === 'flagged' ? 'error' : 'warning'}>
                                        {t.status.toUpperCase()}
                                    </Badge>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}
