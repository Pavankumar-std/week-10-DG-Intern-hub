// Loading helpers: a spinner and "skeleton" placeholders (grey boxes that pulse).
export function Spinner({ text = 'Loading...' }) {
  return (
    <div className="center-box" role="status">
      <div className="spinner" />
      <p className="muted">{text}</p>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="job-grid" aria-label="Loading jobs">
      {Array.from({ length: count }).map((_, i) => (
        <div className="card skeleton-card" key={i}>
          <div className="skeleton sk-title" />
          <div className="skeleton sk-line" />
          <div className="skeleton sk-line short" />
          <div className="skeleton sk-chips" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonRows({ rows = 4 }) {
  return (
    <div className="card">
      {Array.from({ length: rows }).map((_, i) => (
        <div className="skeleton sk-row" key={i} />
      ))}
    </div>
  );
}

export default Spinner;
