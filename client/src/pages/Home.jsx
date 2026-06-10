import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeProfile } from '../api';
import { useToast } from '../components/Toast';

const SUGGESTIONS = ['torvalds', 'gaearon', 'sindresorhus', 'yyx990803', 'antfu'];

export default function Home() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  async function handleSubmit(e) {
    e.preventDefault();
    const name = username.trim();
    if (!name) return;

    setLoading(true);
    try {
      await analyzeProfile(name);
      toast(`Profile @${name} analyzed successfully!`, 'success');
      navigate(`/profile/${name}`);
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Something went wrong';
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleQuickTag(name) {
    setUsername(name);
    setLoading(true);
    analyzeProfile(name)
      .then(() => {
        toast(`Profile @${name} analyzed successfully!`, 'success');
        navigate(`/profile/${name}`);
      })
      .catch((err) => {
        const msg = err.response?.data?.error?.message || err.message;
        toast(msg, 'error');
      })
      .finally(() => setLoading(false));
  }

  return (
    <div className="home-hero">
      <div className="hero-icon">
        <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <circle cx="18" cy="14" r="3" />
          <path d="m20.5 16.5 2.5 2.5" />
        </svg>
      </div>

      <h1 className="hero-title">Analyze GitHub Profiles</h1>
      <p className="hero-subtitle">
        Enter a GitHub username to extract deep metrics, language breakdowns, and repository statistics in a high-performance dashboard.
      </p>

      <div className="search-box">
        <form className="search-form" onSubmit={handleSubmit}>
          <div className="search-input-wrap">
            <span className="icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
              </svg>
            </span>
            <input
              className="input"
              type="text"
              placeholder="Enter GitHub username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>
          <button className="btn btn-primary btn-analyze" type="submit" disabled={loading}>
            {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Analyze ➔'}
          </button>
        </form>

        <div className="quick-tags-container">
          <div className="quick-tags-label">TRY THESE PROFILES</div>
          <div className="quick-tags">
            {SUGGESTIONS.map((name) => (
              <button key={name} className="quick-tag" onClick={() => handleQuickTag(name)} disabled={loading}>
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

