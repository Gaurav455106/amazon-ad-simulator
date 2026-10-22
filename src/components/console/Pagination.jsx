import { ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZES = [25, 50, 100, 300];

/** Console table footer: "Results per page" + "1-50 of 250 results" + arrows. */
export default function Pagination({ total, page, pageSize, onPage, onPageSize }) {
  const first = total === 0 ? 0 : page * pageSize + 1;
  const last = Math.min(total, (page + 1) * pageSize);
  const lastPage = Math.max(0, Math.ceil(total / pageSize) - 1);
  return (
    <div className="cx-table-footer">
      <label className="pg-size">
        Results per page:
        <select value={pageSize} onChange={e => { onPageSize(Number(e.target.value)); onPage(0); }}>
          {PAGE_SIZES.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
      <span>{first}-{last} of {total} results</span>
      <button type="button" className="cx-tool-btn" disabled={page === 0} onClick={() => onPage(page - 1)} aria-label="Navigate to previous page">
        <ChevronLeft size={16} />
      </button>
      <button type="button" className="cx-tool-btn" disabled={page >= lastPage} onClick={() => onPage(page + 1)} aria-label="Navigate to next page">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
