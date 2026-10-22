import { useStore } from '../../../store/useStore';

const EMPTY = {};

/**
 * Saved display choices for one table (columns, view density, MRC setting), per student.
 * @param {string} tableKey
 * @param {string[]} defaultColumns column keys shown when nothing is saved
 */
export function useTablePrefs(tableKey, defaultColumns) {
  const prefs = useStore(s => s.tablePrefs?.[tableKey]) || EMPTY;
  const setTablePrefs = useStore(s => s.setTablePrefs);
  return {
    columns: prefs.columns || defaultColumns,
    density: prefs.density || 'default',
    mrcOnly: Boolean(prefs.mrcOnly),
    setColumns: (columns) => setTablePrefs(tableKey, { columns }),
    resetColumns: () => setTablePrefs(tableKey, { columns: undefined }),
    setDensity: (density) => setTablePrefs(tableKey, { density }),
    setMrcOnly: (mrcOnly) => setTablePrefs(tableKey, { mrcOnly }),
  };
}
