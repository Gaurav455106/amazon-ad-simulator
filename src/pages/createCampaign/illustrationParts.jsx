// Original line illustrations of where each ad type appears (laptop / phone frames with a
// simplified shopping page). Drawn for the simulator; not copies of Amazon's artwork.

export const GREY = '#e3e6e6';
export const LINE = '#d5d9d9';
export const DARK = '#232f3e';
export const ORANGE = '#ff6200';
export const STAR = '#ffa41c';
export const BLUE = '#1f6fd0';

export const Bar = ({ x, y, w, h = 3, fill = GREY }) => <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={fill} />;
export const Stars = ({ x, y }) => <g>{[0, 1, 2].map(i => <circle key={i} cx={x + i * 5} cy={y} r={1.7} fill={STAR} />)}<circle cx={x + 15} cy={y} r={1.7} fill={GREY} /></g>;

/** A search-result tile: image box, stars, price lines. */
export function Tile({ x, y, w = 34, h = 44 }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={w * 0.8} rx={2} fill="#f3f3f3" stroke={LINE} strokeWidth={0.6} />
      <Stars x={x + 3} y={y + w * 0.8 + 6} />
      <Bar x={x} y={y + w * 0.8 + 10} w={w * 0.7} h={2.5} />
      <Bar x={x} y={y + h - 3} w={w * 0.45} h={2.5} />
    </g>
  );
}

/** Product card that "pops out" of the page to show the ad. */
export function AdCard({ x, y, w = 92, h = 58, accent = ORANGE, label = 'Sponsored' }) {
  return (
    <g filter="url(#lift)">
      <rect x={x} y={y} width={w} height={h} rx={3} fill="#fff" />
      <text x={x + 6} y={y + 9} fontSize={4.5} fill="#8d9096" fontFamily="Arial">{label}</text>
      <rect x={x + 6} y={y + 13} width={26} height={30} rx={2} fill="#fff7ef" />
      <rect x={x + 13} y={y + 16} width={12} height={24} rx={3} fill={accent} opacity={0.85} />
      <rect x={x + 15} y={y + 13} width={8} height={5} rx={1} fill={DARK} />
      <Bar x={x + 38} y={y + 15} w={w - 46} h={3} fill="#9aa0a6" />
      <Bar x={x + 38} y={y + 21} w={w - 58} h={3} fill="#9aa0a6" />
      <Stars x={x + 40} y={y + 30} />
      <Bar x={x + 38} y={y + 35} w={20} h={3} />
      <rect x={x + 38} y={y + h - 12} width={34} height={7} rx={1.5} fill="#ffe38a" />
    </g>
  );
}

function Defs() {
  return (
    <defs>
      <filter id="lift" x="-20%" y="-20%" width="140%" height="160%">
        <feDropShadow dx="0" dy="2" stdDeviation="2.2" floodColor="#0f1111" floodOpacity="0.22" />
      </filter>
      <linearGradient id="hero" x1="0" x2="1"><stop offset="0" stopColor="#5b7cfa" /><stop offset="1" stopColor="#36c6e8" /></linearGradient>
    </defs>
  );
}

/** Laptop frame; children draw inside a 200 × 118 screen at (40, 14). */
export function Laptop({ children }) {
  return (
    <svg viewBox="0 0 280 170" className="cct-art" aria-hidden="true">
      <Defs />
      <rect x="34" y="8" width="212" height="132" rx="7" fill="#f7f7f7" stroke={LINE} />
      <rect x="40" y="14" width="200" height="118" fill="#fff" />
      <g>{children}</g>
      <path d="M14 140h252l-8 9H22z" fill="#eceeee" stroke={LINE} />
      <rect x="120" y="140" width="40" height="3" rx="1.5" fill={LINE} />
    </svg>
  );
}

/** Phone frame; children draw inside a 78 × 150 screen at (101, 12). */
export function Phone({ children }) {
  return (
    <svg viewBox="0 0 280 170" className="cct-art" aria-hidden="true">
      <Defs />
      <rect x="95" y="4" width="90" height="164" rx="13" fill="#f7f7f7" stroke={LINE} />
      <rect x="101" y="12" width="78" height="150" rx="6" fill="#fff" />
      <g>{children}</g>
    </svg>
  );
}

export const DesktopHeader = () => (
  <g>
    <rect x="40" y="14" width="200" height="12" fill={DARK} />
    <rect x="46" y="18" width="16" height="4" rx="1" fill="#fff" opacity={0.85} />
    <rect x="70" y="17" width="130" height="6" rx="1.5" fill="#fff" />
    <rect x="200" y="17" width="8" height="6" rx="1.5" fill={STAR} />
  </g>
);
export const PhoneHeader = () => (
  <g>
    <rect x="101" y="12" width="78" height="20" rx="6" fill={DARK} />
    <rect x="106" y="24" width="68" height="6" rx="1.5" fill="#fff" />
  </g>
);
export const Sidebar = () => <g>{[34, 42, 50, 58, 66, 74, 82, 90, 98].map(y => <Bar key={y} x={46} y={y} w={22} h={2.5} />)}</g>;
export const ResultGrid = ({ y = 34, rows = 2 }) => (
  <g>{Array.from({ length: rows }).flatMap((_, r) => [0, 1, 2, 3].map(c => <Tile key={`${r}${c}`} x={76 + c * 40} y={y + r * 50} />))}</g>
);

