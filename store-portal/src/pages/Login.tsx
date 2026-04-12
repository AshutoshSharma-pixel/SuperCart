import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../api/client'

export default function Login() {
    const [shopId, setShopId] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [forgotMode, setForgotMode] = useState(false)
    const [forgotEmail, setForgotEmail] = useState('')
    const [forgotSent, setForgotSent] = useState(false)

    // Registration states
    const [regMode, setRegMode] = useState(false)
    const [regName, setRegName] = useState('')
    const [regLocation, setRegLocation] = useState('')
    const [regPassword, setRegPassword] = useState('')
    const [ownerName, setOwnerName] = useState('')
    const [ownerPhone, setOwnerPhone] = useState('')
    const [ownerEmail, setOwnerEmail] = useState('')
    const [shopAddress, setShopAddress] = useState('')
    const [registeredShopId, setRegisteredShopId] = useState('')

    const { login } = useAuth()
    const navigate = useNavigate()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const { data } = await api.post('/auth/store-login', { shopId, password })
            localStorage.setItem('store_token', data.token)
            localStorage.setItem('store_info', JSON.stringify(data.store))
            login(data.token, data.store)
            navigate('/dashboard')
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid credentials. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const { data } = await api.post('/auth/store-register', {
                name: regName,
                location: regLocation,
                password: regPassword,
                ownerName,
                ownerPhone,
                ownerEmail,
                shopAddress
            })
            setRegisteredShopId(data.shopId)
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed. Please fill all required fields correctly.')
        } finally {
            setLoading(false)
        }
    }


    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Left Panel */}
            <div style={{ flex: 1, background: 'var(--accent)', color: 'white', display: 'flex', flexDirection: 'column', padding: 60, position: 'relative', overflow: 'hidden' }}>

                {/* Abstract shapes / gradients */}
                <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, background: 'radial-gradient(circle, rgba(200,168,75,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: -100, right: -50, width: 600, height: 600, background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />

                <div style={{ flex: 1, zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
                        <img src="/logo.png" alt="SuperCart Logo" style={{ width: 64, height: 64, objectFit: 'contain' }} />
                        <div>
                            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 22, letterSpacing: '0.12em' }}>SUPERCART</div>
                            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--gold)', letterSpacing: '0.1em', marginTop: 2 }}>STORE PORTAL</div>
                        </div>
                    </div>

                    <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 42, lineHeight: 1.2, marginBottom: 16 }}>
                        Run your store.<br /><span style={{ color: 'var(--gold)' }}>Smarter.</span>
                    </h1>
                    <p style={{ color: 'var(--mut)', fontSize: 16, maxWidth: 400, marginBottom: 40, lineHeight: 1.6 }}>
                        Access real-time analytics, manage your inventory automatically, and handle your subscriptions from one unified portal.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {[
                            "Live cashier-less checkout logs",
                            "Automated AI stock alerts & tracking",
                            "Dynamic promotional campaigns",
                            "Security & trust score monitoring"
                        ].map((feature, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15 }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)' }} />
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ zIndex: 1, fontSize: 12, color: 'var(--mut)', fontFamily: 'JetBrains Mono' }}>
                    © {new Date().getFullYear()} SuperCart Technologies · v2.1.0
                </div>
            </div>

            {/* Right Panel */}
            <div style={{ width: 460, background: 'var(--surf)', padding: '60px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

                {!forgotMode ? (
                    <div style={{ width: '100%', maxWidth: 360, margin: '0 auto' }}>
                        <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 28, marginBottom: 8, color: 'var(--ink)' }}>Store Sign In</h2>
                        <p style={{ color: 'var(--mut)', fontSize: 15, marginBottom: 32 }}>Enter your Shop ID and password to continue</p>

                        <form onSubmit={handleLogin}>
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink2)', marginBottom: 8 }}>Shop ID</label>
                                <input
                                    type="text"
                                    placeholder="SCRT-XXXXXX"
                                    value={shopId}
                                    onChange={e => setShopId(e.target.value)}
                                    style={{ width: '100%', padding: '14px 16px', background: 'var(--bg)', border: '1px solid var(--bdr)', borderRadius: 8, fontSize: 15, fontFamily: 'JetBrains Mono', outline: 'none' }}
                                />
                            </div>

                            <div style={{ marginBottom: 12 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink2)', marginBottom: 8 }}>Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    style={{ width: '100%', padding: '14px 16px', background: 'var(--bg)', border: '1px solid var(--bdr)', borderRadius: 8, fontSize: 15, fontFamily: 'inherit', outline: 'none' }}
                                />
                            </div>

                            <div style={{ textAlign: 'right', marginBottom: 24 }}>
                                <button type="button" onClick={() => setForgotMode(true)} style={{ background: 'none', border: 'none', color: 'var(--blu)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                                    Forgot password?
                                </button>
                            </div>

                            {error && <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red-bdr)', color: 'var(--red)', padding: '12px 16px', borderRadius: 8, fontSize: 13, marginBottom: 20 }}>{error}</div>}

                            <button type="submit" disabled={loading} style={{ width: '100%', padding: 16, background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', transition: 'opacity 0.2s', opacity: loading ? 0.7 : 1 }}>
                                {loading ? 'Authenticating...' : 'Sign In to Portal'}
                            </button>

                            <div style={{ textAlign: 'center', marginTop: 32 }}>
                                <p style={{ fontSize: 13, color: 'var(--mut)', marginBottom: 12 }}>New to SuperCart?</p>
                                <button
                                    type="button"
                                    onClick={() => { setRegMode(true); setError(''); }}
                                    style={{ width: '100%', padding: '12px', background: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Create a Store Account
                                </button>
                            </div>
                        </form>
                    </div>
                ) : regMode ? (
                    <div style={{ width: '100%', maxWidth: 360, margin: '0 auto', paddingBottom: 40 }}>
                        {registeredShopId ? (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 48, marginBottom: 20 }}>🎉</div>
                                <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 26, marginBottom: 12, color: 'var(--ink)' }}>Registration Success!</h2>
                                <p style={{ color: 'var(--mut)', fontSize: 15, marginBottom: 32 }}>Your store has been created. Use the Shop ID below to sign in:</p>

                                <div style={{ background: 'var(--bg)', border: '1px dashed var(--gold)', borderRadius: 12, padding: '24px 16px', marginBottom: 32 }}>
                                    <div style={{ fontSize: 11, color: 'var(--mut)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontFamily: 'JetBrains Mono' }}>Your Unique Shop ID</div>
                                    <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--gold)', fontFamily: 'JetBrains Mono', letterSpacing: '0.05em' }}>{registeredShopId}</div>
                                </div>

                                <button
                                    onClick={() => { setRegMode(false); setRegisteredShopId(''); setShopId(registeredShopId); }}
                                    style={{ width: '100%', padding: 16, background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Proceed to Sign In
                                </button>
                            </div>
                        ) : (
                            <>
                                <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 28, marginBottom: 8, color: 'var(--ink)' }}>New Store Registration</h2>
                                <p style={{ color: 'var(--mut)', fontSize: 15, marginBottom: 28 }}>Join the SuperCart network and modernize your shop.</p>

                                <form onSubmit={handleRegister}>
                                    <div style={{ marginBottom: 16 }}>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink2)', marginBottom: 6 }}>Store Name</label>
                                        <input
                                            type="text"
                                            placeholder="Example: Metro Mart"
                                            value={regName}
                                            onChange={e => setRegName(e.target.value)}
                                            required
                                            style={{ width: '100%', padding: '12px 14px', background: 'var(--bg)', border: '1px solid var(--bdr)', borderRadius: 8, fontSize: 14, outline: 'none' }}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink2)', marginBottom: 6 }}>Location (City)</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Mumbai"
                                                value={regLocation}
                                                onChange={e => setRegLocation(e.target.value)}
                                                required
                                                style={{ width: '100%', padding: '12px 14px', background: 'var(--bg)', border: '1px solid var(--bdr)', borderRadius: 8, fontSize: 14, outline: 'none' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink2)', marginBottom: 6 }}>Set Password</label>
                                            <input
                                                type="password"
                                                placeholder="Min 8 chars"
                                                value={regPassword}
                                                onChange={e => setRegPassword(e.target.value)}
                                                required
                                                style={{ width: '100%', padding: '12px 14px', background: 'var(--bg)', border: '1px solid var(--bdr)', borderRadius: 8, fontSize: 14, outline: 'none' }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ borderTop: '1px solid var(--bdr)', margin: '20px 0', paddingTop: 20 }}>
                                        <h3 style={{ fontSize: 11, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, fontFamily: 'JetBrains Mono' }}>Ownership Details</h3>

                                        <div style={{ marginBottom: 16 }}>
                                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink2)', marginBottom: 6 }}>Owner Full Name</label>
                                            <input
                                                type="text"
                                                placeholder="Full Name"
                                                value={ownerName}
                                                onChange={e => setOwnerName(e.target.value)}
                                                required
                                                style={{ width: '100%', padding: '12px 14px', background: 'var(--bg)', border: '1px solid var(--bdr)', borderRadius: 8, fontSize: 14, outline: 'none' }}
                                            />
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink2)', marginBottom: 6 }}>Phone Number</label>
                                                <input
                                                    type="tel"
                                                    placeholder="10-digit mobile"
                                                    value={ownerPhone}
                                                    onChange={e => setOwnerPhone(e.target.value)}
                                                    required
                                                    style={{ width: '100%', padding: '12px 14px', background: 'var(--bg)', border: '1px solid var(--bdr)', borderRadius: 8, fontSize: 14, outline: 'none' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink2)', marginBottom: 6 }}>Owner Email</label>
                                                <input
                                                    type="email"
                                                    placeholder="email@example.com"
                                                    value={ownerEmail}
                                                    onChange={e => setOwnerEmail(e.target.value)}
                                                    required
                                                    style={{ width: '100%', padding: '12px 14px', background: 'var(--bg)', border: '1px solid var(--bdr)', borderRadius: 8, fontSize: 14, outline: 'none' }}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: 24 }}>
                                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink2)', marginBottom: 6 }}>Shop Full Address</label>
                                            <input
                                                type="text"
                                                placeholder="Street, Landmark, Building..."
                                                value={shopAddress}
                                                onChange={e => setShopAddress(e.target.value)}
                                                required
                                                style={{ width: '100%', padding: '12px 14px', background: 'var(--bg)', border: '1px solid var(--bdr)', borderRadius: 8, fontSize: 14, outline: 'none' }}
                                            />
                                        </div>
                                    </div>

                                    {error && <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red-bdr)', color: 'var(--red)', padding: '10px 14px', borderRadius: 8, fontSize: 12, marginBottom: 16 }}>{error}</div>}

                                    <button type="submit" disabled={loading} style={{ width: '100%', padding: 14, background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', transition: 'opacity 0.2s', opacity: loading ? 0.7 : 1 }}>
                                        {loading ? 'Creating Account...' : 'Register Store'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => { setRegMode(false); setError(''); }}
                                        style={{ width: '100%', padding: 14, background: 'transparent', color: 'var(--mut)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', marginTop: 8 }}
                                    >
                                        Already have an account? Sign In
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                ) : (

                    <div style={{ width: '100%', maxWidth: 360, margin: '0 auto' }}>
                        <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 28, marginBottom: 8, color: 'var(--ink)' }}>Reset Password</h2>
                        <p style={{ color: 'var(--mut)', fontSize: 15, marginBottom: 32 }}>Enter the email associated with your store account</p>

                        {!forgotSent ? (
                            <form onSubmit={(e) => { e.preventDefault(); setForgotSent(true) }}>
                                <div style={{ marginBottom: 20 }}>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink2)', marginBottom: 8 }}>Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="owner@store.com"
                                        value={forgotEmail}
                                        onChange={e => setForgotEmail(e.target.value)}
                                        required
                                        style={{ width: '100%', padding: '14px 16px', background: 'var(--bg)', border: '1px solid var(--bdr)', borderRadius: 8, fontSize: 15, fontFamily: 'inherit', outline: 'none', marginBottom: 24 }}
                                    />
                                    <button type="submit" style={{ width: '100%', padding: 16, background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                                        Send Reset Link
                                    </button>
                                </div>
                                <button type="button" onClick={() => setForgotMode(false)} style={{ width: '100%', padding: 16, background: 'transparent', color: 'var(--mut)', border: '1px solid var(--bdr)', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                                    Back to Sign In
                                </button>
                            </form>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <div style={{ fontSize: 40, marginBottom: 16 }}>✉️</div>
                                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--ink)' }}>Check your inbox</div>
                                <div style={{ fontSize: 14, color: 'var(--mut)', marginBottom: 32 }}>We've sent password reset instructions to <strong style={{ color: 'var(--ink)' }}>{forgotEmail}</strong></div>

                                <button type="button" onClick={() => { setForgotMode(false); setForgotSent(false); setForgotEmail(''); }} style={{ background: 'none', border: 'none', color: 'var(--blu)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                                    ← Back to Sign In
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div style={{ marginTop: 'auto', textAlign: 'center', fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--mut)', letterSpacing: '0.05em', paddingTop: 40 }}>
                    SECURED BY SUPERCART · ALL DATA ENCRYPTED
                </div>
            </div>
        </div>
    )
}
