import { memo } from 'react';
import { Link } from 'react-router-dom';
import { formatSalary, formatDate } from '../utils/helpers';

// React.memo = "don't redraw this card unless its props changed".
// With many cards on screen this keeps the page fast.
function JobCard({ job, saved, onToggleSave, showSave }) {
  return (
    <article className="card job-card">
      <div className="job-top">
        <div>
          <h3><Link to={`/jobs/${job.id}`}>{job.title}</Link></h3>
          <p className="muted">{job.company} • {job.location}</p>
        </div>
        {showSave && (
          <button className={`icon-btn save-btn ${saved ? 'saved' : ''}`} onClick={() => onToggleSave(job.id)}
            aria-label={saved ? 'Unsave job' : 'Save job'} title={saved ? 'Unsave job' : 'Save job'}>
            {saved ? '★' : '☆'}
          </button>
        )}
      </div>

      <div className="chips">
        <span className="badge badge-blue">{job.type}</span>
        <span className="badge badge-gray">{job.workMode}</span>
        <span className="badge badge-gray">{job.experience === 0 ? 'Fresher' : `${job.experience}+ yrs`}</span>
        {job.matchScore !== undefined && <span className="badge badge-green">{job.matchScore}% match</span>}
      </div>

      <div className="chips skills">
        {job.skills.map((s) => <span key={s} className="skill">{s}</span>)}
      </div>

      <div className="job-bottom">
        <strong>{formatSalary(job.salary)}</strong>
        <small className="muted">Posted {formatDate(job.createdAt)}</small>
      </div>
    </article>
  );
}

export default memo(JobCard);
