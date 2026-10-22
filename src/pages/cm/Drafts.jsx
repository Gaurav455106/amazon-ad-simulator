import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes';

export default function Drafts() {
  const navigate = useNavigate();
  return (
    <div className="cx-page">
      <div className="cx-toolbar">
        <button type="button" className="cx-btn cx-btn-pill" onClick={() => navigate(ROUTES.createCampaign)}>Create campaign</button>
      </div>
      <div className="cx-table-wrap cx-card">
        <table className="cx-table">
          <thead><tr><th><input type="checkbox" aria-label="Select all" disabled /></th><th>Campaigns</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            <tr><td colSpan={5}><div className="cx-empty"><h3>No drafts</h3><p>Campaigns you save as a draft from the campaign builder appear here.</p></div></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
