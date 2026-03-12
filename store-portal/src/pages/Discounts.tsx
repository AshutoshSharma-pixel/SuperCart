import { useState, useEffect } from 'react'
import api from '../api/client'
import type { Product } from '../types'
import Badge from '../components/Badge'

export default function Discounts() {
    const [products, setProducts] = useState<Product[]>([])

    // Set Discount Form
    const [productId, setProductId] = useState('')
    const [type, setType] = useState<'percentage' | 'flat'>('percentage')
    const [value, setValue] = useState('')
    const [expiry, setExpiry] = useState('')

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products/store')
            setProducts(data || [])
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => { fetchProducts() }, [])

    const handleSetDiscount = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!productId || !value) return alert('Select product and value')

        try {
            await api.put(`/products/${productId}`, {
                discountType: type,
                discountValue: parseFloat(value),
                discountExpiry: expiry || null,
                discountActive: true
            })
            setProductId('')
            setValue('')
            setExpiry('')
            fetchProducts()
        } catch (err) {
            alert('Failed to set discount')
        }
    }

    const toggleDiscount = async (id: number, current: boolean) => {
        try {
            // Assuming a dedicated toggle exists or using PUT
            await api.patch(`/products/${id}/toggle-discount`, { discountActive: !current })
            fetchProducts()
        } catch (err) {
            console.error('Failed to toggle')
        }
    }

    const activeProducts = products.filter(p => p.discountActive && p.discountValue)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Set Discount Form */}
            <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 12, padding: 24 }}>
                <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Apply Discount to Product</h3>
                <form onSubmit={handleSetDiscount} style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>

                    <div style={{ flex: 2 }}>
                        <label style={labelStyle}>Select Product</label>
                        <select style={inputStyle} value={productId} onChange={e => setProductId(e.target.value)} required>
                            <option value="" disabled>Select a product...</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name} — ₹{p.price}</option>)}
                        </select>
                    </div>

                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Discount Type</label>
                        <select style={inputStyle} value={type} onChange={e => setType(e.target.value as any)}>
                            <option value="percentage">Percentage (%)</option>
                            <option value="flat">Flat Amount (₹)</option>
                        </select>
                    </div>

                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Value</label>
                        <input style={inputStyle} type="number" step="0.01" value={value} onChange={e => setValue(e.target.value)} placeholder={type === 'percentage' ? "10" : "50.00"} required />
                    </div>

                    <div style={{ flex: 1.5 }}>
                        <label style={labelStyle}>Expiry (Optional)</label>
                        <input style={inputStyle} type="date" value={expiry} onChange={e => setExpiry(e.target.value)} />
                    </div>

                    <div>
                        <button type="submit" style={{ ...btnStyle, background: 'var(--accent)', color: 'white', minHeight: 42 }}>Apply Discount</button>
                    </div>

                </form>
            </div>

            {/* Active Discounts */}
            <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 12, padding: '24px 0' }}>
                <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, marginBottom: 20, padding: '0 24px' }}>Active Promotions</h3>

                {activeProducts.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--mut)' }}>No discounts are currently active on your menu.</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '12px 24px', borderBottom: '1px solid var(--bdr)', fontSize: 11, color: 'var(--mut)', fontWeight: 600 }}>PRODUCT</th>
                                <th style={{ textAlign: 'center', padding: '12px 24px', borderBottom: '1px solid var(--bdr)', fontSize: 11, color: 'var(--mut)', fontWeight: 600 }}>PROMO TYPE</th>
                                <th style={{ textAlign: 'right', padding: '12px 24px', borderBottom: '1px solid var(--bdr)', fontSize: 11, color: 'var(--mut)', fontWeight: 600 }}>DISCOUNT</th>
                                <th style={{ textAlign: 'left', padding: '12px 24px', borderBottom: '1px solid var(--bdr)', fontSize: 11, color: 'var(--mut)', fontWeight: 600 }}>EXPIRES</th>
                                <th style={{ textAlign: 'center', padding: '12px 24px', borderBottom: '1px solid var(--bdr)', fontSize: 11, color: 'var(--mut)', fontWeight: 600 }}>TOGGLE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeProducts.map(p => (
                                <tr key={p.id}>
                                    <td style={{ padding: '16px 24px', borderBottom: '1px solid var(--bdr2)', fontWeight: 600 }}>{p.name}<div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--mut)', fontWeight: 400, marginTop: 4 }}>{p.barcode}</div></td>
                                    <td style={{ padding: '16px 24px', borderBottom: '1px solid var(--bdr2)', textAlign: 'center' }}>
                                        <Badge type={p.discountType === 'percentage' ? 'warning' : 'info'}>{p.discountType?.toUpperCase()}</Badge>
                                    </td>
                                    <td style={{ padding: '16px 24px', borderBottom: '1px solid var(--bdr2)', textAlign: 'right', fontFamily: 'Syne', fontWeight: 700, fontSize: 16 }}>
                                        {p.discountType === 'percentage' ? `${p.discountValue}% OFF` : `₹${p.discountValue}`}
                                    </td>
                                    <td style={{ padding: '16px 24px', borderBottom: '1px solid var(--bdr2)', color: 'var(--mut)', fontSize: 13 }}>
                                        {p.discountExpiry ? new Date(p.discountExpiry).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td style={{ padding: '16px 24px', borderBottom: '1px solid var(--bdr2)', textAlign: 'center' }}>
                                        <button onClick={() => toggleDiscount(p.id, p.discountActive)} style={{ background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid var(--red-bdr)', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>REVOKE</button>
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

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink2)', marginBottom: 6 }
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--bdr)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', minHeight: 42 }
const btnStyle: React.CSSProperties = { padding: '10px 16px', border: '1px solid var(--bdr)', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', outline: 'none' }
