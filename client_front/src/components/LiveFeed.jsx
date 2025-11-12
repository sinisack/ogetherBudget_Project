import { useEffect, useState } from 'react';
import http from '../api/http';
import './LiveFeed.css';

export default function LiveFeed({ items = [] }) {
  const [userEmail, setUserEmail] = useState(null);
  const [visibleStart, setVisibleStart] = useState(0);

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

  const visibleItems = items.slice(visibleStart, visibleStart + 10);

  const handleNext = () => {
    if (visibleStart + 10 < items.length) {
      setVisibleStart((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (visibleStart > 0) {
      setVisibleStart((prev) => prev - 1);
    }
  };

  return (
    <div className="live-feed">
      <h3>활동 피드</h3>
      {items.length === 0 ? (
        <p style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
          아직 활동이 없습니다.
        </p>
      ) : (
        <>
          <ul>
            {visibleItems.map((item, i) => (
              <li key={i + visibleStart}>
                <span className="live-feed-content">{item}</span>
                <time>{new Date().toLocaleTimeString()}</time>
              </li>
            ))}
          </ul>

          {items.length > 10 && (
            <div className="feed-nav">
              <button
                className="arrow-btn"
                onClick={handlePrev}
                disabled={visibleStart === 0}
              >
                ▲
              </button>
              <button
                className="arrow-btn"
                onClick={handleNext}
                disabled={visibleStart + 10 >= items.length}
              >
                ▼
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}