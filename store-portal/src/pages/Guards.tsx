import { useState, useEffect } from 'react'
import api from '../api/client'

interface Guard {
    id: number
    name: string
    phone: string
    isActive: boolean
    shiftScans: number
    lastLoginAt: string | null
    createdAt: string
}

export default function Guards() {
    const [guards, setGuards] = useState<Guard[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({ name: '', phone: '', password: '' })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const fetchGuards = async () => {
        try {
            const res = await api.get('/guards')
            setGuards(res.data.guards || [])
        } catch (err) {
            console.error('Failed to load guards:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchGuards() }, [])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name || !formData.phone || !formData.password) {
            setError('All fields are required')
            return
        }
        setSubmitting(true)
        setError('')
        try {
            await api.post('/guards/create', formData)
            setFormData({ name: '', phone: '', password: '' })
            setShowForm(false)
            await fetchGuards()
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create guard')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Delete guard "${name}"? This cannot be undone.`)) return
        try {
            await api.delete(`/guards/${id}`)
            await fetchGuards()
        } catch (err) {
            alert('Failed to delete guard')
        }
    }

    if (loading) {
        return <div style={{ color: 'var(--mut)', padding: 40 }}>Loading guards...</div>
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 24, margin: 0 }}>Guard Management</h1>
                    <p style={{ color: 'var(--mut)', fontSize: 14, margin: '4px 0 0' }}>Manage exit verification guards for your store</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{
                        background: showForm ? 'var(--red-bg)' : 'var(--accent)',
                        color: showForm ? 'var(--red)' : 'white',
                        border: showForm ? '1px solid var(--red-bdr)' : 'none',
                        padding: '10px 20px',
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                    }}
                >
                    {showForm ? '✕ Cancel' : '+ Add Guard'}
                </button>
            </div>

            {/* Add Guard Form */}
            {showForm && (
                <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 12, padding: 24 }}>
                    <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, margin: '0 0 20px' }}>Add New Guard</h3>
                    {error && (
                        <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red-bdr)', color: 'var(--red)', padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, marginBottom: 16 }}>
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 11, color: 'var(--mut)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 6, textTransform: 'uppercase' }}>Name</label>
                            <input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Guard name"
                                style={{ width: '100%', padding: '10px 12px', background: 'var(--bg)', border: '1px solid var(--bdr)', borderRadius: 8, color: 'var(--ink)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 11, color: 'var(--mut)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 6, textTransform: 'uppercase' }}>Phone Number</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+91XXXXXXXXXX"
                                style={{ width: '100%', padding: '10px 12px', background: 'var(--bg)', border: '1px solid var(--bdr)', borderRadius: 8, color: 'var(--ink)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 11, color: 'var(--mut)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 6, textTransform: 'uppercase' }}>Password</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                style={{ width: '100%', padding: '10px 12px', background: 'var(--bg)', border: '1px solid var(--bdr)', borderRadius: 8, color: 'var(--ink)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{ padding: '10px 24px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', height: 42, opacity: submitting ? 0.6 : 1 }}
                        >
                            {submitting ? 'Creating...' : 'Create'}
                        </button>
                    </form>
                </div>
            )}

            {/* Guards Table */}
            <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 12, overflow: 'hidden' }}>
                {guards.length === 0 ? (
                    <div style={{ padding: 60, textAlign: 'center' }}>
                        <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }}>🛡️</div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink2)', marginBottom: 4 }}>No guards added yet</div>
                        <div style={{ fontSize: 13, color: 'var(--mut)', maxWidth: 320, margin: '0 auto' }}>
                            Add guards to enable exit verification at your store. Guards can scan customer exit QR codes.
                        </div>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                {['NAME', 'PHONE', 'STATUS', 'SHIFT SCANS', 'LAST LOGIN', 'ACTIONS'].map(h => (
                                    <th key={h} style={{ textAlign: h === 'ACTIONS' ? 'right' : 'left', padding: '14px 20px', borderBottom: '1px solid var(--bdr)', fontSize: 11, color: 'var(--mut)', fontWeight: 600, letterSpacing: '0.05em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {guards.map(g => (
                                <tr key={g.id} style={{ transition: 'background 0.1s' }}
                                    onMouseOver={e => e.currentTarget.style.background = 'var(--bg)'}
                                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '14px 20px', borderBottom: '1px solid var(--bdr2)', fontWeight: 600 }}>{g.name}</td>
                                    <td style={{ padding: '14px 20px', borderBottom: '1px solid var(--bdr2)', fontFamily: 'JetBrains Mono', fontSize: 13, color: 'var(--mut)' }}>{g.phone}</td>
                                    <td style={{ padding: '14px 20px', borderBottom: '1px solid var(--bdr2)' }}>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                                            background: g.isActive ? 'var(--grn-bg)' : 'var(--red-bg)',
                                            color: g.isActive ? 'var(--grn)' : 'var(--red)',
                                            border: `1px solid ${g.isActive ? 'var(--grn-bdr)' : 'var(--red-bdr)'}`
                                        }}>
                                            {g.isActive ? 'ACTIVE' : 'INACTIVE'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '14px 20px', borderBottom: '1px solid var(--bdr2)', fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 15 }}>{g.shiftScans}</td>
                                    <td style={{ padding: '14px 20px', borderBottom: '1px solid var(--bdr2)', fontSize: 13, color: 'var(--mut)' }}>
                                        {g.lastLoginAt ? new Date(g.lastLoginAt).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Never'}
                                    </td>
                                    <td style={{ padding: '14px 20px', borderBottom: '1px solid var(--bdr2)', textAlign: 'right' }}>
                                        <button
                                            onClick={() => handleDelete(g.id, g.name)}
                                            style={{ background: 'var(--red-bg)', border: '1px solid var(--red-bdr)', color: 'var(--red)', padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
