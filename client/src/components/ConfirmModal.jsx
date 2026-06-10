export default function ConfirmModal({ username, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title" style={{ color: 'var(--error)' }}>⚠ Confirm Deletion</h3>
        <p className="modal-body">
          Are you sure you want to remove <strong style={{ color: 'var(--text-primary)' }}>@{username}</strong> from
          the dashboard? This action cannot be undone.
        </p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Delete Profile</button>
        </div>
      </div>
    </div>
  );
}
