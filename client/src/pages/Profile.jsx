import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProfile, refreshProfile, deleteProfile, formatNumber, formatDate, getLangColor } from '../api';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

export default function Profile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    setLoading(true);
    setError(null);
    getProfile(username)
      .then((res) => setProfile(res.data))
      .catch((err) => {
        const msg = err.response?.data?.error?.message || 'Profile not found';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [username]);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const res = await refreshProfile(username);
      setProfile(res.data);
      toast('Profile refreshed!', 'success');
    } catch (err) {
      toast('Refresh failed', 'error');
    } finally {
      setRefreshing(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteProfile(username);
      toast(`@${username} deleted`, 'success');
      navigate('/dashboard');
    } catch (err) {
      toast('Delete failed', 'error');
    }
  }

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <p style={{ color: 'var(--text-secondary)' }}>Analyzing profile data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <div style={{ fontSize: 48 }}>❌</div>
        <h3 style={{ fontSize: 22, fontWeight: 600 }}>Analysis Failed</h3>
        <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
        <button className="btn btn-gradient" onClick={() => navigate('/')} style={{ marginTop: 12 }}>
          Return Home
        </button>
      </div>
    );
  }

  const p = profile;
  const langs = p.top_languages || [];
  const totalLangRepos = langs.reduce((sum, l) => sum + l.repo_count, 0);

  return (
    <div>
      {}
      <div className="profile-top-bar">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? '↻ Refreshing...' : '↻ Refresh'}
          </button>
          <button className="btn btn-danger" onClick={() => setShowDelete(true)}>
            🗑 Delete
          </button>
        </div>
      </div>

      {}
      <div className="glass-card no-hover profile-hero">
        <img
          className="detail-avatar"
          src={p.avatar_url || `https://avatars.githubusercontent.com/${p.username}`}
          alt={p.username}
        />
        <div className="detail-info">
          <h2 className="detail-name">{p.name || p.username}</h2>
          <a
            className="detail-username-link"
            href={p.profile_url || `https://github.com/${p.username}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            @{p.username}
          </a>
          {p.bio && <p className="detail-bio">{p.bio}</p>}
          <div className="detail-meta">
            {p.location && (
              <span className="meta-item">📍 {p.location}</span>
            )}
            <span className="meta-item">📅 Joined {formatDate(p.account_created_at)}</span>
            <span className="meta-item">🔄 Analyzed {formatDate(p.last_analyzed_at)}</span>
          </div>
        </div>
      </div>

      {}
      <div className="stats-grid">
        <StatCard label="Followers" value={formatNumber(p.followers)} icon="👥" />
        <StatCard label="Following" value={formatNumber(p.following)} icon="➕" />
        <StatCard label="Public Repos" value={formatNumber(p.public_repos)} icon="📂" />
        <StatCard label="Total Stars" value={formatNumber(p.total_stars)} icon="⭐" accent />
        <StatCard label="Total Forks" value={formatNumber(p.total_forks)} icon="🔱" />
        <StatCard
          label="Original Repos"
          value={p.original_repos}
          sub={p.public_repos > 0 ? `(${Math.round((p.original_repos / p.public_repos) * 100)}%)` : ''}
          icon="💻"
        />
        <StatCard
          label="Forked Repos"
          value={p.forked_repos}
          sub={p.public_repos > 0 ? `(${Math.round((p.forked_repos / p.public_repos) * 100)}%)` : ''}
          icon="🔀"
        />
        <StatCard label="Follow Ratio" value={p.follower_to_repo_ratio} icon="⚖️" />
      </div>

      {}
      <div className="detail-bottom">
        {}
        <div className="glass-card no-hover featured-repo">
          <div className="featured-repo-title">🏆 Most Starred Repo</div>
          {p.most_starred_repo ? (
            <>
              <div className="featured-repo-name">{p.most_starred_repo}</div>
              <div className="featured-repo-stats">
                <span className="repo-stat" style={{ color: 'var(--star-gold)' }}>
                  ⭐ {formatNumber(p.total_stars)}
                </span>
                <span className="repo-stat">🔱 {formatNumber(p.total_forks)}</span>
                {langs[0] && (
                  <span className="repo-stat">
                    <span className="lang-dot" style={{ background: getLangColor(langs[0].language) }} />
                    {langs[0].language}
                  </span>
                )}
              </div>
            </>
          ) : (
            <p style={{ color: 'var(--text-muted)', marginTop: 20, textAlign: 'center' }}>
              No repositories found.
            </p>
          )}
        </div>

        {}
        <div className="glass-card no-hover languages-card">
          <div className="featured-repo-title">🧑‍💻 Language Distribution</div>
          {langs.length > 0 ? (
            <>
              <div className="lang-pills">
                {langs.map((l) => (
                  <span className="lang-pill" key={l.language}>
                    <span className="lang-dot" style={{ background: getLangColor(l.language) }} />
                    {l.language}
                    <span className="lang-count">{l.repo_count}</span>
                  </span>
                ))}
              </div>
              <div className="lang-bar">
                {langs.map((l) => (
                  <div
                    key={l.language}
                    className="lang-bar-segment"
                    style={{
                      width: `${(l.repo_count / totalLangRepos) * 100}%`,
                      background: getLangColor(l.language),
                    }}
                    title={`${l.language}: ${l.repo_count} repos`}
                  />
                ))}
              </div>
            </>
          ) : (
            <p style={{ color: 'var(--text-muted)', marginTop: 20, textAlign: 'center' }}>
              No language data available.
            </p>
          )}
        </div>
      </div>

      {}
      {showDelete && (
        <ConfirmModal
          username={username}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, icon, accent, sub }) {
  return (
    <div className="glass-card no-hover stat-card">
      <div className="stat-header">
        <span className="stat-label">{label}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <div className={`stat-value ${accent ? 'accent' : ''}`}>
        {value}
        {sub && <span className="stat-sub">{sub}</span>}
      </div>
    </div>
  );
}
