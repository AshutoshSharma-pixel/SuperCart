

const Users = () => {
    // Mock data for UI
    const users = [
        { id: 1, phone: '9999999999', trustScore: 100, status: 'Active' },
        { id: 2, phone: '9876543210', trustScore: 45, status: 'Flagged' },
        { id: 3, phone: '8888888888', trustScore: 92, status: 'Active' },
    ];

    return (
        <div>
            <div className="header">
                <h1>Customers</h1>
            </div>

            <div className="card">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Phone</th>
                            <th>Trust Score</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.phone}</td>
                                <td>
                                    <div style={{
                                        width: '100%',
                                        maxWidth: '100px',
                                        height: '8px',
                                        background: '#374151',
                                        borderRadius: '4px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${user.trustScore}%`,
                                            height: '100%',
                                            background: user.trustScore > 80 ? '#10B981' : user.trustScore > 50 ? '#F59E0B' : '#EF4444'
                                        }} />
                                    </div>
                                </td>
                                <td>
                                    <span className={`badge ${user.status === 'Flagged' ? 'flagged' : 'active'}`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td>
                                    <button className="btn" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>View History</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Users;
