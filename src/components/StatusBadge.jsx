export default function StatusBadge({ status }) {
  const map = {
    Enabled: 'badge-green',
    Paused: 'badge-yellow',
    Archived: 'badge-gray',
    Active: 'badge-green',
    Ended: 'badge-red',
  };
  return <span className={`status-badge ${map[status] || 'badge-gray'}`}>{status}</span>;
}
