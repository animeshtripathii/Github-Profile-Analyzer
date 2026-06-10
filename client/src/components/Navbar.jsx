import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { checkHealth } from '../api';

export default function Navbar() {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    checkHealth()
      .then(() => setOnline(true))
      .catch(() => setOnline(false));

    const interval = setInterval(() => {
      checkHealth()
        .then(() => setOnline(true))
        .catch(() => setOnline(false));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="28" height="28" rx="6" fill="url(#grad)" />
            <path d="M14 5C9.03 5 5 9.03 5 14c0 3.98 2.58 7.35 6.15 8.54.45.08.61-.19.61-.43v-1.54c-2.5.54-3.03-1.2-3.03-1.2-.41-1.04-1-1.31-1-1.31-.82-.56.06-.55.06-.55.9.06 1.38.93 1.38.93.8 1.37 2.1.97 2.61.74.08-.58.31-.97.57-1.2-2-.23-4.1-1-4.1-4.45 0-.98.35-1.79.93-2.42-.09-.23-.4-1.15.09-2.39 0 0 .76-.24 2.48.93a8.6 8.6 0 0 1 4.52 0c1.72-1.17 2.48-.93 2.48-.93.49 1.24.18 2.16.09 2.39.58.63.93 1.44.93 2.42 0 3.46-2.11 4.22-4.12 4.44.32.28.61.83.61 1.67v2.47c0 .24.16.52.62.43C20.42 21.35 23 17.98 23 14c0-4.97-4.03-9-9-9z" fill="#fff"/>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="28" y2="28">
                <stop stopColor="#10b981" />
                <stop offset="1" stopColor="#059669" />
              </linearGradient>
            </defs>
          </svg>
          GitHub Profile Analyzer
        </NavLink>

        <div className="navbar-links-group">
          <div className="navbar-links">
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Home
            </NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Dashboard
            </NavLink>
          </div>
          
          <div className="navbar-status-wrap" title={online ? 'API Online' : 'API Offline'}>
            <span className={`status-badge ${online ? 'online' : 'offline'}`}>
              <span className="status-dot">●</span> Status
            </span>
            <span className="status-signal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={online ? "#10b981" : "#f85149"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h.01" />
                <path d="M8.5 16.5a5 5 0 0 1 7 0" />
                <path d="M5 13a10 10 0 0 1 14 0" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}

