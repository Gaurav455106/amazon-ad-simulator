import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import Info from './InfoGlyph';
import { SUGGESTED_KWS } from '../../data/keywordSuggestions';

const MATCH_TYPES = ['Broad', 'Phrase', 'Exact'];
const BID_MODES = [
  { key: 'suggested', label: 'Suggested bid' },
  { key: 'custom', label: 'Custom bid' },
  { key: 'default', label: 'Default bid' },
];
const SORTS = ['Orders', 'Clicks', 'Suggested bid'];
const DEFAULT_CUSTOM_BID = '4.00';
const MIN_BID = 1;
const UPLOAD_COLUMNS = 'keyword, match type, bid';

const suggestionFor = (kw, matchType) => {
  const s = SUGGESTED_KWS.find(x => x.kw === kw);
  return s?.[matchType.toLowerCase()] || null;
};

/** Parses "keyword,match type,bid" rows from an uploaded CSV/TXT file. */
function parseUpload(text) {
  return text.split(/\r?\n/).map(l => l.split(',').map(c => c.trim())).filter(c => c[0])
    .map(([keyword, matchType = 'Exact', bid = '']) => ({
      keyword: keyword.toLowerCase(),
      matchType: MATCH_TYPES.find(m => m.toLowerCase() === matchType.toLowerCase()) || 'Exact',
      bid,
    }));
}

/**
 * @param {{ defaultBid: number, existing: Array<{ keyword: string, matchType: string }>,
 *           onClose: () => void, onSave: (kws: Array<{ keyword: string, matchType: string, bid: number }>) => void }} props
 */
