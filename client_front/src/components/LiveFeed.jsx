import { useEffect, useState } from 'react';
import http from '../api/http';
import './LiveFeed.css';

export default function LiveFeed({ items }) {
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await http.get('/auth/me');
        const email = res.data.email;
        setUserEmail(email ? email.split('@')[0] : null);
      } catch {
        setUserEmail(null);
      }
    }
    fetchUser();
  }, []);

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
              <span className="live-feed-user">{userEmail || "Guest"}</span>
              <span className="live-feed-content">{item}</span>
              <time>{new Date().toLocaleTimeString()}</time>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}