import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import Info from '../../../components/console/InfoGlyph';
import { useStore } from '../../../store/useStore';
import { campaignPath, ROUTES } from '../../../routes';
import { consoleTimestamp, localISODate } from '../../../utils/dateRanges';
import DateField from '../sp/DateField';
import { HelpLink, MoneyInput, PillSelect, SdCard } from './SdBits';
import SdProductsCard from './SdProductsCard';
import SdTargetingCard from './SdTargetingCard';
import SdCreativeCard from './SdCreativeCard';
import { SD_DEFAULT_BUDGET, SD_GOALS, defaultTargets, goalConfig } from './sdConfig';
import { buildSdLaunch, sdForecast, validateSdDraft } from './launch';

const AD_FORMATS = [
  { key: 'image', label: 'Image', caption: 'Promote your product with an optional image' },
  { key: 'video', label: 'Video', caption: 'Feature products or brands in an autoplaying video.' },
];

function FormatArt({ format }) {
  return format === 'image' ? (
    <svg viewBox="0 0 190 120" className="sd-format-art" aria-hidden="true">
      <rect x="1" y="1" width="188" height="118" fill="#fff" stroke="#d5d9d9" />
      <rect x="10" y="10" width="84" height="80" fill="#ff9900" /><path d="M36 30l10-6h12l10 6-6 8-4-2v26H46V36l-4 2z" fill="#fff" />
      <text x="14" y="104" fill="#ff9900" fontSize="12">★★★★★</text>
      <rect x="102" y="10" width="78" height="56" fill="#ff9900" /><path d="M120 54l14-14 10 10 6-6 14 10z" fill="#fff" /><circle cx="156" cy="26" r="4" fill="#fff" />
      <rect x="102" y="74" width="78" height="10" fill="#ff9900" /><rect x="102" y="90" width="60" height="10" fill="#ff9900" />
    </svg>
  ) : (
    <svg viewBox="0 0 190 120" className="sd-format-art" aria-hidden="true">
      <rect x="1" y="1" width="188" height="118" fill="#fff" stroke="#d5d9d9" />
      <rect x="10" y="10" width="170" height="78" fill="#ff9900" /><path d="M86 34l26 15-26 15z" fill="#fff" />
      <rect x="10" y="96" width="36" height="12" fill="#ff9900" /><rect x="52" y="96" width="102" height="12" fill="#ff9900" />
    </svg>
  );
}

