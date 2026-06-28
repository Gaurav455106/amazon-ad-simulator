import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';

/* ── SVG mockup images ─────────────────────────────────── */

function SPMockup() {
  return (
    <svg viewBox="0 0 340 220" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      {/* Browser chrome */}
      <rect width="340" height="220" rx="6" fill="#fff" stroke="#e0e0e0" strokeWidth="1"/>
      <rect width="340" height="28" rx="6" fill="#f5f5f5"/>
      <rect x="0" y="22" width="340" height="6" fill="#f5f5f5"/>
      <circle cx="14" cy="14" r="4" fill="#f44336"/>
      <circle cx="26" cy="14" r="4" fill="#ffc107"/>
      <circle cx="38" cy="14" r="4" fill="#4caf50"/>
      <rect x="60" y="8" width="220" height="12" rx="6" fill="#e0e0e0"/>

      {/* Amazon header bar */}
      <rect y="28" width="340" height="20" fill="#232f3e"/>
      <text x="8" y="41" fontFamily="Arial" fontSize="9" fontWeight="bold" fill="white">amazon</text>
      <rect x="50" y="32" width="180" height="12" rx="2" fill="white"/>
      <rect x="232" y="32" width="26" height="12" rx="2" fill="#febd69"/>
      <text x="240" y="41" fontFamily="Arial" fontSize="7" fill="#111">GO</text>
      <rect x="264" y="32" width="36" height="12" rx="2" fill="#232f3e" stroke="#888" strokeWidth="0.5"/>
      <text x="270" y="41" fontFamily="Arial" fontSize="6" fill="white">Cart (2)</text>
      <text x="308" y="41" fontFamily="Arial" fontSize="6" fill="white">Sign in</text>

      {/* Sponsored banner - top of search */}
      <rect y="48" width="340" height="16" fill="#fff8e1" rx="0"/>
      <rect x="6" y="52" width="50" height="8" rx="2" fill="#febd69"/>
      <text x="9" y="58" fontFamily="Arial" fontSize="5.5" fontWeight="bold" fill="#111">Sponsored</text>
      <rect x="64" y="52" width="120" height="5" rx="1" fill="#e0e0e0"/>
      <rect x="64" y="59" width="80" height="4" rx="1" fill="#f0f0f0"/>
      <rect x="258" y="50" width="56" height="14" rx="2" fill="#e47911"/>
      <text x="269" y="60" fontFamily="Arial" fontSize="5.5" fontWeight="bold" fill="white">Shop Now</text>

      {/* Search results label */}
      <text x="6" y="76" fontFamily="Arial" fontSize="6" fill="#565959">1-16 of 500 results for "wireless headphones"</text>

      {/* Product grid - row 1 */}
      {/* Product 1 - Sponsored highlighted */}
      <rect x="6" y="80" width="74" height="90" rx="3" fill="#fff" stroke="#e47911" strokeWidth="1.5"/>
      <rect x="14" y="84" width="58" height="40" rx="2" fill="#f0f4f8"/>
      <rect x="22" y="90" width="42" height="28" rx="2" fill="#c8d8e8"/>
      <rect x="30" y="96" width="26" height="16" rx="2" fill="#a0b8d0"/>
      <text x="8" y="133" fontFamily="Arial" fontSize="4.5" fill="#e47911" fontWeight="bold">Sponsored</text>
      <text x="8" y="140" fontFamily="Arial" fontSize="5" fill="#111">SoundMax Pro</text>
      <text x="8" y="147" fontFamily="Arial" fontSize="5" fill="#111">Headphones</text>
      <text x="8" y="155" fontFamily="Arial" fontSize="6" fontWeight="bold" fill="#111">₹2,499</text>
      <text x="8" y="162" fontFamily="Arial" fontSize="5" fill="#e47911">★★★★☆ 4.5</text>

      {/* Product 2 */}
      <rect x="86" y="80" width="74" height="90" rx="3" fill="#fff" stroke="#e0e0e0" strokeWidth="0.8"/>
      <rect x="94" y="84" width="58" height="40" rx="2" fill="#f0f4f8"/>
      <rect x="102" y="90" width="42" height="28" rx="2" fill="#d0c8e8"/>
      <rect x="110" y="96" width="26" height="16" rx="2" fill="#b0a0d0"/>
      <text x="88" y="133" fontFamily="Arial" fontSize="4.5" fill="#565959">-</text>
      <text x="88" y="140" fontFamily="Arial" fontSize="5" fill="#111">Bluetooth Elite</text>
      <text x="88" y="147" fontFamily="Arial" fontSize="5" fill="#111">Earbuds</text>
      <text x="88" y="155" fontFamily="Arial" fontSize="6" fontWeight="bold" fill="#111">₹1,799</text>
      <text x="88" y="162" fontFamily="Arial" fontSize="5" fill="#e47911">★★★★★ 4.8</text>

      {/* Product 3 */}
      <rect x="166" y="80" width="74" height="90" rx="3" fill="#fff" stroke="#e0e0e0" strokeWidth="0.8"/>
      <rect x="174" y="84" width="58" height="40" rx="2" fill="#f0f4f8"/>
      <rect x="182" y="90" width="42" height="28" rx="2" fill="#e8d0c8"/>
      <rect x="190" y="96" width="26" height="16" rx="2" fill="#d0b0a0"/>
      <text x="168" y="133" fontFamily="Arial" fontSize="4.5" fill="#565959">-</text>
      <text x="168" y="140" fontFamily="Arial" fontSize="5" fill="#111">NoisePro ANC</text>
      <text x="168" y="147" fontFamily="Arial" fontSize="5" fill="#111">Over-Ear</text>
      <text x="168" y="155" fontFamily="Arial" fontSize="6" fontWeight="bold" fill="#111">₹3,299</text>
      <text x="168" y="162" fontFamily="Arial" fontSize="5" fill="#e47911">★★★★☆ 4.3</text>

      {/* Product 4 */}
      <rect x="258" y="80" width="74" height="90" rx="3" fill="#fff" stroke="#e0e0e0" strokeWidth="0.8"/>
      <rect x="266" y="84" width="58" height="40" rx="2" fill="#f0f4f8"/>
      <rect x="274" y="90" width="42" height="28" rx="2" fill="#c8e8d0"/>
      <rect x="282" y="96" width="26" height="16" rx="2" fill="#a0d0b0"/>
      <text x="260" y="133" fontFamily="Arial" fontSize="4.5" fill="#e47911" fontWeight="bold">Sponsored</text>
      <text x="260" y="140" fontFamily="Arial" fontSize="5" fill="#111">AudioMax Lite</text>
      <text x="260" y="147" fontFamily="Arial" fontSize="5" fill="#111">Sports Buds</text>
      <text x="260" y="155" fontFamily="Arial" fontSize="6" fontWeight="bold" fill="#111">₹999</text>
      <text x="260" y="162" fontFamily="Arial" fontSize="5" fill="#e47911">★★★★☆ 4.1</text>

      {/* Sponsored badge overlay */}
      <rect x="6" y="80" width="74" height="8" rx="2" fill="#e47911" opacity="0.15"/>
      <rect x="258" y="80" width="74" height="8" rx="2" fill="#e47911" opacity="0.15"/>

      {/* Bottom bar */}
      <rect y="178" width="340" height="42" fill="#f7f7f7"/>
      <text x="120" y="194" fontFamily="Arial" fontSize="5.5" fill="#565959">Pagination</text>
      <rect x="100" y="200" width="20" height="8" rx="2" fill="#e47911"/>
      <rect x="126" y="200" width="20" height="8" rx="2" fill="#f0f0f0" stroke="#ddd" strokeWidth="0.5"/>
      <rect x="152" y="200" width="20" height="8" rx="2" fill="#f0f0f0" stroke="#ddd" strokeWidth="0.5"/>
      <rect x="178" y="200" width="20" height="8" rx="2" fill="#f0f0f0" stroke="#ddd" strokeWidth="0.5"/>
      <text x="106" y="207" fontFamily="Arial" fontSize="5.5" fill="white">1</text>
      <text x="132" y="207" fontFamily="Arial" fontSize="5.5" fill="#111">2</text>
      <text x="158" y="207" fontFamily="Arial" fontSize="5.5" fill="#111">3</text>
      <text x="184" y="207" fontFamily="Arial" fontSize="5.5" fill="#111">4</text>
    </svg>
  );
}

