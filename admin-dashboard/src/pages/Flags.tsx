import { useEffect, useState } from 'react';
import api from '../api/client';

const Flags = () => {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        api.get('/admin/flags')
            .then(res => setData(res.data))
            .catch(console.error);
    }, []);

    return (
        <div>
            <div className="header">
                <h1>Flagged Sessions</h1>
            </div>
            <div className="card">
                <table>
                    <thead>
                        <tr>
                            <th>Session ID</th>
                            <th>Date</th>
                            <th>User</th>
                            <th>Trust Score</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 && <tr><td colSpan={5}>No flagged sessions found.</td></tr>}
                        {data.map((item: any) => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{new Date(item.updatedAt).toLocaleString()}</td>
                                <td>{item.user?.phone}</td>
                                <td style={{ color: '#EF4444', fontWeight: 'bold' }}>{item.user?.trustScore}</td>
                                <td>₹{item.totalAmount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default Flags;
