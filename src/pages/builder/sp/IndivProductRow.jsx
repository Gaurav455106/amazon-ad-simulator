import Info from '../../../components/console/InfoGlyph';

const inr = (n) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const STAR_PATH = 'M8 1.2l2.1 4.3 4.7.7-3.4 3.3.8 4.7L8 12l-4.2 2.2.8-4.7L1.2 6.2l4.7-.7z';

function Stars({ value }) {
  return (
    <span className="ip-stars" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
          <path d={STAR_PATH} fill={value >= i - 0.25 ? '#de7921' : 'none'} stroke="#de7921" strokeWidth="1" />
        </svg>
      ))}
    </span>
  );
}

/**
 * "Individual Products" suggestion row, laid out like the console: product details in the
 * first column (spanning one line per match type), then Sugg. bid | Type | Add per type.
 * @param {{ product: object, image: import('react').ReactNode, types: Array<'Exact'|'Expanded'>,
 *           isAdded: (type: string) => boolean, onAdd: (type: string) => void }} props
 */
export default function IndivProductRow({ product: p, image, types, isAdded, onAdd }) {
  const isDeal = p.originalPrice && p.originalPrice > p.price;
  const isOut = p.status && p.status !== 'In stock';
  const suggFor = (type) => (type === 'Exact' ? p.sugg : p.suggExpanded);
  return (
    <div className="ip-row" style={{ gridTemplateRows: `repeat(${Math.max(1, types.length)}, auto)` }}>
      <div className="ip-product" style={{ gridRow: `1 / span ${Math.max(1, types.length)}` }}>
        {isDeal && <span className="ip-deal">Best Deal</span>}
        <div className="ip-body">
          <div className="ip-img">{image}</div>
          <div className="ip-info">
            <span className="ip-title">{p.name}</span>
            <span className="ip-rating"><Stars value={p.stars} /><span className="ip-count">({p.reviews.toLocaleString('en-IN')})</span></span>
            {isDeal
              ? <span className="ip-price"><s>{inr(p.originalPrice)}</s> <b>{inr(p.price)}</b></span>
              : <span className="ip-muted">Price may vary by location</span>}
            <span className={isOut ? 'ip-stock is-out' : 'ip-stock'}>{isOut && <Info size={11} />} {p.status || 'In stock'}</span>
            <span className="ip-asin">ASIN: {p.asin}</span>
          </div>
        </div>
      </div>
      {types.map(type => (
        <div key={type} className="ip-type-cells">
          <span className="ip-sugg">{suggFor(type) ? inr(suggFor(type)) : '-'}</span>
          <span className="ip-type">{type}</span>
          {isAdded(type)
            ? <span className="ip-added">Added</span>
            : <button type="button" className="ip-add" onClick={() => onAdd(type)}>Add</button>}
        </div>
      ))}
    </div>
  );
}