function SBMockup() {
  return (
    <svg viewBox="0 0 340 220" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="340" height="220" rx="6" fill="#fff" stroke="#e0e0e0" strokeWidth="1"/>
      <rect width="340" height="28" rx="6" fill="#f5f5f5"/>
      <rect x="0" y="22" width="340" height="6" fill="#f5f5f5"/>
      <circle cx="14" cy="14" r="4" fill="#f44336"/>
      <circle cx="26" cy="14" r="4" fill="#ffc107"/>
      <circle cx="38" cy="14" r="4" fill="#4caf50"/>
      <rect x="60" y="8" width="220" height="12" rx="6" fill="#e0e0e0"/>

      {/* Amazon header */}
      <rect y="28" width="340" height="20" fill="#232f3e"/>
      <text x="8" y="41" fontFamily="Arial" fontSize="9" fontWeight="bold" fill="white">amazon</text>
      <rect x="50" y="32" width="180" height="12" rx="2" fill="white"/>
      <rect x="232" y="32" width="26" height="12" rx="2" fill="#febd69"/>
      <text x="308" y="41" fontFamily="Arial" fontSize="6" fill="white">Sign in</text>

      {/* Sponsored Brands banner - top of search */}
      <rect y="48" width="340" height="52" fill="#f8f4ff" stroke="#e0d0ff" strokeWidth="1"/>
      {/* Brand logo area */}
      <rect x="8" y="54" width="60" height="38" rx="4" fill="#6c2eb9"/>
      <text x="14" y="72" fontFamily="Arial" fontSize="7" fontWeight="bold" fill="white">SOUND</text>
      <text x="16" y="82" fontFamily="Arial" fontSize="7" fontWeight="bold" fill="#febd69">MAX</text>
      {/* Headline */}
      <text x="76" y="63" fontFamily="Arial" fontSize="7" fontWeight="bold" fill="#111">SoundMax — Premium Audio for Every Moment</text>
      <text x="76" y="73" fontFamily="Arial" fontSize="6" fill="#565959">Shop our full range of wireless headphones & earbuds</text>
      {/* Mini product images */}
      <rect x="76" y="78" width="38" height="18" rx="3" fill="#e8d8f8"/>
      <rect x="120" y="78" width="38" height="18" rx="3" fill="#d8e8f8"/>
      <rect x="164" y="78" width="38" height="18" rx="3" fill="#f8e8d8"/>
      <text x="266" y="72" fontFamily="Arial" fontSize="5.5" fill="#e47911">Sponsored</text>
      <rect x="260" y="76" width="60" height="14" rx="3" fill="#232f3e"/>
      <text x="270" y="86" fontFamily="Arial" fontSize="5.5" fill="white" fontWeight="bold">Shop now →</text>

      {/* Results below */}
      <text x="6" y="112" fontFamily="Arial" fontSize="6" fill="#565959">Results for "wireless headphones"</text>

      {/* Product grid */}
      {[0,1,2,3].map(i => (
        <g key={i}>
          <rect x={6 + i * 82} y="118" width="74" height="80" rx="3" fill="#fff" stroke="#e0e0e0" strokeWidth="0.8"/>
          <rect x={14 + i * 82} y="122" width="58" height="38" rx="2" fill={['#f0f4f8','#f4f0f8','#f0f8f4','#f8f4f0'][i]}/>
          <rect x={22 + i * 82} y="128" width="42" height="26" rx="2" fill={['#c8d8e8','#d8c8e8','#c8e8d8','#e8d8c8'][i]}/>
          <text x={8 + i * 82} y="170" fontFamily="Arial" fontSize="5" fill="#111">Product {i+1}</text>
          <text x={8 + i * 82} y="180" fontFamily="Arial" fontSize="6" fontWeight="bold" fill="#111">₹{[2499,1799,3299,999][i]}</text>
          <text x={8 + i * 82} y="188" fontFamily="Arial" fontSize="4.5" fill="#e47911">{'★★★★' + (i < 2 ? '★' : '☆')} 4.{[5,8,3,1][i]}</text>
        </g>
      ))}

      {/* Bottom */}
      <rect y="205" width="340" height="15" fill="#f7f7f7"/>
    </svg>
  );
}

