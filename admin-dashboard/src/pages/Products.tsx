const Products = () => {
    return (
        <div>
            <div className="header">
                <h1>Global Products Ledger</h1>
                <p className="subtitle">Platform-wide item catalog and price index</p>
            </div>

            <div className="card empty-state" style={{ padding: '4rem', marginTop: '2rem' }}>
                <span style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }}>📦</span>
                <h3>Global Catalog Coming Soon</h3>
                <p className="text-muted">
                    Store-specific product management is currently handled exclusively through the Store Portal.
                    Global aggregation read-views will be available in V2.
                </p>
            </div>
        </div>
    );
};
export default Products;
