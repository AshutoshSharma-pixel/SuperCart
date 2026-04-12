import { useState, useEffect } from 'react'
import api from '../api/client'
import type { Product } from '../types'
import Badge from '../components/Badge'
import BarcodeScanner from '../components/BarcodeScanner'

export default function Products() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [showScanner, setShowScanner] = useState(false)

    // Add Form State
    const [barcodeValue, setBarcodeValue] = useState('')
    const [productName, setProductName] = useState('')
    const [price, setPrice] = useState('')
    const [initialStock, setInitialStock] = useState('')
    const [threshold, setThreshold] = useState('5')

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products/store')
            setProducts(data || [])
        } catch (err) {
            console.error('Failed to load products:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchProducts() }, [])

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!barcodeValue || !productName || !price || !initialStock) return alert('Fill required fields')

        try {
            await api.post('/products', {
                barcode: barcodeValue,
                name: productName,
                price,
                quantity: parseInt(initialStock),
                lowStockThreshold: parseInt(threshold)
            })
            // Reset form
            setBarcodeValue('')
            setProductName('')
            setPrice('')
            setInitialStock('')
            fetchProducts()
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to add product')
        }
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm('Delete this product?')) return
        try {
            await api.delete(`/products/${id}`)
            fetchProducts()
        } catch (err) {
            alert('Failed to delete')
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {showScanner && (
                <BarcodeScanner
                    onDetected={(barcode) => {
                        setBarcodeValue(barcode)
                        setShowScanner(false)
                    }}
                    onClose={() => setShowScanner(false)}
                />
            )}

            {/* Add Product Form */}
            <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 12, padding: 24 }}>
                <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Add New Product</h3>
                <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Barcode</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input style={inputStyle} value={barcodeValue} onChange={e => setBarcodeValue(e.target.value)} placeholder="8901234567890" required />
                                <button type="button" onClick={() => setShowScanner(true)} style={{ ...btnStyle, background: 'var(--bg)', color: 'var(--ink)' }}>📷 Scan</button>
                            </div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Product Name</label>
                            <input style={inputStyle} value={productName} onChange={e => setProductName(e.target.value)} placeholder="e.g. Diet Coke 300ml" required />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Price (₹)</label>
                            <input style={inputStyle} type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="45.00" required />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Initial Stock</label>
                            <input style={inputStyle} type="number" value={initialStock} onChange={e => setInitialStock(e.target.value)} placeholder="0" required />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Low Stock Threshold</label>
                            <input style={inputStyle} type="number" value={threshold} onChange={e => setThreshold(e.target.value)} required />
                        </div>
                        <div style={{ flex: 1 }}>
                            <button type="submit" style={{ ...btnStyle, width: '100%', background: 'var(--accent)', color: 'white' }}>+ Add Product</button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Product Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
                {loading ? (
                    <div style={{ padding: 40, color: 'var(--mut)' }}>Loading catalog...</div>
                ) : products.map(p => (
                    <div key={p.id} style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--mut)' }}>{p.barcode}</div>
                            <Badge type={p.quantity === 0 ? 'error' : p.quantity <= p.lowStockThreshold ? 'warning' : 'success'}>
                                {p.quantity === 0 ? 'OUT OF STOCK' : p.quantity <= p.lowStockThreshold ? 'LOW STOCK' : 'IN STOCK'}
                            </Badge>
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--ink)' }}>{p.name}</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 20 }}>
                            <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 22, color: 'var(--ink)' }}>₹{p.price}</div>
                            {p.isDiscountActive && p.discountValue && (
                                <Badge type="info">{p.discountType === 'PERCENTAGE' ? `${p.discountValue}% OFF` : `₹${p.discountValue} OFF`}</Badge>
                            )}
                        </div>

                        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--bdr2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: 13, color: 'var(--ink2)' }}><strong style={{ color: 'var(--ink)' }}>{p.quantity}</strong> in stock</div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button style={{ background: 'none', border: 'none', color: 'var(--blu)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                                <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink2)', marginBottom: 6 }
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--bdr)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none' }
const btnStyle: React.CSSProperties = { padding: '10px 16px', border: '1px solid var(--bdr)', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', outline: 'none' }
