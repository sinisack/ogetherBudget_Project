export default function LiveFeed({ items }) {
    return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--color-border)', paddingBottom: 8, color: 'var(--color-accent)' }}>
                ⚡ Live Feed (활동 피드)
            </h3>
            <div style={{ flexGrow: 1, overflowY: 'auto' }}>
                {items.length === 0 ? (
                    <p style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                        아직 활동이 없습니다.
                    </p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {items.map((item, index) => (
                            <li key={index} style={{ marginBottom: 10, borderBottom: '1px dotted #333', paddingBottom: 5 }}>
                                <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'block' }}>
                                    {new Date().toLocaleTimeString()}
                                </span>
                                <p style={{ margin: 0, color: 'var(--color-text-primary)' }}>{item}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}