// All search + filter inputs (Task 4). It is a "controlled" component:
// the parent page owns the values; we just call onChange.
export default function JobFilter({ filters, onChange, onSearch, onReset }) {
  const set = (field) => (e) => onChange({ ...filters, [field]: e.target.value });

  return (
    <form className="card filter-box" onSubmit={(e) => { e.preventDefault(); onSearch(); }}>
      <div className="filter-grid">
        <div className="field wide">
          <label htmlFor="q">Job title, skill or company</label>
          <input id="q" placeholder="e.g. React Developer" value={filters.q} onChange={set('q')} />
        </div>
        <div className="field">
          <label htmlFor="location">Location</label>
          <input id="location" placeholder="e.g. Remote, Pune" value={filters.location} onChange={set('location')} />
        </div>
        <div className="field">
          <label htmlFor="company">Company</label>
          <input id="company" placeholder="e.g. TechNova" value={filters.company} onChange={set('company')} />
        </div>
        <div className="field">
          <label htmlFor="skills">Skills (comma separated)</label>
          <input id="skills" placeholder="e.g. React, Node.js" value={filters.skills} onChange={set('skills')} />
        </div>
        <div className="field">
          <label htmlFor="experience">Experience</label>
          <select id="experience" value={filters.experience} onChange={set('experience')}>
            <option value="">Any</option>
            <option value="0">Fresher (0 yrs)</option>
            <option value="2">Up to 2 years</option>
            <option value="5">Up to 5 years</option>
            <option value="10">Up to 10 years</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="type">Job type</label>
          <select id="type" value={filters.type} onChange={set('type')}>
            <option value="">All</option>
            <option>Internship</option>
            <option>Full-time</option>
            <option>Part-time</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="workMode">Remote / On-site</label>
          <select id="workMode" value={filters.workMode} onChange={set('workMode')}>
            <option value="">All</option>
            <option>Remote</option>
            <option>On-site</option>
            <option>Hybrid</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="minSalary">Minimum salary (₹/month)</label>
          <select id="minSalary" value={filters.minSalary} onChange={set('minSalary')}>
            <option value="">Any</option>
            <option value="10000">₹10,000+</option>
            <option value="25000">₹25,000+</option>
            <option value="50000">₹50,000+</option>
            <option value="80000">₹80,000+</option>
          </select>
        </div>
      </div>
      <div className="filter-actions">
        <button type="submit" className="btn btn-primary">Search Jobs</button>
        <button type="button" className="btn btn-ghost" onClick={onReset}>Clear filters</button>
      </div>
    </form>
  );
}
