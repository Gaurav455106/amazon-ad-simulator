import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Search } from 'lucide-react';
import Info from '../InfoGlyph';
import Pagination from '../Pagination';
import TableDateButton from '../TableDateButton';
import { FilterMenu, FilterRow } from './FilterControls';
import { ViewMenu, ColumnsMenu, ExportMenu, TableSettings, BulkActionsMenu } from './ToolbarMenus';
import ColumnsModal from './ColumnsModal';
import { applyFilters } from './tableFilters';
import { useTablePrefs } from './useTablePrefs';
import { toCsv, csvFileName, downloadCsv } from './tableCsv';

const DEFAULT_PAGE_SIZE = 50;

/**
 * A console table with the full toolbar: filters, search, bulk actions, View, Columns, date, settings and Export.
 *
 * Column: { key, label, group?, fixed?, isDefault?, num?, info?, cell(row), csv(row), sortValue?(row), total?(rows) }
 * Fixed columns always show; others show when listed in the student's saved columns (or `isDefault`).
 *
 * @param {{ tableKey: string, exportName: string, columns: object[], rows: object[], rowKey: (row: object) => string,
 *   filterFields?: object[], initialFilters?: object[], extraFilterPills?: object[],
 *   search?: { placeholder: string, match: (row: object, q: string) => boolean },
 *   leftActions?: import('react').ReactNode, bulkSections?: (rows: object[], clear: () => void) => object[],
 *   showDate?: boolean, showSettings?: boolean, empty?: import('react').ReactNode, paginate?: boolean, rowClassName?: (row: object) => string }} props
 */
export default function ConsoleTable({
  tableKey, exportName, columns, rows, rowKey, filterFields = [], initialFilters = [], extraFilterPills = [],
  search, leftActions, bulkSections, showDate = true, showSettings = true, empty, paginate = true, rowClassName,
}) {
  const defaultKeys = useMemo(() => columns.filter(c => !c.fixed && c.isDefault !== false).map(c => c.key), [columns]);
  const prefs = useTablePrefs(tableKey, defaultKeys);
  const [filters, setFilters] = useState(initialFilters);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState([]);
  const [sort, setSort] = useState({ key: null, dir: 'desc' });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [isCustomising, setIsCustomising] = useState(false);

  const byKey = useMemo(() => Object.fromEntries(columns.map(c => [c.key, c])), [columns]);
  const visibleColumns = [...columns.filter(c => c.fixed), ...prefs.columns.map(k => byKey[k]).filter(c => c && !c.fixed)];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return applyFilters(rows, filters, filterFields).filter(r => !q || !search || search.match(r, q));
  }, [rows, filters, filterFields, query, search]);

  const sorted = useMemo(() => {
    const col = byKey[sort.key];
    if (!col?.sortValue) return filtered;
    const val = (r) => col.sortValue(r) ?? 0;
    return [...filtered].sort((a, b) => (sort.dir === 'desc' ? val(b) - val(a) : val(a) - val(b)));
  }, [filtered, sort, byKey]);

  const visibleRows = paginate ? sorted.slice(page * pageSize, (page + 1) * pageSize) : sorted;
  const selectedRows = filtered.filter(r => selected.includes(rowKey(r)));
  const isSelectable = Boolean(bulkSections);
  const allSelected = visibleRows.length > 0 && visibleRows.every(r => selected.includes(rowKey(r)));
  const hasTotals = visibleColumns.some(c => c.total);
  // "Total: n" spans the leading columns that have no total of their own.
  const firstTotal = visibleColumns.findIndex(c => c.total);
  const labelSpan = Math.max(1, firstTotal === -1 ? visibleColumns.length : firstTotal);

  const toggleSort = (key) => setSort(s => ({ key, dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc' }));
  const toggleRow = (id) => setSelected(list => (list.includes(id) ? list.filter(x => x !== id) : [...list, id]));
  const toggleAll = () => setSelected(allSelected ? [] : visibleRows.map(rowKey));
  const exportCsv = () => downloadCsv(csvFileName(exportName), toCsv(visibleColumns.filter(c => c.csv), sorted));
  const changeFilters = (next) => { setFilters(next); setPage(0); setSelected([]); };

  return (
    <div className="ct">
      <FilterRow filters={filters} fields={filterFields} onChange={changeFilters} extras={extraFilterPills} />
      <div className="cx-toolbar">
        {leftActions}
        {search && (
          <label className="cx-search" style={{ width: 240 }}>
            <Search size={16} />
            <input placeholder={search.placeholder} value={query} onChange={e => { setQuery(e.target.value); setPage(0); }} />
          </label>
        )}
        {filterFields.length > 0 && <FilterMenu filters={filters} fields={filterFields} onChange={changeFilters} />}
        {isSelectable && <BulkActionsMenu count={selectedRows.length} sections={bulkSections(selectedRows, () => setSelected([]))} />}
        <span className="cx-toolbar-spacer" />
        <ViewMenu density={prefs.density} onChange={prefs.setDensity} />
        <ColumnsMenu onCustomise={() => setIsCustomising(true)} onReset={prefs.resetColumns} />
        {showDate && <TableDateButton />}
        {showSettings && <TableSettings mrcOnly={prefs.mrcOnly} onSave={prefs.setMrcOnly} />}
        <ExportMenu onDownload={exportCsv} />
      </div>

      <div className="cx-table-wrap">
        <table className={`cx-table ${prefs.density === 'compact' ? 'is-compact' : ''}`}>
          <thead>
            <tr>
              {isSelectable && <th className="ct-check"><input type="checkbox" aria-label="Select all" checked={allSelected} onChange={toggleAll} /></th>}
              {visibleColumns.map(c => (
                <th key={c.key} className={`${c.num ? 'is-num' : ''} ${c.sortValue ? 'is-sortable' : ''}`} onClick={c.sortValue ? () => toggleSort(c.key) : undefined}>
                  {c.header ?? c.label}{c.info && <> <Info size={13} /></>}
                  {sort.key === c.key && (sort.dir === 'desc' ? <ArrowDown size={12} /> : <ArrowUp size={12} />)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map(r => {
              const id = rowKey(r);
              const isSel = selected.includes(id);
              return (
                <tr key={id} className={`${isSel ? 'is-selected' : ''} ${rowClassName ? rowClassName(r) : ''}`}>
                  {isSelectable && <td className="ct-check"><input type="checkbox" aria-label="Select row" checked={isSel} onChange={() => toggleRow(id)} /></td>}
                  {visibleColumns.map(c => <td key={c.key} className={c.num ? 'is-num' : ''}>{c.cell(r)}</td>)}
                </tr>
              );
            })}
            {visibleRows.length === 0 && (
              <tr><td colSpan={visibleColumns.length + (isSelectable ? 1 : 0)}>{empty || <div className="cx-empty"><h3>No data available</h3><p>Please try adjusting your filters to see performance data</p></div>}</td></tr>
            )}
          </tbody>
          {hasTotals && filtered.length > 0 && (
            <tfoot>
              <tr>
                {isSelectable && <td />}
                <td colSpan={labelSpan}>Total: {filtered.length}</td>
                {visibleColumns.slice(labelSpan).map(c => (
                  <td key={c.key} className={c.num ? 'is-num' : ''}>{c.total ? c.total(filtered) : ''}</td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {paginate && <Pagination total={sorted.length} page={page} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} />}
      {isCustomising && <ColumnsModal columns={columns} visible={prefs.columns.filter(k => byKey[k] && !byKey[k].fixed)} onApply={prefs.setColumns} onClose={() => setIsCustomising(false)} />}
    </div>
  );
}
