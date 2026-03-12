export default function Badge({ children, type = 'default' }: { children: React.ReactNode, type?: 'success' | 'warning' | 'error' | 'info' | 'default' }) {
    const getColors = () => {
        switch (type) {
            case 'success': return { bg: 'var(--grn-bg)', color: 'var(--grn)', border: '1px solid var(--grn-bdr)' }
            case 'warning': return { bg: 'var(--amb-bg)', color: 'var(--amb)', border: '1px solid var(--amb-bdr)' }
            case 'error': return { bg: 'var(--red-bg)', color: 'var(--red)', border: '1px solid var(--red-bdr)' }
            case 'info': return { bg: 'var(--blu-bg)', color: 'var(--blu)', border: '1px solid var(--blu-bdr)' }
            default: return { bg: 'rgba(136,144,170,0.1)', color: 'var(--mut)', border: '1px solid rgba(136,144,170,0.2)' }
        }
    }
    return (
        <span style={{ padding: '4px 8px', borderRadius: 100, fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono', ...getColors() }}>
            {children}
        </span>
    )
}
