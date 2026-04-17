import { useState, useEffect } from 'react'
import api from '../api/client'

export default function PaymentSettings() {
    const [config, setConfig] = useState<{ hasKeys: boolean, razorpayKeyId: string | null }>({ hasKeys: false, razorpayKeyId: null })
    const [loading, setLoading] = useState(true)
    const [saveLoading, setSaveLoading] = useState(false)
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    // Form states
    const [keyId, setKeyId] = useState('')
    const [keySecret, setKeySecret] = useState('')

    const fetchStatus = async () => {
        try {
            const { data } = await api.get('/payment-settings')
            setConfig(data)
        } catch (err) {
            console.error('Failed to load payment settings:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchStatus() }, [])

    const handleSave = async () => {
        if (!keyId || !keySecret) {
            setStatusMsg({ type: 'error', text: 'Both Key ID and Secret are required' })
            return
        }

        setStatusMsg(null)
        setSaveLoading(true)
        try {
            await api.post('/payment-settings', {
                razorpayKeyId: keyId,
                razorpayKeySecret: keySecret
            })
            setStatusMsg({ type: 'success', text: 'Payment settings saved successfully' })
            setKeyId('')
            setKeySecret('')
            fetchStatus()
        } catch (err: any) {
            setStatusMsg({ type: 'error', text: err.response?.data?.error || 'Failed to save settings' })
        } finally {
            setSaveLoading(false)
        }
    }

    const maskKeyId = (id: string | null) => {
        if (!id) return ''
        const last4 = id.slice(-4)
        return `rzp_xxx...${last4}`
    }

    if (loading) return <div style={{ padding: 40, color: 'var(--mut)' }}>Loading payment settings...</div>

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 800 }}>
            
            {/* Connection Status Banner */}
            {config.hasKeys ? (
                <div style={{ background: '#ecfdf5', border: '1px solid #10b981', borderRadius: 12, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ fontSize: 24 }}>✅</div>
                    <div>
                        <div style={{ color: '#064e3b', fontWeight: 700, fontSize: 15 }}>Razorpay is connected</div>
                        <div style={{ color: '#047857', fontSize: 13, fontFamily: 'JetBrains Mono', marginTop: 4 }}>
                            Key ID: {maskKeyId(config.razorpayKeyId)}
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ background: '#eff6ff', border: '1px solid #3b82f6', borderRadius: 12, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ fontSize: 24 }}>ℹ️</div>
                    <div>
                        <div style={{ color: '#1e3a8a', fontWeight: 700, fontSize: 15 }}>No payment method configured</div>
                        <div style={{ color: '#1d4ed8', fontSize: 13, marginTop: 4 }}>
                            Set up your Razorpay keys to start accepting payments.
                        </div>
                    </div>
                </div>
            )}

            {/* Config Form */}
            <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 12, padding: 24 }}>
                <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Configure API Keys</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={labelStyle}>Razorpay Key ID</label>
                        <input 
                            style={inputStyle} 
                            value={keyId} 
                            onChange={e => setKeyId(e.target.value)} 
                            placeholder="rzp_live_xxxxxxxxxx" 
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Razorpay Key Secret</label>
                        <input 
                            type="password"
                            style={inputStyle} 
                            value={keySecret} 
                            onChange={e => setKeySecret(e.target.value)} 
                            placeholder="••••••••••••••••" 
                        />
                    </div>

                    {statusMsg && (
                        <div style={{ 
                            background: statusMsg.type === 'success' ? 'var(--blue-bg)' : 'var(--red-bg)', 
                            border: `1px solid ${statusMsg.type === 'success' ? 'var(--blue-bdr)' : 'var(--red-bdr)'}`, 
                            color: statusMsg.type === 'success' ? 'var(--blu)' : 'var(--red)', 
                            padding: '12px 14px', 
                            borderRadius: 8, 
                            fontSize: 13 
                        }}>
                            {statusMsg.text}
                        </div>
                    )}

                    <div style={{ marginTop: 8 }}>
                        <button 
                            onClick={handleSave}
                            disabled={saveLoading}
                            style={{ 
                                ...btnStyle, 
                                width: '100%', 
                                background: 'var(--accent)', 
                                color: 'white',
                                opacity: saveLoading ? 0.7 : 1,
                                cursor: saveLoading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {saveLoading ? 'Saving Settings...' : 'Save Payment Settings'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Help Info Box */}
            <div style={{ background: 'var(--bg)', border: '1px dashed var(--bdr)', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.6 }}>
                    <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: 8 }}>How to get API keys?</strong>
                    Get your API keys from the <a href="https://dashboard.razorpay.com/app/settings/keys" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Razorpay Dashboard</a> → Settings → API Keys. 
                    Use live keys for production to accept real payments from customers.
                </div>
            </div>

        </div>
    )
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink2)', marginBottom: 6 }
const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 14px', background: 'var(--bg)', border: '1px solid var(--bdr)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none' }
const btnStyle: React.CSSProperties = { padding: '14px 16px', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', outline: 'none', transition: 'all 0.2s' }
