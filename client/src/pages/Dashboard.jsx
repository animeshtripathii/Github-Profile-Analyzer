import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfiles, deleteProfile, formatNumber } from '../api';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

export default function Dashboard() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState('total_stars');
  const [order, setOrder] = useState('desc');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProfiles({ page, limit: 20, sort, order });
      setProfiles(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err) {
      toast('Failed to load profiles', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, sort, order, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteProfile(deleteTarget);
      toast(`@${deleteTarget} deleted`, 'success');
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      toast('Delete failed', 'error');
    }
  }

  return (
    <div>
      {}
      <div className="dashboard-header">
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 700 }}>Analyzed Profiles</h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
            Manage and compare previously analyzed accounts.
          </p>
        </div>

        <div className="dashboard-controls">
          <select className="select" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
            <option value="total_stars">Total Stars</option>
            <option value="followers">Followers</option>
            <option value="public_repos">Repositories</option>
            <option value="username">Username</option>
            <option value="last_analyzed_at">Last Analyzed</option>
          </select>

          <button
            className="btn btn-secondary"
            onClick={() => setOrder((o) => (o === 'desc' ? 'asc' : 'desc'))}
            title="Toggle order"
            style={{ padding: '10px 12px' }}
          >
            {order === 'desc' ? '↓' : '↑'}
          </button>

          <button
            className="btn btn-secondary"
            onClick={fetchData}
            title="Refresh"
            style={{ padding: '10px 12px' }}
          >
            ↻
          </button>
        </div>
      </div>

      {}
      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p style={{ color: 'var(--text-secondary)' }}>Loading profiles...</p>
        </div>
      ) : profiles.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3 style={{ fontSize: 22, fontWeight: 600 }}>No Profiles Analyzed</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            Head to the home page to analyze your first GitHub profile.
          </p>
          <button className="btn btn-gradient" onClick={() => navigate('/')} style={{ marginTop: 12 }}>
            Analyze a Profile
          </button>
        </div>
      ) : (
        <>
          <div className="profile-grid">
            {profiles.map((p) => (
              <div
                key={p.username}
                className="glass-card profile-card"
                onClick={() => navigate(`/profile/${p.username}`)}
              >
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(p.username);
                  }}
                  title="Delete"
                >
                  🗑
                </button>

                <div className="card-header">
                  <img
                    className="card-avatar"
                    src={p.avatar_url || `https://avatars.githubusercontent.com/${p.username}`}
                    alt={p.username}
                    loading="lazy"
                  />
                  <div style={{ overflow: 'hidden' }}>
                    <div className="card-name">{p.name || p.username}</div>
                    <div className="card-username">@{p.username}</div>
                  </div>
                </div>

                <div className="card-stats">
                  <div>
                    <div className="card-stat-label">Stars</div>
                    <div className="card-stat-value">⭐ {formatNumber(p.total_stars)}</div>
                  </div>
                  <div>
                    <div className="card-stat-label">Followers</div>
                    <div className="card-stat-value">{formatNumber(p.followers)}</div>
                  </div>
                  <div>
                    <div className="card-stat-label">Repos</div>
                    <div className="card-stat-value">{formatNumber(p.public_repos)}</div>
                  </div>
                  <div>
                    <div className="card-stat-label">Language</div>
                    <div className="card-stat-value" style={{ fontSize: 13 }}>
                      {p.top_language || p.top_languages?.[0]?.language || '—'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {}
          <div className="pagination">
            <button className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              ← Prev
            </button>
            <span className="page-info">
              Page {page} of {totalPages}
            </span>
            <button className="btn btn-secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next →
            </button>
          </div>
        </>
      )}

      {}
      {deleteTarget && (
        <ConfirmModal
          username={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
