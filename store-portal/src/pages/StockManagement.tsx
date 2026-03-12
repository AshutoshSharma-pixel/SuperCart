import { useState, useEffect } from 'react'
import api from '../api/client'
import type { Product, StockLog } from '../types'
import BarcodeScanner from '../components/BarcodeScanner'

export default function StockManagement() {
    const [products, setProducts] = useState<Product[]>([])
    const [history, setHistory] = useState<StockLog[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedProductId, setSelectedProductId] = useState('')

    // Receive Stock Form
    const [showScanner, setShowScanner] = useState(false)
    const [receiveBarcode, setReceiveBarcode] = useState('')
    const [receiveProduct, setReceiveProduct] = useState<Product | null>(null)
    const [receiveQty, setReceiveQty] = useState('')

    // Adjust Stock Form
    const [adjustProductId, setAdjustProductId] = useState('')
    const [adjustQty, setAdjustQty] = useState('')
    const [adjustReason, setAdjustReason] = useState('')

    const fetchData = async () => {
        setLoading(true)
        try {
            // Fetch products for the store
            const prodRes = await api.get('/api/products/store')
            setProducts(prodRes.data || [])
            
            // Fetch history for first product or selected product
            const productId = selectedProductId || (prodRes.data?.[0]?.id)
            if (productId && !isNaN(Number(productId))) {
                try {
                    const histRes = await api.get(`/api/products/${productId}/stock-history`)
                    setHistory(histRes.data || [])
                } catch (err) {
                    setHistory([])
                }
            } else {
                setHistory([])
            }
        } catch (err) {
            console.error('Failed to fetch data:', err)
            setProducts([])
            setHistory([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])
    useEffect(() => { 
        if (selectedProductId) {
            fetchHistory(selectedProductId)
        }
    }, [selectedProductId])

    // Auto-resolve product on barcode scan
    useEffect(() => {
        if (receiveBarcode && receiveBarcode.length > 5) {
            // Look up product by barcode via API
            const fetchProductByBarcode = async () => {
                try {
                    const res = await api.get(`/api/products?barcode=${receiveBarcode}`)
                    const product = Array.isArray(res.data) ? res.data[0] : res.data
                    setReceiveProduct(product)
                } catch (err) {
                    console.error('Product not found:', err)
                    setReceiveProduct(null)
                }
            }
            fetchProductByBarcode()
        } else {
            setReceiveProduct(null)
        }
    }, [receiveBarcode])

    const fetchHistory = async (productId: string) => {
        if (!productId || isNaN(Number(productId))) {
            setHistory([])
            return
        }
        try {
            const histRes = await api.get(`/api/products/${productId}/stock-history`)
            setHistory(histRes.data || [])
        } catch (err) {
            setHistory([])
        }
    }

    const handleReceiveStock = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!receiveProduct || !receiveQty) return alert('Select product and quantity')
        try {
            await api.post(`/api/products/${receiveProduct.id}/receive`, { quantity: parseInt(receiveQty) })
            setReceiveBarcode('')
            setReceiveQty('')
            setReceiveProduct(null)
            fetchData()
        } catch (err) {
            alert('Failed to receive stock')
        }
    }

    const handleAdjustStock = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!adjustProductId || !adjustQty || !adjustReason) return alert('Fill all fields')
        try {
            await api.patch(`/api/products/${adjustProductId}/adjust-stock`, {
                adjustment: parseInt(adjustQty),
                reason: adjustReason
            })
            setAdjustQty('')
            setAdjustReason('')
            setAdjustProductId('')
            fetchData()
        } catch (err) {
            alert('Failed to adjust stock')
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {showScanner && (
                <BarcodeScanner
                    onDetected={(barcode) => {
                        setReceiveBarcode(barcode)
                        setShowScanner(false)
                    }}
                    onClose={() => setShowScanner(false)}
                />
            )}

            {/* Top Two Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 24 }}>

                {/* Receive Stock */}
                <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 12, padding: 24 }}>
                    <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Receive Stock</h3>
                    <form onSubmit={handleReceiveStock} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={labelStyle}>Scan Barcode</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input style={inputStyle} value={receiveBarcode} onChange={e => setReceiveBarcode(e.target.value)} placeholder="8901234567890" required />
                                <button type="button" onClick={() => setShowScanner(true)} style={{ ...btnStyle, background: 'var(--bg)', color: 'var(--ink)' }}>📷 Scan</button>
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Product</label>
                            <input style={{ ...inputStyle, background: 'var(--bg)', color: receiveProduct ? 'var(--ink)' : 'var(--mut)' }} readOnly value={receiveProduct ? receiveProduct.name : 'No product found'} />
                        </div>

                        <div>
                            <label style={labelStyle}>Quantity Received</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input style={{ ...inputStyle, flex: 1 }} type="number" min="1" value={receiveQty} onChange={e => setReceiveQty(e.target.value)} placeholder="10" required />
                                <button type="submit" disabled={!receiveProduct} style={{ ...btnStyle, width: 140, background: receiveProduct ? 'var(--accent)' : 'var(--bdr)', color: receiveProduct ? 'white' : 'var(--mut)', border: 'none' }}>Add to Stock</button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Adjust Stock */}
                <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 12, padding: 24 }}>
                    <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Manual Adjustment</h3>
                    <form onSubmit={handleAdjustStock} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={labelStyle}>Select Product</label>
                            <select style={inputStyle} value={adjustProductId} onChange={e => setAdjustProductId(e.target.value)} required>
                                <option value="" disabled>Select a product...</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.quantity} in stock)</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={labelStyle}>Adjustment Value (e.g. -2 for damage)</label>
                            <input style={inputStyle} type="number" value={adjustQty} onChange={e => setAdjustQty(e.target.value)} placeholder="-2 or +1" required />
                        </div>

                        <div>
                            <label style={labelStyle}>Reason</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input style={{ ...inputStyle, flex: 1 }} value={adjustReason} onChange={e => setAdjustReason(e.target.value)} placeholder="Damaged generic box" required />
                                <button type="submit" style={{ ...btnStyle, width: 140, background: 'var(--surf)', border: '1px solid var(--ink)', color: 'var(--ink)' }}>Apply Edit</button>
                            </div>
                        </div>
                    </form>
                </div>

            </div>

            {/* Stock History */}
            <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 12, padding: '24px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', marginBottom: 20 }}>
                    <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18 }}>Movement History</h3>
                    <select 
                        style={{ ...inputStyle, width: 200, padding: '8px 12px' }} 
                        value={selectedProductId} 
                        onChange={e => setSelectedProductId(e.target.value)}
                    >
                        <option value="">All Products</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--mut)' }}>Loading...</div>
                ) : history.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--mut)' }}>No stock history yet</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '12px 24px', borderBottom: '1px solid var(--bdr)', fontSize: 11, color: 'var(--mut)', fontWeight: 600 }}>LOG</th>
                                <th style={{ textAlign: 'left', padding: '12px 24px', borderBottom: '1px solid var(--bdr)', fontSize: 11, color: 'var(--mut)', fontWeight: 600 }}>PRODUCT</th>
                                <th style={{ textAlign: 'left', padding: '12px 24px', borderBottom: '1px solid var(--bdr)', fontSize: 11, color: 'var(--mut)', fontWeight: 600 }}>TIME</th>
                                <th style={{ textAlign: 'right', padding: '12px 24px', borderBottom: '1px solid var(--bdr)', fontSize: 11, color: 'var(--mut)', fontWeight: 600 }}>CHANGE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map(h => {
                                const isPos = h.quantity > 0
                                return (
                                    <tr key={h.id}>
                                        <td style={{ padding: '16px 24px', borderBottom: '1px solid var(--bdr2)' }}>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono', textTransform: 'uppercase',
                                                background: h.type === 'received' ? 'var(--grn-bg)' : h.type === 'sold' ? 'var(--red-bg)' : 'var(--amb-bg)',
                                                color: h.type === 'received' ? 'var(--grn)' : h.type === 'sold' ? 'var(--red)' : 'var(--amb)'
                                            }}>{h.type}</span>
                                        </td>
                                        <td style={{ padding: '16px 24px', borderBottom: '1px solid var(--bdr2)', fontWeight: 600 }}>{h.productName} <div style={{ fontSize: 12, color: 'var(--mut)', fontWeight: 400, marginTop: 4 }}>{h.reason || (h.type === 'sold' ? 'Customer Purchase' : 'Inventory Received')}</div></td>
                                        <td style={{ padding: '16px 24px', borderBottom: '1px solid var(--bdr2)' }}>{new Date(h.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                        <td style={{ padding: '16px 24px', borderBottom: '1px solid var(--bdr2)', textAlign: 'right', fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 14, color: isPos ? 'var(--grn)' : 'var(--red)' }}>
                                            {isPos ? '+' : ''}{h.quantity}
                                        </td>
                                    </tr>
                                )
                            })}
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
