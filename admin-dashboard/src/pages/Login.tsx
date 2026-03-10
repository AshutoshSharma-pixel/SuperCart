import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../api/client';
import { SCLogo } from '../components/SCLogo';
import { styles } from '../styles';

const Login = () => {
    const [loginData, setLoginData] = useState({ username: "", password: "" });
    const [loginError, setLoginError] = useState("");
    const [loading, setLoading] = useState(false);
    const [forgotMode, setForgotMode] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotSent, setForgotSent] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        setLoading(true);

        try {
            const { data } = await adminLogin(loginData.username, loginData.password);
            localStorage.setItem('token', data.token);
            navigate('/');
        } catch (err: any) {
            setLoginError(err.response?.data?.error || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.loginWrap}>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />

            <div style={styles.loginCard as any}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
                    <SCLogo size={40} />
                    <div>
                        <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: "0.08em", textTransform: "uppercase" }}>SuperCart</div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#6B7280", letterSpacing: "0.05em", textTransform: "uppercase", marginTop: 2 }}>Admin Console</div>
                    </div>
                </div>

                <div style={styles.goldLine as any} />

                {!forgotMode ? (
                    <>
                        <div style={{ marginBottom: 8, fontSize: 22, fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>Welcome back</div>
                        <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 32 }}>Sign in to your admin account</div>

                        <form onSubmit={handleLogin}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", fontSize: 12, color: "#556080", marginBottom: 8, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>Username</label>
                                <input style={styles.input} placeholder="supercart_admin" value={loginData.username}
                                    onChange={e => setLoginData(p => ({ ...p, username: e.target.value }))} />
                            </div>
                            <div style={{ marginBottom: 8 }}>
                                <label style={{ display: "block", fontSize: 12, color: "#556080", marginBottom: 8, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>Password</label>
                                <input style={styles.input} type="password" placeholder="••••••••" value={loginData.password}
                                    onChange={e => setLoginData(p => ({ ...p, password: e.target.value }))} />
                            </div>
                            <div style={{ textAlign: "right", marginBottom: 24 }}>
                                <button type="button" onClick={() => setForgotMode(true)}
                                    style={{ background: "none", border: "none", color: "#6366F1", fontSize: 12, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                                    Forgot password?
                                </button>
                            </div>
                            {loginError && <div style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#F43F5E", marginBottom: 20 }}>{loginError}</div>}

                            <button style={styles.btnGold as any} type="submit" disabled={loading}>
                                {loading ? 'Authenticating...' : 'Sign In'}
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        <div style={{ marginBottom: 8, fontSize: 22, fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>Reset password</div>
                        <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 32 }}>Enter the email linked to your admin account</div>
                        {!forgotSent ? (
                            <>
                                <div style={{ marginBottom: 20 }}>
                                    <label style={{ display: "block", fontSize: 12, color: "#556080", marginBottom: 8, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>Email Address</label>
                                    <input style={styles.input} type="email" placeholder="admin@supercart.in" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
                                </div>
                                <button style={styles.btnGold as any} onClick={() => setForgotSent(true)}>Send Reset Link</button>
                                <button type="button" onClick={() => setForgotMode(false)}
                                    style={{ width: "100%", background: "none", border: "1px solid #2A2D3A", borderRadius: 8, padding: 14, color: "#6B7280", fontSize: 14, cursor: "pointer", marginTop: 12, fontFamily: "'Inter', sans-serif" }}>
                                    Back to Sign In
                                </button>
                            </>
                        ) : (
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 36, marginBottom: 16 }}>✉️</div>
                                <div style={{ fontSize: 15, marginBottom: 8 }}>Reset link sent!</div>
                                <div style={{ fontSize: 13, color: "#556080", marginBottom: 28 }}>Check {forgotEmail || "your inbox"} for instructions.</div>
                                <button onClick={() => { setForgotMode(false); setForgotSent(false); setForgotEmail(""); }}
                                    style={{ background: "none", border: "none", color: "#6366F1", fontSize: 14, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                                    ← Back to Sign In
                                </button>
                            </div>
                        )}
                    </>
                )}

                <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid #2A2D3A", textAlign: "center", fontSize: 11, color: "#4B5563", letterSpacing: "0.05em", fontFamily: "'JetBrains Mono', monospace" }}>
                    SUPERCART ADMIN CONSOLE · RESTRICTED ACCESS
                </div>
            </div>
        </div>
    );
};

export default Login;
