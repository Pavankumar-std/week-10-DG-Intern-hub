// Error + empty states (Task 11) - never leave a blank screen!
export function ErrorState({ message = 'Unable to load data.', onRetry }) {
  return (
    <div className="card state-box">
      <h3>⚠ {message}</h3>
      <p className="muted">Check your internet or make sure the backend is running.</p>
      {onRetry && <button className="btn btn-primary" onClick={onRetry}>Try Again</button>}
    </div>
  );
}

export function EmptyState({ title = 'Nothing here yet.', hint, action }) {
  return (
    <div className="card state-box">
      <h3>{title}</h3>
      {hint && <p className="muted">{hint}</p>}
      {action}
    </div>
  );
}
