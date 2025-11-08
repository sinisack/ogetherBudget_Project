import './LiveFeed.css';

export default function LiveFeed({ items }) {
  return (
    <div className="live-feed">
      <h3>Live Feed (활동 피드)</h3>
      {items.length === 0 ? (
        <p style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
          아직 활동이 없습니다.
        </p>
      ) : (
        <ul>
          {items.map((item, i) => (
            <li key={i}>
              <time>{new Date().toLocaleTimeString()}</time>
              <p>{item}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}