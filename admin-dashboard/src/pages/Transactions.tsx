import { useEffect, useState } from 'react';
import api from '../api/client';

const Transactions = () => {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        api.get('/admin/transactions')
            .then(res => setData(res.data))
            .catch(console.error);
    }, []);

    return (
        <div>
            <div className="header">
                <h1>Transactions</h1>
            </div>
            <div className="card">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Date</th>
                            <th>Store</th>
                            <th>User ID</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item: any) => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{new Date(item.updatedAt).toLocaleString()}</td>
                                <td>{item.store?.name}</td>
                                <td>{item.user?.phone}</td>
                                <td style={{ fontWeight: 'bold' }}>₹{item.totalAmount}</td>
                                <td>
                                    <span className={`badge ${item.status === 'PAID' ? 'active' : item.status === 'FLAGGED' ? 'flagged' : ''}`}>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default Transactions;