/** Sponsored Display campaign builder (/cb/sd), rebuilt from the console's layout and behaviour. */
export default function SdBuilder() {
  const navigate = useNavigate();
  const catalogue = useStore(s => s.products);
  const portfolios = useStore(s => s.portfolios) || [];
  const addCampaign = useStore(s => s.addCampaign);
  const addAdGroup = useStore(s => s.addAdGroup);
  const today = localISODate();

  const [name, setName] = useState(() => `Campaign - ${consoleTimestamp()}`);
  const [portfolioId, setPortfolioId] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState(SD_DEFAULT_BUDGET);
  const [adGroupName, setAdGroupName] = useState(() => `Ad group - ${consoleTimestamp()}`);
  const [goal, setGoal] = useState('consideration');
  const [costControl, setCostControl] = useState(true);
  const [costControlValue, setCostControlValue] = useState(goalConfig('consideration').ccDefault);
  const [adFormat, setAdFormat] = useState('image');
  const [products, setProducts] = useState([]);
  const [targets, setTargets] = useState(defaultTargets);
  const [manualTargets, setManualTargets] = useState([]);
  const [optimisedTargeting, setOptimisedTargeting] = useState(true);
  const [optimisedBid, setOptimisedBid] = useState('');
  const [creative, setCreative] = useState({ logo: true, headlineOn: false, headline: '', imageOn: false, video: '' });
  const [errors, setErrors] = useState([]);

  const cfg = goalConfig(goal);
  const isConversion = goal === 'conversion';
  const activeTargets = isConversion ? manualTargets : targets;
  const brand = catalogue[0]?.brand || 'Your brand';
  const draft = {
    name, adGroupName, budget, startDate, endDate, portfolioId, goal, costControl, costControlValue,
    adFormat, products, targets: activeTargets, optimisedTargeting, optimisedBid, creative,
  };
  const forecast = sdForecast(draft);

  const chooseGoal = (key) => { setGoal(key); setCostControlValue(goalConfig(key).ccDefault); };

  const launch = () => {
    const found = validateSdDraft(draft);
    setErrors(found);
    if (found.length) { document.querySelector('.wizard-content')?.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    const stamp = Date.now();
    const out = buildSdLaunch(draft, { campaignId: `c${stamp}`, adGroupId: `ag${stamp}`, today });
    addCampaign(out.campaign);
    addAdGroup(out.adGroup);
    navigate(campaignPath(out.campaign));
  };

  return (
    <div className="ccs-root sd-root">
      <div className="ccs-topbar">
        <div className="ccs-topbar-left">
          <button type="button" className="ccs-topbar-close" aria-label="Close" onClick={() => navigate(ROUTES.allCampaigns)}><X size={16} /></button>
          <span className="ccs-topbar-title">New campaign</span>
        </div>
        <div className="ccs-topbar-right">
          <button type="button" className="link-btn ccs-back-link" onClick={() => navigate(ROUTES.createCampaign)}>Go back to campaigns</button>
          <button type="button" className="btn btn-dark" onClick={launch}>Launch campaign</button>
        </div>
      </div>

      <div className="sd-layout">
        <main className="sd-main">
          {errors.length > 0 && (
            <div className="sb-alert" role="alert">
              <strong>Fix the following to launch your campaign:</strong>
              <ul>{errors.map(e => <li key={e}>{e}</li>)}</ul>
            </div>
          )}

          <h1 className="sd-page-title">Create campaign</h1>
          <SdCard title="Settings" help="How to set up your campaign">
            <div className="sd-body">
              <label className="sd-field"><span className="sd-field-label">Campaign name <Info size={12} /></span>
                <input className="sd-input sd-w-280" value={name} onChange={e => setName(e.target.value)} placeholder="Example: Holiday Favourites" /></label>
              <div className="sd-field"><span className="sd-field-label">Portfolio <Info size={12} /></span>
                <PillSelect value={portfolioId} onChange={setPortfolioId} width={288} ariaLabel="Portfolio"
                  options={[{ value: '', label: 'No Portfolio' }, ...portfolios.map(p => ({ value: p.id, label: p.name }))]} /></div>
              <div className="sd-row">
                <div className="sd-field"><span className="sd-field-label">Start <Info size={12} /></span><DateField value={startDate} onChange={setStartDate} min={today} /></div>
                <div className="sd-field"><span className="sd-field-label">End <Info size={12} /></span><DateField value={endDate} onChange={setEndDate} min={startDate} isClearable placeholder="No end date" /></div>
              </div>
              <div className="sd-field"><span className="sd-field-label">Country</span><span>India</span></div>
              <div className="sd-field"><span className="sd-field-label">Daily budget <Info size={12} /></span>
                <MoneyInput value={budget} onChange={setBudget} ariaLabel="Daily budget" hasError={errors.length > 0 && !(parseFloat(budget) > 0)} />
                <span className="sd-muted">Most campaigns with a budget over ₹1,000.00 run throughout the day.</span></div>
            </div>
          </SdCard>

          <h1 className="sd-page-title">Create an ad group</h1>
          <p className="sd-page-intro">Ad groups are groups of ads within a campaign that share the same set of targeting tactics or creative type. They can help you organise your campaigns more efficiently. You can create additional ad groups in campaign manager after you launch your campaign. <a href="#learn" onClick={e => e.preventDefault()}>Learn more</a></p>
          <SdCard title="Settings" help="How to create an ad group">
            <div className="sd-body">
              <label className="sd-field"><span className="sd-field-label">Ad group name <Info size={12} /></span>
                <input className="sd-input sd-w-280" value={adGroupName} onChange={e => setAdGroupName(e.target.value)} placeholder="Example: Seasonal Products" /></label>
            </div>
          </SdCard>

          <SdCard title="Optimisation strategy" help="How to choose an optimization strategy">
            <div className="sd-body">
              {SD_GOALS.map(g => (
                <label key={g.key} className="sd-radio">
                  <input type="radio" name="sd-goal" checked={goal === g.key} onChange={() => chooseGoal(g.key)} />
                  <span><strong>{g.label} <Info size={12} /></strong><span>{g.desc}</span><small>{g.costLine}</small></span>
                </label>
              ))}
              <div className="sd-cost-control">
                <strong className="sd-subhead">Cost control</strong>
                <label className="sd-check sd-check-top">
                  <input type="checkbox" checked={costControl} onChange={e => setCostControl(e.target.checked)} />
                  <span><b>Keep success metric at or below a desired value</b> <Info size={12} /> <span className="sd-beta">Beta</span>
                    <span className="sd-block">We will set your bids and add targets while your campaign is running to try to stay at or below a metric value you specify. It can take {cfg.ccDuration} to achieve the desired result.</span></span>
                </label>
                {costControl && (
                  <div className="sd-indent">
                    <span className="sd-field-label">{cfg.ccLabel}</span>
                    <MoneyInput value={costControlValue} onChange={setCostControlValue} ariaLabel={cfg.ccLabel}
                      hasError={!(parseFloat(costControlValue) >= cfg.ccMin)} />
                    <span className="sd-muted">{cfg.ccHelper(Number(costControlValue || 0).toFixed(2))}</span>
                  </div>
                )}
              </div>
            </div>
          </SdCard>

          <SdCard title="Ad format" info help="How to choose your ad format">
            <div className="sd-body">
              <div className="sd-formats">
                {AD_FORMATS.map(f => (
                  <button type="button" key={f.key} className={`sd-format ${adFormat === f.key ? 'is-selected' : ''}`} aria-pressed={adFormat === f.key} onClick={() => setAdFormat(f.key)}>
                    <strong>{f.label}</strong><FormatArt format={f.key} /><span>{f.caption}</span>
                  </button>
                ))}
              </div>
              {adFormat === 'video' && (
                <>
                  <p className="sd-tip">✦ Advertisers who use video ad format for Sponsored Display and optimise for page visits saw a 67% higher click-through rate (CTR), compared to those using image creative. (Amazon internal data, 2024)</p>
                  <p className="sd-video-help"><b>Need help with video?</b> <a href="#templates" onClick={e => e.preventDefault()}>Use our video builder templates</a></p>
                </>
              )}
            </div>
          </SdCard>

          <SdProductsCard catalogue={catalogue} products={products} onChange={setProducts} isVideo={adFormat === 'video'} />

          <SdTargetingCard goal={goal} targets={activeTargets} onTargets={isConversion ? setManualTargets : setTargets}
            isOptimised={optimisedTargeting} onOptimised={setOptimisedTargeting} optimisedBid={optimisedBid} onOptimisedBid={setOptimisedBid}
            hasProducts={products.length > 0} isCostControl={costControl} bidUnit={cfg.bidUnit} />

          {products.length > 0 && (
            <SdCreativeCard brand={brand} products={products} creative={creative} onCreative={setCreative} adFormat={adFormat} />
          )}

          <div className="sd-bottom"><button type="button" className="sd-btn-blue sd-btn-wide" onClick={launch}>Launch campaign</button></div>
        </main>

        <aside className="sd-forecast" aria-label="Forecast">
          <h2>Forecast <Info size={12} /> <span className="sd-beta">Beta</span></h2>
          <p>Estimates of performance are based on historical campaigns with similar products, optimisation strategy, bids, targets, and budget.</p>
          <HelpLink>Learn about forecasts</HelpLink>
          <PillSelect value="weekly" onChange={() => {}} ariaLabel="Forecast period" options={[{ value: 'weekly', label: 'Weekly' }]} />
          <p className="sd-fc-cost">Cost type: {cfg.costType}</p>
          {cfg.forecastMetrics.map(m => (
            <div key={m} className="sd-fc-row"><span>{m} <Info size={12} /></span><b>{forecast.values?.[m] || '—'}</b></div>
          ))}
          {forecast.missing.length > 0 && (
            <div className="sd-fc-todo"><p>To see a forecast:</p><ul>{forecast.missing.map(m => <li key={m}>{m}</li>)}</ul></div>
          )}
        </aside>
      </div>
    </div>
  );
}
