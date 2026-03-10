const Users = () => {
    return (
        <div>
            <div className="header">
                <h1>Customer Identity Directory</h1>
                <p className="subtitle">Global user graph and verified trust metrics</p>
            </div>

            <div className="card empty-state" style={{ padding: '4rem', marginTop: '2rem' }}>
                <span style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }}>🛡️</span>
                <h3>User Identity Verification Coming Soon</h3>
                <p className="text-muted">
                    Direct manipulation of customer Trust Scores and global bans is restricted.
                    Read-only global user tables will be deployed in the upcoming security patch.
                </p>
            </div>
        </div>
    );
};
export default Users;
