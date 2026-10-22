// Bulk-action menu sections shared by the console tables.

/**
 * The "Quick Actions" bulk section: Enable / Pause / Archive, each disabled when it would change nothing.
 * @param {object[]} items the selected entities (campaigns, ad groups, keywords…)
 * @param {(item: object, status: string) => void} setStatus
 */
export function statusBulkSection(items, setStatus, clear) {
  const run = (status) => { items.forEach(it => setStatus(it, status)); clear(); };
  const all = (status) => items.length > 0 && items.every(it => it.status === status);
  return {
    title: 'Quick Actions',
    items: [
      { label: 'Enable', disabled: all('Enabled') || items.some(it => it.status === 'Archived'), onClick: () => run('Enabled') },
      { label: 'Pause', disabled: all('Paused') || items.some(it => it.status === 'Archived'), onClick: () => run('Paused') },
      { label: 'Archive', disabled: all('Archived'), onClick: () => run('Archived') },
      { label: 'Delete', disabled: true, onClick: () => {} },
    ],
  };
}
