import { STATUS_STEPS } from '../utils/helpers';

// Applied → Under Review → Shortlisted → Interview → Selected / Rejected
export default function StatusTracker({ status }) {
  if (status === 'Rejected') {
    return <div className="tracker"><span className="step done">Applied</span><span className="step rejected">Rejected</span></div>;
  }
  const current = STATUS_STEPS.indexOf(status);
  return (
    <div className="tracker">
      {STATUS_STEPS.map((s, i) => (
        <span key={s} className={`step ${i <= current ? 'done' : ''} ${i === current ? 'now' : ''}`}>{s}</span>
      ))}
    </div>
  );
}
