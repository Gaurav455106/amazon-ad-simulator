import { Fragment, useState } from 'react';
import { ChevronDown, CircleHelp, X } from 'lucide-react';
import Info from '../../../components/console/InfoGlyph';

const MATCHES = ['Broad', 'Phrase', 'Exact'];
const VCPM_MULTIPLIER = 29.43;
const DEFAULT_CUSTOM_BID = '4.00';
const MIN_BID = 0.01;

const inr = (n) => `₹${Number(n).toFixed(2)}`;
// Deterministic "suggested" CPC for a typed keyword so the same keyword always gets the same suggestion.
const typedKeywordSugg = (kw) => 7 + (kw.length % 13);
const sameKw = (a, keyword, matchType) => a.keyword === keyword && a.matchType === matchType;

function BidModeMenu({ mode, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const current = options.find(o => o.key === mode) || options[0];
  return (
    <div className="sbk-menu-wrap">
      <button type="button" className="sbk-select" onClick={() => setIsOpen(o => !o)} aria-expanded={isOpen}>
        {current.label} <ChevronDown size={14} />
      </button>
      {isOpen && (
        <>
          <div className="drp-scrim" onClick={() => setIsOpen(false)} />
          <div className="sbk-menu" role="listbox">
            {options.map(o => (
              <button type="button" key={o.key} role="option" aria-selected={o.key === mode}
                className={`sbk-option ${o.key === mode ? 'is-selected' : ''}`}
                onClick={() => { onChange(o.key); setIsOpen(false); }}>
                <strong>{o.label}</strong><span>{o.desc}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Sponsored Brands "Keyword targeting" card, laid out like the console.
 * Automatic collections only get Enter list / Upload file with a ₹4.00 custom bid; manual collections,
 * store spotlight and video also get Suggested (theme groups + keyword suggestions).
 * @param {{ hasSuggestions: boolean, isVcpm: boolean, suggestions: object[], themeGroups: object[],
 *           keywords: object[], onKeywords: (k: object[]) => void, groups: object[], onGroups: (g: object[]) => void }} props
 */
export default function SbKeywordTargeting({ hasSuggestions, isVcpm, suggestions, themeGroups, keywords, onKeywords, groups, onGroups }) {
  const [tab, setTab] = useState(hasSuggestions ? 'suggested' : 'enter-list');
  const [bidMode, setBidMode] = useState(hasSuggestions ? 'suggested' : 'custom');
  const [customBid, setCustomBid] = useState(DEFAULT_CUSTOM_BID);
  const [filters, setFilters] = useState({ Broad: true, Phrase: true, Exact: true });
  const [text, setText] = useState('');
  const [notice, setNotice] = useState('');

  const scale = isVcpm ? VCPM_MULTIPLIER : 1;
  const unit = isVcpm ? 'per 1,000 viewable impressions (VCPM)' : 'per click (CPC)';
  const isCustomBidValid = parseFloat(customBid) >= MIN_BID;
  const activeMatches = MATCHES.filter(m => filters[m]);
  const bidModes = [
    { key: 'suggested', label: 'Suggested bid', desc: 'Based on past bidding activity to predict bids likely to win.' },
    { key: 'custom', label: 'Custom bid', desc: 'Set a custom bid for all newly added keywords.' },
  ];
  const bidFor = (sugg) => (bidMode === 'suggested' && sugg != null ? (sugg * scale).toFixed(2) : customBid);
  const isAdded = (keyword, matchType) => keywords.some(k => sameKw(k, keyword, matchType));

  const addSuggested = (items) => {
    const fresh = items.filter(i => !isAdded(i.keyword, i.matchType));
    if (fresh.length) onKeywords([...keywords, ...fresh]);
  };
  const fromSuggestion = (s, matchType) => {
    const kd = s[matchType.toLowerCase()];
    return { type: 'kw', keyword: s.kw, matchType, suggBid: kd.sugg, suggMin: kd.min, suggMax: kd.max, bid: bidFor(kd.sugg) };
  };
  const addAllSuggestions = () => addSuggested(suggestions.flatMap(s => activeMatches.map(m => fromSuggestion(s, m))));
  const groupRecord = (g) => ({ ...g, matchType: 'Theme', bid: (g.suggBid * scale).toFixed(2) });
  const addGroups = (items) => onGroups([...groups, ...items.filter(g => !groups.some(x => x.key === g.key)).map(groupRecord)]);

  const addTyped = (lines, matchTypesFor) => {
    const candidates = lines.flatMap(({ keyword, matchTypes }) => (matchTypesFor(matchTypes)).map(matchType => {
      const sugg = typedKeywordSugg(keyword);
      return { type: 'kw', keyword, matchType, suggBid: sugg, suggMin: sugg * 0.7, suggMax: sugg * 1.3, bid: bidFor(sugg) };
    }));
    const fresh = candidates.filter((c, i) => !isAdded(c.keyword, c.matchType) && candidates.findIndex(x => sameKw(x, c.keyword, c.matchType)) === i);
    onKeywords([...keywords, ...fresh]);
    const skipped = candidates.length - fresh.length;
    setNotice(skipped ? `${fresh.length} of ${candidates.length} keywords were added. ${skipped} already added.` : '');
  };
  const addFromText = () => {
    const lines = [...new Set(text.split('\n').map(l => l.trim().toLowerCase()).filter(Boolean))].map(keyword => ({ keyword }));
    addTyped(lines, () => activeMatches);
    setText('');
  };
  const onUpload = async (file) => {
    if (!file) return;
    try {
      const rows = (await file.text()).split(/\r?\n/).slice(1).map(r => r.split(/[,\t]/).map(c => c.trim())).filter(r => r[0]);
      const lines = rows.map(([keyword, match]) => ({
        keyword: keyword.toLowerCase(),
        matchTypes: MATCHES.filter(m => m.toLowerCase() === (match || '').toLowerCase()),
      }));
      addTyped(lines, (mts) => (mts && mts.length ? mts : activeMatches));
    } catch {
      setNotice('We could not read that file. Upload a CSV or TSV with Keyword and Match type columns.');
    }
  };

  const updateKeyword = (i, bid) => onKeywords(keywords.map((k, j) => (j === i ? { ...k, bid } : k)));
  const updateGroup = (key, bid) => onGroups(groups.map(g => (g.key === key ? { ...g, bid } : g)));
  const applyAllSuggested = () => {
    onGroups(groups.map(g => ({ ...g, bid: (g.suggBid * scale).toFixed(2) })));
    onKeywords(keywords.map(k => (k.suggBid != null ? { ...k, bid: (k.suggBid * scale).toFixed(2) } : k)));
  };
  const total = groups.length + keywords.length;

  const tabs = [
    ...(hasSuggestions ? [['suggested', 'Suggested']] : []),
    ['enter-list', 'Enter list'],
    ['upload-file', 'Upload file'],
  ];

  const bidRow = (
    <div className="sbk-row">
      <span className="sbk-label">Bid <Info size={12} /></span>
      <BidModeMenu mode={bidMode} options={bidModes} onChange={setBidMode} />
      {bidMode === 'custom' && (
        <label className={`sbk-bid ${isCustomBidValid ? '' : 'has-error'}`}>₹
          <input type="number" min={MIN_BID} step="0.01" value={customBid} onChange={e => setCustomBid(e.target.value)} aria-label="Custom bid" />
        </label>
      )}
      <span className="sbk-unit">{unit}</span>
    </div>
  );
  const filterRow = (label) => (
    <div className="sbk-row">
      <span className="sbk-label">{label} <Info size={12} /></span>
      {MATCHES.map(m => (
        <label key={m} className="sbk-check">
          <input type="checkbox" checked={filters[m]} onChange={e => setFilters(f => ({ ...f, [m]: e.target.checked }))} /> {m}
        </label>
      ))}
    </div>
  );

  return (
    <section className="ccs-card sbk-card">
      <header className="ccs-card-header">
        <span className="ccs-card-heading">Keyword targeting <Info size={14} /></span>
        <a href="#help" className="ccs-help-link" onClick={e => e.preventDefault()}><CircleHelp size={13} /> Select keywords to target</a>
      </header>
      <div className="sbk-layout">
        <div className="sbk-left">
          <div className="ng-sub-tabs sbk-tabs">
            {tabs.map(([k, l]) => (
              <button type="button" key={k} className={`ng-sub-tab ${tab === k ? 'is-active' : ''}`} onClick={() => { setTab(k); setNotice(''); }}>
                {l}{k === 'suggested' && <> <Info size={12} /></>}
              </button>
            ))}
          </div>

          {tab === 'suggested' && (
            <>
              <div className="sbk-controls">{bidRow}{filterRow('Filter by')}</div>
              <div className="sbk-scroll">
                <div className="kwg-hdr sbk-hdr">
                  <span>Targeting groups <Info size={12} /></span>
                  <span>Match type <Info size={12} /></span>
                  <span>Sugg. bid <Info size={12} /></span>
                  <button type="button" className="kwg-add" onClick={() => addGroups(themeGroups)}>Add All</button>
                </div>
                {themeGroups.map(g => {
                  const added = groups.some(x => x.key === g.key);
                  return (
                    <div key={g.key} className="sbk-group">
                      <span>{g.label} <Info size={12} /></span>
                      <span className="kwg-mt">Theme</span>
                      <span className="kwg-bid">{inr(g.suggBid * scale)}</span>
                      {added ? <span className="kwg-added kwg-added-italic">Added</span>
                        : <button type="button" className="kwg-add" onClick={() => addGroups([g])}>Add</button>}
                    </div>
                  );
                })}
                <div className="kwg-hdr sbk-hdr">
                  <span>Keyword</span>
                  <span>Match type <Info size={12} /></span>
                  <span>Sugg. bid <Info size={12} /></span>
                  <button type="button" className="kwg-add" onClick={addAllSuggestions}>Add All</button>
                </div>
                {activeMatches.length > 0 && suggestions.map(s => (
                  <div key={s.kw} className="kwg-block sbk-block">
                    <div className="kwg-name" style={{ gridRow: `1 / span ${activeMatches.length}` }}><span>{s.kw}</span></div>
                    {activeMatches.map(m => {
                      const kd = s[m.toLowerCase()];
                      return (
                        <Fragment key={m}>
                          <span className="kwg-mt">{m}</span>
                          <span className="kwg-bid">{bidMode === 'suggested' ? inr(kd.sugg * scale) : `${inr(kd.min * scale)} - ${inr(kd.max * scale)}`}</span>
                          {isAdded(s.kw, m) ? <span className="kwg-added">Added</span>
                            : <button type="button" className="kwg-add" onClick={() => addSuggested([fromSuggestion(s, m)])}>Add</button>}
                        </Fragment>
                      );
                    })}
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'enter-list' && (
            <div className="sbk-pad">
              {bidRow}
              {filterRow('Match type')}
              <textarea className="ng-textarea" placeholder="Enter keywords separated by new line." value={text} onChange={e => setText(e.target.value)} />
              {notice && <p className="sbk-notice">{notice}</p>}
              <div className="ng-actions">
                <button type="button" className="ng-btn" disabled={!text.trim() || activeMatches.length === 0 || (bidMode === 'custom' && !isCustomBidValid)} onClick={addFromText}>Add keywords</button>
              </div>
            </div>
          )}

          {tab === 'upload-file' && (
            <div className="sbk-pad">
              <p className="ng-hint ng-hint-left">Use the template to make sure your information uploads accurately.</p>
              <a className="ng-btn sbp-template" href="data:text/csv;charset=utf-8,Keyword%2CMatch%20type%0Abanana%20chips%2CBroad" download="sb-keywords-template.csv">Download the CSV template</a>
              <label className="ng-drop">
                <input type="file" accept=".csv,.tsv,.txt" onChange={e => { onUpload(e.target.files?.[0]); e.target.value = ''; }} />
                <strong>Drag and drop file to add</strong>
                <span>or click to select from your computer</span>
                <small>Accepted formats: CSV, TSV</small>
              </label>
              {notice && <p className="sbk-notice">{notice}</p>}
            </div>
          )}
        </div>

        <div className="sbk-right">
          <div className="ng-right-head">
            <strong>{total} added</strong>
            <button type="button" className="link-btn tg-remove-all" disabled={total === 0} onClick={() => { onKeywords([]); onGroups([]); }}>Remove all</button>
          </div>
          <div className="sbk-cols">
            <span>Keyword</span>
            <span>Match type <Info size={12} /></span>
            <span>Sugg. bid <Info size={12} /><button type="button" className="sbk-apply" disabled={total === 0} onClick={applyAllSuggested}>Apply all</button></span>
            <span>Bid <Info size={12} /></span>
            <span />
          </div>
          <div className="sbk-added-list">
            {groups.map(g => (
              <div key={g.key} className="sbk-added">
                <span>{g.label}<small>Targeting group</small></span>
                <span>Theme</span>
                <span>{inr(g.suggBid * scale)}<small>{inr(g.min * scale)} - {inr(g.max * scale)}</small></span>
                <label className="sbk-bid">₹<input type="number" min={MIN_BID} step="0.01" value={g.bid} onChange={e => updateGroup(g.key, e.target.value)} aria-label={`Bid for ${g.label}`} /></label>
                <button type="button" className="ng-x" aria-label={`Remove ${g.label}`} onClick={() => onGroups(groups.filter(x => x.key !== g.key))}><X size={14} /></button>
              </div>
            ))}
            {keywords.map((k, i) => (
              <div key={`${k.keyword}|${k.matchType}`} className="sbk-added">
                <span>{k.keyword}</span>
                <span>{k.matchType}</span>
                <span>{k.suggBid != null ? <>{inr(k.suggBid * scale)}{k.suggMin != null && <small>{inr(k.suggMin * scale)} - {inr(k.suggMax * scale)}</small>}</> : '-'}</span>
                <label className={`sbk-bid ${parseFloat(k.bid) >= MIN_BID ? '' : 'has-error'}`}>₹<input type="number" min={MIN_BID} step="0.01" value={k.bid} onChange={e => updateKeyword(i, e.target.value)} aria-label={`Bid for ${k.keyword} ${k.matchType}`} /></label>
                <button type="button" className="ng-x" aria-label={`Remove ${k.keyword} ${k.matchType}`} onClick={() => onKeywords(keywords.filter((_, j) => j !== i))}><X size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
