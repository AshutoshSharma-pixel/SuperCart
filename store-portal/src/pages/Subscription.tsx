import { useAuth } from '../hooks/useAuth'
import api from '../api/client'
import Badge from '../components/Badge'

const PLANS = [
    { id: 'starter', label: 'Starter Segment', price: 999, txns: '1,000 / month', skus: '100 products limit', support: 'Community Support' },
    { id: 'growth', label: 'Growth Plan', price: 3500, txns: '5,000 / month', skus: '500 products limit', support: '24/7 Priority Email' },
    { id: 'enterprise', label: 'Enterprise Platform', price: 8000, txns: 'Unlimited Volume', skus: 'Unlimited capacity', support: '1-on-1 Dedicated PAM' }
]

export default function Subscription() {
    const { store } = useAuth()
    const currentPlan = (store as any)?.planTier;

    const daysLeft = (store as any)?.planExpiresAt ? Math.max(0, Math.ceil((new Date((store as any).planExpiresAt).getTime() - Date.now()) / 86400000)) : 0

    const handleUpgrade = async (planId: string) => {
        try {
            const { data } = await api.post('/subscription/create-order', { planTier: planId.toUpperCase() })

            const options = {
                key: data.key,
                amount: data.amount,
                currency: data.currency,
                name: 'SuperCart Integrations',
                description: `Upgrading to ${planId.toUpperCase()} Plan`,
                order_id: data.orderId,
                handler: async (response: any) => {
                    await api.post('/subscription/verify', {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        planTier: planId.toUpperCase()
                    })
                    alert('Subscription updated successfully! Please refresh.')
                    window.location.reload()
                }
            }

            const rzp = new (window as any).Razorpay(options)
            rzp.open()
        } catch (err) {
            alert('Failed to initialize payment gateway')
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>

            {/* Navy Banner */}
            <div style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--ink) 100%)', borderRadius: 16, padding: 40, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 12px 32px rgba(13,15,26,0.15)' }}>
                <div>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                        <span style={{ background: 'var(--gold)', color: 'var(--ink)', padding: '4px 12px', borderRadius: 100, fontSize: 11, fontFamily: 'JetBrains Mono', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{currentPlan || 'No Plan'}</span>
                        <span style={{ border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono', letterSpacing: '0.05em' }}>{!(store as any)?.isLocked ? 'ACTIVE' : 'EXPIRED'}</span>
                    </div>
                    <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 32, marginBottom: 8 }}>{!(store as any)?.isLocked ? 'Your plan is active' : 'Plan expired'}</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, maxWidth: 500 }}>Accessing full features and unlimited telemetry across smart-carts.</p>
                </div>

                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 64, color: 'var(--gold)', lineHeight: 1 }}>{daysLeft}</div>
                    <div style={{ fontFamily: 'JetBrains Mono', color: 'rgba(255,255,255,0.7)', fontSize: 12, letterSpacing: '0.05em', marginBottom: 16 }}>DAYS REMAINING</div>
                    <button onClick={() => handleUpgrade(currentPlan || 'growth')} style={{ background: 'white', color: 'var(--ink)', border: 'none', padding: '12px 24px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Renew Plan</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0, 2fr)', gap: 24 }}>

                {/* Details Table */}
                <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 12, padding: 24, height: 'fit-content' }}>
                    <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Current Plan Details</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {[
                            { k: 'Plan Tier', v: currentPlan },
                            { k: 'Price', v: '₹' + (PLANS.find(p => p.id === currentPlan?.toLowerCase())?.price || '0') + ' / month' },
                            { k: 'Transactions', v: PLANS.find(p => p.id === currentPlan?.toLowerCase())?.txns },
                            { k: 'SKUs Active', v: PLANS.find(p => p.id === currentPlan?.toLowerCase())?.skus },
                            { k: 'Support Channel', v: PLANS.find(p => p.id === currentPlan?.toLowerCase())?.support },
                            { k: 'Expiry Date', v: (store as any)?.planExpiresAt ? new Date((store as any).planExpiresAt).toLocaleDateString() : 'None' },
                            { k: 'Shop ID', v: <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--gold)' }}>{store?.shopId}</span> }
                        ].map((row, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--bdr2)', paddingBottom: 16 }}>
                                <div style={{ color: 'var(--mut)', fontWeight: 500 }}>{row.k}</div>
                                <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{row.v || 'N/A'}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upgrade Path */}
                <div style={{ padding: 24 }}>
                    <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Upgrade Plan</h3>
                    <p style={{ color: 'var(--mut)', marginBottom: 24 }}>Select a new plan below to initiate a Razorpay checkout upgrade map.</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {PLANS.map(plan => {
                            const isActive = currentPlan?.toLowerCase() === plan.id;
                            return (
                                <div key={plan.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surf)', border: `2px solid ${isActive ? 'var(--ink)' : 'var(--bdr)'}`, borderRadius: 12, padding: 24 }}>
                                    <div>
                                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                                            <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18 }}>{plan.label}</div>
                                            {isActive && <Badge type="info">CURRENT PLAN</Badge>}
                                        </div>
                                        <div style={{ display: 'flex', gap: 16, color: 'var(--mut)', fontSize: 13, fontWeight: 500 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 4, height: 4, background: 'var(--gold)', borderRadius: '50%' }} /> {plan.txns}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 4, height: 4, background: 'var(--gold)', borderRadius: '50%' }} /> {plan.skus}</div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 24 }}>₹{plan.price.toLocaleString()}</div>
                                            <div style={{ fontSize: 12, color: 'var(--mut)' }}>per month</div>
                                        </div>
                                        <button onClick={() => handleUpgrade(plan.id)} disabled={isActive} style={{ padding: '12px 24px', background: isActive ? 'var(--bg)' : 'var(--ink)', color: isActive ? 'var(--mut)' : 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: isActive ? 'default' : 'pointer' }}>
                                            {isActive ? 'Current' : 'Upgrade'}
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

            </div>
        </div>
    )
}
