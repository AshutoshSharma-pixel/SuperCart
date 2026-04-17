import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Sidebar() {
    const { store, logout } = useAuth()
    const { pathname } = useLocation()
    const navigate = useNavigate()

    const navItems = [
        {
            label: 'OVERVIEW', items: [
                { path: '/dashboard', icon: '▦', name: 'Dashboard' },
                { path: '/transactions', icon: '⇄', name: 'Transactions' }
            ]
        },
        {
            label: 'INVENTORY', items: [
                { path: '/products', icon: '⊟', name: 'Products' },
                { path: '/stock', icon: '↑', name: 'Stock Management' },
                { path: '/discounts', icon: '%', name: 'Discounts' }
            ]
        },
        {
            label: 'ACCOUNT', items: [
                { path: '/payment-settings', icon: '💳', name: 'Payment Settings' },
                { path: '/subscription', icon: '★', name: 'Subscription' }
            ]
        }
    ]

    return (
        <div style={{ width: 280, background: 'var(--accent)', color: 'white', display: 'flex', flexDirection: 'column', minHeight: '100vh', borderRight: '1px solid var(--accent2)' }}>
            {/* Logo Area */}
            <div style={{ padding: '24px 20px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src="/logo.png" alt="SuperCart Logo" style={{ width: 42, height: 42, objectFit: 'contain' }} />
                <div>
                    <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 16, letterSpacing: '0.12em' }}>SUPERCART</div>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--gold)', letterSpacing: '0.1em' }}>STORE PORTAL</div>
                </div>
            </div>

            {/* Store Pill */}
            <div style={{ margin: '0 20px 24px', padding: '12px 16px', background: 'var(--accent2)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: 9, color: 'var(--mut)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2, fontWeight: 600 }}>ACTIVE STORE</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 2 }}>{store?.name || 'Loading...'}</div>
                <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--gold)' }}>{store?.shopId || 'SCRT-XXXXXX'}</div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto' }}>
                {navItems.map((section, idx) => (
                    <div key={idx}>
                        <div style={{ fontSize: 10, color: 'var(--mut)', fontWeight: 700, letterSpacing: '0.1em', padding: '0 12px', marginBottom: 8 }}>
                            {section.label}
                        </div>
                        {section.items.map(item => {
                            const active = pathname.startsWith(item.path)
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        padding: '10px 12px',
                                        background: active ? 'rgba(255,255,255,0.10)' : 'transparent',
                                        color: active ? 'white' : 'var(--mut)',
                                        border: 'none',
                                        borderRadius: 8,
                                        cursor: 'pointer',
                                        fontFamily: 'inherit',
                                        fontSize: 14,
                                        fontWeight: active ? 600 : 500,
                                        textAlign: 'left',
                                        transition: 'all 0.15s ease'
                                    }}
                                >
                                    <span style={{ fontSize: 16, color: active ? 'var(--gold)' : 'inherit', width: 20, textAlign: 'center' }}>{item.icon}</span>
                                    <span style={{ flex: 1 }}>{item.name}</span>
                                </button>
                            )
                        })}
                    </div>
                ))}
            </nav>

            {/* Footer / User Profile */}
            <div style={{ borderTop: '1px solid var(--accent2)', padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), #8A6E2F)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)', fontWeight: 700, fontSize: 15 }}>
                        {store?.name?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{store?.name || 'Store'}</div>
                        <div style={{ fontSize: 11, color: 'var(--mut)' }}>Store Owner</div>
                    </div>
                </div>
                <button
                    onClick={logout}
                    style={{ width: '100%', padding: '10px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', color: 'var(--red)', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                    Sign Out
                </button>
            </div>
        </div>
    )
}