function DisplayMockup() {
  return (
    <svg viewBox="0 0 340 220" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="340" height="220" rx="6" fill="#fff" stroke="#e0e0e0" strokeWidth="1"/>
      <rect width="340" height="28" rx="6" fill="#f5f5f5"/>
      <rect x="0" y="22" width="340" height="6" fill="#f5f5f5"/>
      <circle cx="14" cy="14" r="4" fill="#f44336"/>
      <circle cx="26" cy="14" r="4" fill="#ffc107"/>
      <circle cx="38" cy="14" r="4" fill="#4caf50"/>
      <rect x="60" y="8" width="220" height="12" rx="6" fill="#e0e0e0"/>

      {/* Amazon header */}
      <rect y="28" width="340" height="20" fill="#232f3e"/>
      <text x="8" y="41" fontFamily="Arial" fontSize="9" fontWeight="bold" fill="white">amazon</text>
      <rect x="50" y="32" width="180" height="12" rx="2" fill="white"/>

      {/* Product detail page */}
      <text x="8" y="60" fontFamily="Arial" fontSize="7" fill="#565959">Electronics › Headphones</text>

      {/* Main product image area */}
      <rect x="8" y="64" width="100" height="90" rx="4" fill="#f0f4f8"/>
      <rect x="20" y="74" width="78" height="70" rx="3" fill="#c8d8e8"/>
      <rect x="30" y="82" width="58" height="54" rx="2" fill="#a0b8d0"/>

      {/* Product info */}
      <text x="116" y="72" fontFamily="Arial" fontSize="6" fontWeight="bold" fill="#111">Competitor Headphones Pro Max</text>
      <text x="116" y="81" fontFamily="Arial" fontSize="5.5" fill="#565959">by AudioBrand</text>
      <text x="116" y="90" fontFamily="Arial" fontSize="5" fill="#e47911">★★★★☆ 4.2 · 1,234 ratings</text>
      <text x="116" y="103" fontFamily="Arial" fontSize="9" fontWeight="bold" fill="#111">₹4,999</text>
      <text x="116" y="113" fontFamily="Arial" fontSize="5.5" fill="#e47911">FREE delivery tomorrow</text>
      <rect x="116" y="120" width="90" height="14" rx="3" fill="#febd69"/>
      <text x="140" y="130" fontFamily="Arial" fontSize="6" fontWeight="bold" fill="#111">Add to Cart</text>
      <rect x="116" y="138" width="90" height="14" rx="3" fill="#e47911"/>
      <text x="135" y="148" fontFamily="Arial" fontSize="6" fontWeight="bold" fill="white">Buy Now</text>

      {/* Display ad - right sidebar / Sponsored Display */}
      <rect x="228" y="48" width="104" height="140" rx="5" fill="linear-gradient(180deg,#1a1a2e,#16213e)" stroke="#e47911" strokeWidth="2"/>
      <rect x="228" y="48" width="104" height="140" rx="5" fill="#1a1a2e"/>
      {/* Ad image area */}
      <rect x="234" y="54" width="92" height="58" rx="3" fill="#2d2d4e"/>
      <rect x="244" y="60" width="72" height="46" rx="3" fill="#4a4a7e"/>
      <rect x="254" y="66" width="52" height="34" rx="2" fill="#6c2eb9"/>
      {/* Headphones icon suggestion */}
      <ellipse cx="280" cy="80" rx="18" ry="14" fill="none" stroke="#febd69" strokeWidth="3"/>
      <line x1="262" y1="80" x2="262" y2="72" stroke="#febd69" strokeWidth="3"/>
      <line x1="298" y1="80" x2="298" y2="72" stroke="#febd69" strokeWidth="3"/>
      <rect x="258" y="68" width="8" height="8" rx="2" fill="#febd69"/>
      <rect x="294" y="68" width="8" height="8" rx="2" fill="#febd69"/>

      {/* Ad text */}
      <text x="280" y="122" fontFamily="Arial" fontSize="6" fontWeight="bold" fill="white" textAnchor="middle">SoundMax Pro</text>
      <text x="280" y="131" fontFamily="Arial" fontSize="5.5" fill="#ccc" textAnchor="middle">Premium Wireless</text>
      <text x="280" y="140" fontFamily="Arial" fontSize="5.5" fill="#ccc" textAnchor="middle">Headphones</text>
      <text x="280" y="152" fontFamily="Arial" fontSize="8" fontWeight="bold" fill="#febd69" textAnchor="middle">₹2,499</text>
      <rect x="240" y="157" width="80" height="16" rx="8" fill="#e47911"/>
      <text x="280" y="168" fontFamily="Arial" fontSize="6" fontWeight="bold" fill="white" textAnchor="middle">Shop Now</text>
      <text x="280" y="183" fontFamily="Arial" fontSize="4.5" fill="#888" textAnchor="middle">Sponsored</text>

      {/* Recommended products below */}
      <text x="8" y="168" fontFamily="Arial" fontSize="6" fontWeight="bold" fill="#111">Customers also viewed</text>
      {[0,1,2].map(i => (
        <g key={i}>
          <rect x={8 + i*72} y="174" width="64" height="38" rx="3" fill="#f5f5f5" stroke="#e0e0e0" strokeWidth="0.5"/>
          <rect x={14 + i*72} y="178" width="52" height="24" rx="2" fill={['#e8f4d8','#d8e4f4','#f4e8d4'][i]}/>
          <text x={10 + i*72} y="218" fontFamily="Arial" fontSize="4.5" fill="#111">₹{[1499,2199,899][i]}</text>
        </g>
      ))}
    </svg>
  );
}

