import { useEffect, useState } from 'react';
import { getStats } from '../api/client';

const Home = () => {
    const [stats, setStats] = useState({ totalSales: 0, activeSessions: 0, flaggedUsers: 0 });

    useEffect(() => {
        getStats().then(res => setStats(res.data));
    }, []);

    return (
        <div>
            <div className="header">
                <h1>Dashboard</h1>
            </div>

            <div className="grid-3">
                <div className="card">
                    <div className="stat-label">Total Sales Today</div>
                    <div className="stat-value">₹{stats.totalSales}</div>
                </div>
                <div className="card">
                    <div className="stat-label">Active Sessions</div>
                    <div className="stat-value">{stats.activeSessions}</div>
                </div>
                <div className="card">
                    <div className="stat-label">Flagged Users</div>
                    <div className="stat-value" style={{ color: '#EF4444' }}>{stats.flaggedUsers}</div>
                </div>
            </div>

            <div className="card">
                <h3>Recent Activity</h3>
                <p style={{ color: '#9CA3AF' }}>No recent activity to show.</p>
            </div>
        </div>
    );
};

export default Home;
