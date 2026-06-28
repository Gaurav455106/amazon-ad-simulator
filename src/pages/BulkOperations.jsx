import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Download, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/simulation';

const TEMPLATES = [
  { name: 'Campaigns', description: 'Create or edit campaigns in bulk' },
  { name: 'Ad Groups', description: 'Create or edit ad groups in bulk' },
  { name: 'Keywords', description: 'Add or update keyword bids and statuses' },
  { name: 'Negative Keywords', description: 'Add negative keywords at scale' },
  { name: 'Product Ads', description: 'Manage product ad associations' },
];

export default function BulkOperations() {
  const campaigns = useStore(s => s.campaigns);
  const keywords = useStore(s => s.keywords);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [history] = useState([
    { id: 1, filename: 'bulk_upload_jan.xlsx', status: 'Completed', records: 142, errors: 0, date: '2024-01-15' },
    { id: 2, filename: 'keyword_bids_update.xlsx', status: 'Completed', records: 89, errors: 3, date: '2024-01-10' },
    { id: 3, filename: 'new_campaigns_q1.xlsx', status: 'Failed', records: 0, errors: 12, date: '2024-01-05' },
  ]);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setUploadStatus({
        filename: file.name,
        records: Math.floor(20 + Math.random() * 100),
        errors: Math.floor(Math.random() * 3),
        warnings: Math.floor(Math.random() * 5),
      });
    }, 1500);
  };

  const downloadTemplate = (name) => {
    alert(`Downloading ${name} bulk template (CSV format)...`);
  };

  const downloadCurrentData = () => {
    const rows = [['Campaign name', 'Status', 'Budget', 'Impressions', 'Clicks', 'Spend', 'Orders', 'Sales']];
    campaigns.forEach(c => {
      rows.push([c.name, c.status, c.budget, c.metrics.impressions, c.metrics.clicks, c.metrics.spend.toFixed(2), c.metrics.orders, c.metrics.sales.toFixed(2)]);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'amazon_ads_campaigns.csv'; a.click();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bulk Operations</h1>
          <p className="page-subtitle">Create, edit, and manage campaigns at scale using spreadsheets</p>
        </div>
        <button className="btn btn-primary" onClick={downloadCurrentData}><Download size={14} /> Export current data</button>
      </div>

      <div className="bulk-grid">
        {/* Upload area */}
        <div className="table-card bulk-upload">
          <h3>Upload file</h3>
          <div className="upload-zone">
            <Upload size={32} color="#ccc" />
            <p>Drag & drop your bulk file here, or</p>
            <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
              Choose file
              <input type="file" accept=".xlsx,.csv,.tsv" style={{ display: 'none' }} onChange={handleUpload} />
            </label>
            <p className="upload-hint">Supported: .xlsx, .csv, .tsv — Max 50MB</p>
          </div>

          {processing && (
            <div className="upload-status processing">
              <div className="spinner" />
              <span>Processing your file...</span>
            </div>
          )}

          {uploadStatus && !processing && (
            <div className="upload-result">
              <div className="upload-status success">
                <CheckCircle size={18} color="#4caf50" />
                <span>{uploadStatus.filename} processed</span>
              </div>
              <div className="upload-details">
                <div className="ud"><label>Records found</label><span>{uploadStatus.records}</span></div>
                <div className="ud"><label>Errors</label><span className={uploadStatus.errors ? 'text-red' : ''}>{uploadStatus.errors}</span></div>
                <div className="ud"><label>Warnings</label><span className={uploadStatus.warnings ? 'text-orange' : ''}>{uploadStatus.warnings}</span></div>
              </div>
              {uploadStatus.errors === 0 && (
                <button className="btn btn-primary">Apply changes</button>
              )}
            </div>
          )}
        </div>

        {/* Templates */}
        <div className="table-card">
          <h3>Download templates</h3>
          <div className="template-list">
            {TEMPLATES.map(t => (
              <div key={t.name} className="template-item">
                <div>
                  <strong>{t.name}</strong>
                  <p>{t.description}</p>
                </div>
                <button className="btn btn-sm btn-secondary" onClick={() => downloadTemplate(t.name)}>
                  <Download size={12} /> Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upload history */}
      <div className="table-card">
        <h3>Upload history</h3>
        <table className="ads-table">
          <thead>
            <tr><th>Filename</th><th>Date</th><th>Records</th><th>Errors</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {history.map(h => (
              <tr key={h.id}>
                <td><FileText size={14} style={{ marginRight: 6 }} />{h.filename}</td>
                <td>{h.date}</td>
                <td>{h.records}</td>
                <td className={h.errors ? 'text-red' : ''}>{h.errors}</td>
                <td>
                  <span className={`status-badge ${h.status === 'Completed' ? 'badge-green' : 'badge-red'}`}>{h.status}</span>
                </td>
                <td><button className="btn btn-xs btn-secondary">View details</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
