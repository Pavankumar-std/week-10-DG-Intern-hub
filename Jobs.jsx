import { useState, useEffect, useMemo, useCallback } from 'react';
import JobFilter from '../components/JobFilter';
import JobCard from '../components/JobCard';
import Pagination from '../components/Pagination';
import { SkeletonGrid } from '../components/Loader';
import { ErrorState, EmptyState } from '../components/StateViews';
import useDebounce from '../hooks/useDebounce';
import useAuth from '../hooks/useAuth';
import useApp from '../hooks/useApp';
import { jobsApi, getErrorMessage } from '../services/api';

const EMPTY_FILTERS = { q: '', location: '', company: '', skills: '', experience: '', type: '', workMode: '', minSalary: '' };

export default function Jobs() {
  const { user } = useAuth();
  const { savedIds, toggleSaved } = useApp();

  const [filters, setFilters] = useState(EMPTY_FILTERS);   // what the user is typing
  const [applied, setApplied] = useState(EMPTY_FILTERS);   // what we actually search with
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  const [result, setResult] = useState({ jobs: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);            // bump to "Try Again"

  // DEBOUNCE: wait 500ms after the user stops typing before searching
  const debouncedFilters = useDebounce(filters, 500);
  useEffect(() => {
    setApplied(debouncedFilters);
    setPage(1);
  }, [debouncedFilters]);

  // useMemo: build the query only when something changes
  const params = useMemo(() => {
    const p = { sort, page, limit: 6 };
    Object.entries(applied).forEach(([k, v]) => { if (v !== '') p[k] = v; });
    return p;
  }, [applied, sort, page]);

  // Fetch jobs whenever the query changes
  useEffect(() => {
    let cancelled = false; // ignore old responses if a newer search started
    setLoading(true);
    setError('');
    jobsApi.getAll(params)
      .then(({ data }) => { if (!cancelled) setResult(data); })
      .catch((err) => { if (!cancelled) setError(getErrorMessage(err)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [params, reloadKey]);

  // useCallback: keeps the same function between renders so memo(JobCard) works
  const handleSearchNow = useCallback(() => { setApplied(filters); setPage(1); }, [filters]);
  const handleReset = useCallback(() => { setFilters(EMPTY_FILTERS); setApplied(EMPTY_FILTERS); setPage(1); }, []);
  const handleToggleSave = useCallback((id) => toggleSaved(id), [toggleSaved]);

  return (
    <div>
      <div className="hero">
        <h1>Find your next job or internship</h1>
        <p className="muted">Search by title, skill, location and more.</p>
      </div>

      <JobFilter filters={filters} onChange={setFilters} onSearch={handleSearchNow} onReset={handleReset} />

      <div className="results-bar">
        <p className="muted">{loading ? 'Searching...' : `${result.total} job${result.total === 1 ? '' : 's'} found`}</p>
        <div className="sort-box">
          <label htmlFor="sort">Sort by</label>
          <select id="sort" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="salaryLow">Salary: Low → High</option>
            <option value="salaryHigh">Salary: High → Low</option>
            <option value="relevant">Most Relevant</option>
          </select>
        </div>
      </div>

      {loading && <SkeletonGrid />}
      {!loading && error && <ErrorState message="Unable to load jobs." onRetry={() => setReloadKey((k) => k + 1)} />}
      {!loading && !error && result.jobs.length === 0 && (
        <EmptyState title="No jobs found." hint="Try changing your search filters."
          action={<button className="btn btn-ghost" onClick={handleReset}>Clear filters</button>} />
      )}
      {!loading && !error && result.jobs.length > 0 && (
        <div className="job-grid">
          {result.jobs.map((job) => (
            <JobCard key={job.id} job={job} showSave={user?.role === 'candidate'}
              saved={savedIds.includes(job.id)} onToggleSave={handleToggleSave} />
          ))}
        </div>
      )}

      {!loading && !error && <Pagination page={page} pages={result.pages} onChange={setPage} />}
    </div>
  );
}
