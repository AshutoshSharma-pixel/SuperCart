import { useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Topbar() {
    const { pathname } = useLocation()
    const { store } = useAuth()

    const titles: Record<string, string> = {
        '/dashboard': 'Dashboard Overview',
        '/transactions': 'Transactions & Sales',
        '/products': 'Product Catalog',
        '/stock': 'Stock Management',
        '/discounts': 'Manage Discounts',
        '/subscription': 'Subscription Plan'
    }

    const title = titles[pathname] || 'Store Portal'
    const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

    const daysLeft = store?.subscriptionExpiry ? Math.max(0, Math.ceil((new Date(store.subscriptionExpiry).getTime() - Date.now()) / 86400000)) : 0
    const planLabel = store?.subscriptionPlan ? store.subscriptionPlan.charAt(0).toUpperCase() + store.subscriptionPlan.slice(1) : 'No Plan'

    return (
        <div style={{ height: 60, background: 'var(--surf)', borderBottom: '1px solid var(--bdr)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
            <div>
                <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 17, color: 'var(--ink)', marginBottom: 2 }}>{title}</h2>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--mut)' }}>{dateStr}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                    padding: '6px 12px',
                    border: '1px solid var(--gold)',
                    borderRadius: 100,
                    background: 'var(--gold-bg)',
                    color: 'var(--ink)',
                    fontFamily: 'JetBrains Mono',
                    fontSize: 11,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                }}>
                    <span style={{ color: 'var(--gold)' }}>⚡</span> {planLabel} Plan · {daysLeft}d left
                </div>

                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), #8A6E2F)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)', fontWeight: 700, fontSize: 13 }}>
                    {store?.name?.charAt(0).toUpperCase() || 'S'}
                </div>
            </div>
        </div>
    )
}