export default function AddKeywordsModal({ defaultBid, existing, onClose, onSave }) {
  const [tab, setTab] = useState('suggested');
  const [bidMode, setBidMode] = useState('suggested');
  const [customBid, setCustomBid] = useState(DEFAULT_CUSTOM_BID);
  const [types, setTypes] = useState(MATCH_TYPES);
  const [sortBy, setSortBy] = useState('Orders');
  const [listText, setListText] = useState('');
  const [added, setAdded] = useState([]);
  const [uploadError, setUploadError] = useState(null);

  const isTaken = (keyword, matchType) =>
    [...existing, ...added].some(k => k.keyword === keyword && k.matchType === matchType);

  const bidFor = (keyword, matchType) => {
    if (bidMode === 'custom') return customBid;
    if (bidMode === 'default') return String(defaultBid);
    return suggestionFor(keyword, matchType)?.sugg?.toFixed(2) || String(defaultBid);
  };

  const suggestions = useMemo(() => {
    const rows = SUGGESTED_KWS.flatMap(s => types.map(t => ({ keyword: s.kw, matchType: t, sugg: s[t.toLowerCase()] })));
    if (sortBy === 'Suggested bid') return [...rows].sort((a, b) => b.sugg.sugg - a.sugg.sugg);
    return rows;
  }, [types, sortBy]);

  const add = (keyword, matchType, bid = bidFor(keyword, matchType)) => {
    if (isTaken(keyword, matchType)) return;
    setAdded(a => [...a, { keyword, matchType, bid }]);
  };

  const addList = () => {
    listText.split('\n').map(w => w.trim().toLowerCase()).filter(Boolean)
      .forEach(w => types.forEach(t => add(w, t)));
    setListText('');
  };

  const onFile = async (file) => {
    if (!file) return;
    try {
      const rows = parseUpload(await file.text());
      if (rows.length === 0) { setUploadError('The file has no keywords.'); return; }
      rows.forEach(r => add(r.keyword, r.matchType, r.bid || bidFor(r.keyword, r.matchType)));
      setUploadError(null);
    } catch {
      setUploadError('We could not read that file. Upload a .csv or .txt file.');
    }
  };

  const invalidBid = added.find(a => !(parseFloat(a.bid) >= MIN_BID));
  const updateBid = (i, bid) => setAdded(a => a.map((x, j) => (j === i ? { ...x, bid } : x)));

  return (
    <div className="cx-modal-overlay" onClick={onClose}>
      <div className="cx-modal" onClick={e => e.stopPropagation()}>
        <div className="cx-modal-head">
          <h2>Add keywords</h2>
          <button type="button" className="cx-tool-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="cx-modal-body kw-modal">
          <div className="kw-modal-left">
            <div className="sub-tabs">
              {[['suggested', 'Suggested'], ['list', 'Enter list'], ['upload', 'Upload file']].map(([k, l]) => (
                <button key={k} type="button" className={`sub-tab ${tab === k ? 'is-active' : ''}`} onClick={() => setTab(k)}>{l}</button>
              ))}
            </div>
            <div className="kw-row">
              <span className="kw-row-label">Bid <Info size={13} /></span>
              <select className="cx-input kw-select" value={bidMode} onChange={e => setBidMode(e.target.value)}>
                {BID_MODES.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
              </select>
              {bidMode === 'custom' && <span className="cx-input-prefix">₹<input value={customBid} onChange={e => setCustomBid(e.target.value)} /></span>}
            </div>
            <div className="kw-row">
              <span className="kw-row-label">{tab === 'suggested' ? 'Filter by' : 'Match type'} <Info size={13} /></span>
              {MATCH_TYPES.map(t => (
                <label key={t} className="kw-check">
                  <input type="checkbox" checked={types.includes(t)} onChange={() => setTypes(ts => (ts.includes(t) ? ts.filter(x => x !== t) : MATCH_TYPES.filter(m => ts.includes(m) || m === t)))} />
                  {t}
                </label>
              ))}
            </div>

            {tab === 'suggested' && (
              <>
                <div className="kw-row">
                  <span className="kw-row-label">Sort By <Info size={13} /></span>
                  <select className="cx-input kw-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>{SORTS.map(s => <option key={s}>{s}</option>)}</select>
                </div>
                <table className="cx-table">
                  <thead><tr><th>Keyword</th><th>Match type <Info size={13} /></th><th className="is-num">Sugg. bid <Info size={13} /></th>
                    <th><button type="button" className="cx-link" onClick={() => suggestions.forEach(s => add(s.keyword, s.matchType))}>Add All</button></th></tr></thead>
                  <tbody>
                    {suggestions.map(s => {
                      const taken = isTaken(s.keyword, s.matchType);
                      return (
                        <tr key={`${s.keyword}|${s.matchType}`}>
                          <td>{s.keyword}</td>
                          <td>{s.matchType}</td>
                          <td className="is-num">₹{s.sugg.sugg.toFixed(2)}<span className="cx-sub">₹{s.sugg.min.toFixed(2)} - ₹{s.sugg.max.toFixed(2)}</span></td>
                          <td>{taken ? <span className="cx-sub">Added</span> : <button type="button" className="cx-link" onClick={() => add(s.keyword, s.matchType)}>Add</button>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </>
            )}

            {tab === 'list' && (
              <>
                <textarea className="kw-textarea" placeholder="Enter keywords separated by new line." value={listText} onChange={e => setListText(e.target.value)} />
                <div style={{ textAlign: 'right' }}>
                  <button type="button" className="cx-btn" disabled={!listText.trim() || types.length === 0} onClick={addList}>Add keywords</button>
                </div>
              </>
            )}

            {tab === 'upload' && (
              <div className="kw-upload">
                <p>Upload a .csv or .txt file with one keyword per row: <code>{UPLOAD_COLUMNS}</code>.</p>
                <input type="file" accept=".csv,.txt" onChange={e => onFile(e.target.files?.[0])} />
                {uploadError && <p className="form-error">{uploadError}</p>}
              </div>
            )}
          </div>

          <div className="kw-modal-right">
            <div className="kw-added-head">
              <strong>{added.length} added</strong>
              <button type="button" className="cx-link" onClick={() => setAdded([])}>Remove all</button>
            </div>
            <table className="cx-table">
              <thead><tr><th>Keyword</th><th>Match type</th><th className="is-num">Sugg. bid</th><th>Bid</th><th /></tr></thead>
              <tbody>
                {added.map((a, i) => {
                  const s = suggestionFor(a.keyword, a.matchType);
                  const isBad = !(parseFloat(a.bid) >= MIN_BID);
                  return (
                    <tr key={`${a.keyword}|${a.matchType}`}>
                      <td>{a.keyword}</td>
                      <td>{a.matchType}</td>
                      <td className="is-num">{s ? `₹${s.sugg.toFixed(2)}` : '-'}</td>
                      <td>
                        <span className={`cx-input-prefix ${isBad ? 'has-error' : ''}`}>₹<input value={a.bid} onChange={e => updateBid(i, e.target.value)} /></span>
                        {isBad && <span className="form-error">Bid must be at least ₹{MIN_BID.toFixed(2)}</span>}
                      </td>
                      <td><button type="button" className="cx-tool-btn" aria-label="Remove" onClick={() => setAdded(x => x.filter((_, j) => j !== i))}><X size={14} /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {invalidBid && <p className="form-error kw-list-error">You have one or more errors in this list</p>}
          </div>
        </div>
        <div className="cx-modal-foot">
          <button type="button" className="cx-btn" onClick={onClose}>Cancel</button>
          <button type="button" className="cx-btn cx-btn-primary" disabled={added.length === 0 || !!invalidBid}
            onClick={() => { onSave(added.map(a => ({ ...a, bid: parseFloat(a.bid) }))); onClose(); }}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
