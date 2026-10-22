import { useStore } from '../../../store/useStore';
import ProductImage from '../../../components/console/ProductImage';

const FORMAT_LABEL = { image: 'Image', video: 'Video' };

/** Display ad group creative summary (format, products, optional headline). */
export default function CreativeTab({ campaign, adGroup }) {
  const products = useStore(s => s.products);
  const creative = campaign.sdCreative || {};
  const asins = adGroup.products?.length ? adGroup.products : (creative.products || []);

  return (
    <div className="cx-settings">
      <div className="cx-settings-row"><div>Ad format</div><div>{FORMAT_LABEL[creative.adFormat] || 'Image'}</div></div>
      <div className="cx-settings-row"><div>Moderation status</div><div><span className="cx-status is-delivering">Approved</span></div></div>
      <div className="cx-settings-row">
        <div>Products</div>
        <div className="creative-products">
          {asins.map(asin => {
            const p = products.find(x => x.asin === asin);
            return (
              <div key={asin} className="prod-row">
                <ProductImage imageType={p?.imageType} size={44} />
                <span className="prod-row-text">{p?.name || asin}<span className="cx-sub">ASIN: {asin}</span></span>
              </div>
            );
          })}
          {asins.length === 0 && <span className="cx-sub">No products</span>}
        </div>
      </div>
      <div className="cx-settings-row"><div>Logo</div><div>{creative.logo === false ? <span className="cx-sub">Off</span> : 'Brand logo'}</div></div>
      <div className="cx-settings-row"><div>Headline</div><div>{creative.headline || <span className="cx-sub">Not added</span>}</div></div>
    </div>
  );
}
