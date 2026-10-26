// A single number card:  Applied Jobs  12
export default function StatCard({ label, value, tone = 'blue' }) {
  return (
    <div className={`card stat-card tone-${tone}`}>
      <span className="stat-value">{value ?? '–'}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
