import React, { useState } from 'react';
import Papa from 'papaparse';
import { addProduct } from '../api/client';

const Products = () => {
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);

    // Single Add State
    const [barcode, setBarcode] = useState('');
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addProduct({ barcode, name, price: parseFloat(price), storeId: 1 });
            setMsg('Product added successfully!');
            setBarcode(''); setName(''); setPrice('');
        } catch (err) {
            setMsg('Error adding product');
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    // Expected columns: barcode, name, price
                    // Transform if needed (price to float, storeId defaults to 1)
                    const products = results.data.map((row: any) => ({
                        barcode: row.barcode,
                        name: row.name,
                        price: parseFloat(row.price),
                        storeId: 1
                    })).filter((p: any) => p.barcode && p.name && p.price); // Basic validation

                    if (products.length === 0) {
                        setMsg('No valid products found in CSV');
                        setLoading(false);
                        return;
                    }

                    await addProduct(products); // Bulk API call
                    setMsg(`Successfully uploaded ${products.length} products`);
                } catch (err) {
                    console.error(err);
                    setMsg('Error uploading products');
                } finally {
                    setLoading(false);
                    e.target.value = ''; // Reset input
                }
            },
            error: (err) => {
                console.error(err);
                setMsg('Error parsing CSV');
                setLoading(false);
            }
        });
    };

    return (
        <div>
            <div className="header">
                <h1>Products</h1>
            </div>

            <div className="grid-3">
                {/* Single Add Form */}
                <div className="card">
                    <h3>Add New Product</h3>
                    <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Barcode</label>
                            <input value={barcode} onChange={e => setBarcode(e.target.value)} required />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Name</label>
                            <input value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Price</label>
                            <input type="number" value={price} onChange={e => setPrice(e.target.value)} required />
                        </div>
                        <button className="btn" type="submit">Add Product</button>
                    </form>
                </div>

                {/* Bulk Upload */}
                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <h3>Bulk Upload (CSV)</h3>
                    <p style={{ color: '#9CA3AF', marginBottom: '20px' }}>
                        Upload a CSV with headers: <code>barcode, name, price</code>
                    </p>

                    <div style={{
                        border: '2px dashed #374151', padding: '40px', borderRadius: '8px', textAlign: 'center',
                        position: 'relative'
                    }}>
                        {loading ? 'Uploading...' : 'Click to Select CSV'}
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            style={{
                                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                opacity: 0, cursor: 'pointer'
                            }}
                        />
                    </div>
                    {msg && <p style={{ marginTop: '15px', color: msg.includes('Error') ? '#EF4444' : '#10B981' }}>{msg}</p>}
                </div>
            </div>
        </div>
    );
};

export default Products;