/* ── Carousel component ──────────────────────────────────── */
function Carousel({ slides }) {
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx(i => (i - 1 + slides.length) % slides.length);
  const next = () => setIdx(i => (i + 1) % slides.length);
  return (
    <div className="cc-carousel">
      <div className="cc-carousel-inner">{slides[idx]}</div>
      {slides.length > 1 && (
        <>
          <button className="cc-carousel-btn left" onClick={prev}><ChevronLeft size={16} /></button>
          <button className="cc-carousel-btn right" onClick={next}><ChevronRight size={16} /></button>
          <div className="cc-carousel-dots">
            {slides.map((_, i) => (
              <button key={i} className={`cc-dot ${i === idx ? 'active' : ''}`} onClick={() => setIdx(i)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────── */
export default function CreateCampaign() {
  const navigate = useNavigate();

  const types = [
    {
      id: 'sp',
      title: 'Sponsored Products',
      headline: 'Promote product listings',
      desc: 'Sponsored Products can help promote products to shoppers actively searching with related keywords or viewing similar products on Amazon.',
      link: 'Learn about Sponsored Products',
      slides: [<SPMockup key="sp1" />, <SPMockup key="sp2" />],
      route: '/create-campaign/sponsored-products',
      comingSoon: false,
    },
    {
      id: 'sb',
      title: 'Sponsored Brands',
      headline: 'Drive brand discovery across Amazon',
      desc: 'Showcase your brand and products where shoppers browse and search on Amazon with engaging ad formats, including video.',
      link: 'Learn about Sponsored Brands',
      slides: [<SBMockup key="sb1" />, <SBMockup key="sb2" />],
      route: '/create-campaign/sponsored-brands',
      comingSoon: true,
    },
  ];

  const display = {
    id: 'display',
    title: 'Display, Video, and Audio',
    subTitle: 'Display',
    headline: 'Reach, re-engage, and convert customers',
    desc: 'Reach, re-engage, and convert customers wherever they spend time using their past behaviours and interests on Amazon.',
    link: 'Learn about Display',
    slides: [<DisplayMockup key="d1" />, <DisplayMockup key="d2" />],
    route: '/create-campaign/display',
    comingSoon: true,
  };

  const handleCreate = (type) => {
    navigate(type.route);
  };

  return (
    <div className="cc-page">
      {/* Sub-header */}
      <div className="cc-subheader">
        <div className="cc-country-selector">
          <span>India</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>

      {/* Title row */}
      <div className="cc-title-row">
        <h1 className="cc-title">Choose your campaign type</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>View drafts</button>
      </div>

      {/* Two-column layout */}
      <div className="cc-layout">

        {/* LEFT COLUMN — Sponsored Products + Sponsored Brands */}
        <div className="cc-left">
          {types.map(type => (
            <div key={type.id} className={`cc-card${type.comingSoon ? ' cc-card-coming-soon' : ''}`}>
              {type.comingSoon && <div className="cc-coming-soon-badge">Coming Soon</div>}
              <div className="cc-card-title">{type.title}</div>
              <div className="cc-card-body">
                <div className="cc-card-image">
                  <Carousel slides={type.slides} />
                </div>
                <div className="cc-card-info">
                  <h3 className="cc-card-headline">{type.headline}</h3>
                  <p className="cc-card-desc">{type.desc}</p>
                  <a href="#" className="cc-learn-link" onClick={e => e.preventDefault()}>
                    <HelpCircle size={13} />
                    {type.link}
                  </a>
                  {type.comingSoon ? (
                    <button className="cc-create-btn cc-create-btn-disabled" disabled>
                      Coming Soon
                    </button>
                  ) : (
                    <button className="cc-create-btn" onClick={() => handleCreate(type)}>
                      Create campaign
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT COLUMN — Display, Video, and Audio */}
        <div className="cc-right">
          <div className={`cc-card cc-card-full${display.comingSoon ? ' cc-card-coming-soon' : ''}`}>
            {display.comingSoon && <div className="cc-coming-soon-badge">Coming Soon</div>}
            <div className="cc-card-title">{display.title}</div>
            <div className="cc-card-body cc-card-body-vertical">
              <div className="cc-card-image cc-card-image-tall">
                <Carousel slides={display.slides} />
              </div>
              <div className="cc-card-info">
                <h3 className="cc-display-sub">{display.subTitle}</h3>
                <p className="cc-card-desc">{display.desc}</p>
                <a href="#" className="cc-learn-link" onClick={e => e.preventDefault()}>
                  <HelpCircle size={13} />
                  {display.link}
                </a>
                {display.comingSoon ? (
                  <button className="cc-create-btn cc-create-btn-disabled" disabled>
                    Coming Soon
                  </button>
                ) : (
                  <button className="cc-create-btn" onClick={() => handleCreate(display)}>
                    Create campaign
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
