// Slides shown in each campaign-type carousel (original illustrations).
import { Bar, Stars, Tile, AdCard, Laptop, Phone, DesktopHeader, PhoneHeader, Sidebar, ResultGrid, LINE, ORANGE, BLUE, DARK } from './illustrationParts';

export const SLIDES = {
  sp: [
    { caption: 'Sponsored Products ad format on top of search on desktop', art: <Laptop><DesktopHeader /><Sidebar /><ResultGrid /><AdCard x={66} y={20} /></Laptop> },
    { caption: 'Sponsored Products ad format on top of search on mobile', art: (
      <Phone><PhoneHeader />
        {[38, 70, 102, 134].map(y => <g key={y}><rect x="106" y={y} width="20" height="20" rx="2" fill="#f3f3f3" stroke={LINE} strokeWidth={0.6} /><Bar x={130} y={y + 3} w={40} /><Stars x={132} y={y + 11} /><Bar x={130} y={y + 15} w={22} /></g>)}
        <rect x="104" y="64" width="12" height="26" fill={ORANGE} />
        <AdCard x={118} y={58} w={92} h={50} />
      </Phone>
    ) },
  ],
  sb: [
    { caption: 'Sponsored Brands product collection ad on top of search', art: (
      <Laptop><DesktopHeader /><Sidebar />
        <rect x="74" y="31" width="160" height="50" rx="2" fill={ORANGE} />
        <rect x="78" y="35" width="152" height="42" rx="2" fill="#fff" filter="url(#lift)" />
        <text x="82" y="44" fontSize="6" fontWeight="700" fill="#c40000" fontFamily="Arial">BRAND</text>
        {[0, 1, 2].map(i => <g key={i}><rect x={116 + i * 38} y="40" width="30" height="24" rx="2" fill="#fff7ef" /><rect x={127 + i * 38} y="43" width="8" height="18" rx="2" fill={[ORANGE, '#e64980', BLUE][i]} opacity={0.85} /><Bar x={116 + i * 38} y={68} w={28} h={2.5} /></g>)}
        {[0, 1, 2, 3].map(c => <Tile key={c} x={84 + c * 38} y={88} w={30} />)}
      </Laptop>
    ) },
    { caption: 'Sponsored Brands video ad in search results', art: (
      <Laptop><DesktopHeader /><Sidebar /><ResultGrid y={34} rows={1} />
        <rect x="74" y="80" width="160" height="40" rx="2" fill="#fff" stroke={ORANGE} strokeWidth={1.4} />
        <rect x="78" y="84" width="70" height="32" rx="2" fill="#3b4250" /><path d="M108 94l12 6-12 6z" fill="#fff" />
        <rect x="154" y="86" width="22" height="26" rx="2" fill="#fff7ef" /><rect x="161" y="89" width="8" height="20" rx="2" fill={BLUE} />
        <Bar x={180} y={88} w={46} /><Stars x={182} y={96} /><Bar x={180} y={101} w={28} />
      </Laptop>
    ) },
    { caption: 'Sponsored Brands store spotlight on top of search', art: (
      <Laptop><DesktopHeader /><Sidebar />
        <rect x="74" y="31" width="160" height="48" rx="2" fill="#fff" stroke={LINE} filter="url(#lift)" />
        <text x="80" y="41" fontSize="6" fontWeight="700" fill={DARK} fontFamily="Arial">Brand Store</text>
        {[0, 1, 2].map(i => <g key={i}><rect x={80 + i * 50} y="46" width="44" height="26" rx="2" fill={['#ffe8d6', '#dbe7ff', '#e6f7ea'][i]} /><Bar x={84 + i * 50} y={67} w={30} h={2.5} fill="#9aa0a6" /></g>)}
        {[0, 1, 2, 3].map(c => <Tile key={c} x={84 + c * 38} y={86} w={30} />)}
      </Laptop>
    ) },
    { caption: 'Sponsored Brands ad on mobile search', art: (
      <Phone><PhoneHeader />
        <rect x="104" y="36" width="72" height="40" rx="3" fill="#fff" stroke={ORANGE} strokeWidth={1.2} />
        <text x="108" y="45" fontSize="5" fontWeight="700" fill="#c40000" fontFamily="Arial">BRAND</text>
        {[0, 1, 2].map(i => <g key={i}><rect x={108 + i * 22} y="49" width="18" height="18" rx="2" fill="#fff7ef" /><rect x={114 + i * 22} y="51" width="6" height="14" rx="2" fill={[ORANGE, '#e64980', BLUE][i]} opacity={0.85} /></g>)}
        {[84, 112, 140].map(y => <g key={y}><rect x="106" y={y} width="20" height="20" rx="2" fill="#f3f3f3" stroke={LINE} strokeWidth={0.6} /><Bar x={130} y={y + 3} w={40} /><Stars x={132} y={y + 11} /></g>)}
      </Phone>
    ) },
  ],
  sd: [
    { caption: 'Sponsored Display video ad on a mobile product page', art: (
      <Phone><PhoneHeader />
        <rect x="104" y="36" width="72" height="56" rx="3" fill="#fff" stroke={BLUE} strokeWidth={1.4} />
        <rect x="107" y="39" width="66" height="36" rx="2" fill="#3b4250" /><path d="M136 51l10 6-10 6z" fill="#fff" />
        <Bar x={108} y={80} w={52} h={2.5} fill="#9aa0a6" /><Bar x={108} y={85} w={30} h={2.5} />
        {[100, 128].map(y => <g key={y}><rect x="106" y={y} width="30" height="22" rx="2" fill="#f3f3f3" stroke={LINE} strokeWidth={0.6} /><rect x="142" y={y} width="30" height="22" rx="2" fill="#f3f3f3" stroke={LINE} strokeWidth={0.6} /></g>)}
      </Phone>
    ) },
    { caption: 'Sponsored Display ad on a third-party browsing site', art: (
      <Laptop>
        <rect x="40" y="14" width="200" height="12" fill="#f3f3f3" /><text x="46" y="23" fontSize="6" fontWeight="700" fill={DARK} fontFamily="Arial">Browse</text>
        {[0, 1, 2, 3].map(i => <rect key={i} x={46 + i * 46} y="30" width="40" height="7" rx="2" fill="#7b4fe0" opacity={0.75} />)}
        {Array.from({ length: 10 }).map((_, i) => <rect key={i} x={46 + (i % 5) * 26} y={44 + Math.floor(i / 5) * 40} width="22" height="34" rx="1.5" fill="#f3f3f3" stroke={LINE} strokeWidth={0.6} />)}
        <g filter="url(#lift)"><rect x="174" y="48" width="60" height="58" rx="3" fill="#fff" /><rect x="178" y="52" width="52" height="30" rx="2" fill="url(#hero)" /><Bar x={180} y={88} w={40} h={3} fill="#9aa0a6" /><rect x="212" y="96" width="18" height="6" rx="1.5" fill={BLUE} /></g>
      </Laptop>
    ) },
    { caption: 'Sponsored Display banner on an Amazon page', art: (
      <Laptop><DesktopHeader />
        {[0, 1, 2, 3].map(c => <rect key={c} x={50 + c * 46} y="32" width="40" height="20" rx="2" fill="#f3f3f3" stroke={LINE} strokeWidth={0.6} />)}
        <rect x="46" y="58" width="188" height="34" rx="2" fill="url(#hero)" filter="url(#lift)" />
        <circle cx="64" cy="75" r="9" fill="#fff" opacity={0.9} /><text x="78" y="73" fontSize="8" fill="#fff" fontFamily="Arial">Your brand</text><Bar x={78} y={79} w={40} h={3} fill="#fff" />
        <rect x="190" y="64" width="38" height="22" rx="2" fill="#fff" /><rect x="200" y="67" width="18" height="16" rx="3" fill={BLUE} />
        {[0, 1, 2, 3].map(c => <rect key={c} x={50 + c * 46} y="98" width="40" height="26" rx="2" fill="#f3f3f3" stroke={LINE} strokeWidth={0.6} />)}
      </Laptop>
    ) },
    { caption: 'Sponsored Display ad on a product detail page on desktop', art: (
      <Laptop><DesktopHeader />
        <rect x="48" y="32" width="56" height="56" rx="2" fill="#f3f3f3" stroke={LINE} strokeWidth={0.6} />
        <Bar x={112} y={34} w={70} h={4} fill="#9aa0a6" /><Stars x={114} y={45} /><Bar x={112} y={50} w={34} h={4} /><Bar x={112} y={60} w={60} /><Bar x={112} y={66} w={52} />
        <AdCard x={188} y={32} w={46} h={66} accent={BLUE} label="Sponsored" />
        {[0, 1, 2, 3].map(c => <rect key={c} x={48 + c * 34} y="98" width="28" height="26" rx="2" fill="#f3f3f3" stroke={LINE} strokeWidth={0.6} />)}
      </Laptop>
    ) },
    { caption: 'Sponsored Display ad below the search results on mobile', art: (
      <Phone><PhoneHeader />
        {[38, 66].map(y => <g key={y}><rect x="106" y={y} width="20" height="20" rx="2" fill="#f3f3f3" stroke={LINE} strokeWidth={0.6} /><Bar x={130} y={y + 3} w={40} /><Stars x={132} y={y + 11} /></g>)}
        <rect x="104" y="94" width="72" height="44" rx="3" fill="#fff" stroke={BLUE} strokeWidth={1.2} filter="url(#lift)" />
        <rect x="108" y="98" width="28" height="36" rx="2" fill="url(#hero)" /><Bar x={140} y={102} w={32} h={3} fill="#9aa0a6" /><Stars x={142} y={112} /><rect x="140" y="124" width="22" height="7" rx="1.5" fill={BLUE} />
      </Phone>
    ) },
  ],
};
