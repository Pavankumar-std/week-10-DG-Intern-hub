// ← Previous   1 2 3 4 5   Next →
export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;

  // Show at most 5 page numbers around the current page
  const start = Math.max(1, Math.min(page - 2, pages - 4));
  const end = Math.min(pages, start + 4);
  const numbers = [];
  for (let i = start; i <= end; i++) numbers.push(i);

  return (
    <nav className="pagination" aria-label="Pagination">
      <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => onChange(page - 1)}>← Previous</button>
      {numbers.map((n) => (
        <button key={n} className={`page-num ${n === page ? 'active' : ''}`} onClick={() => onChange(n)}>{n}</button>
      ))}
      <button className="btn btn-ghost btn-sm" disabled={page === pages} onClick={() => onChange(page + 1)}>Next →</button>
    </nav>
  );
}
