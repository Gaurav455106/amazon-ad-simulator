import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import CampaignTypeCard from './createCampaign/CampaignTypeCard';
import { SLIDES } from './createCampaign/adSlides';
import { ROUTES } from '../routes';

// Sponsored Products card tabs, as on the console's "Choose your campaign type" page.
const SP_TABS = [
  {
    key: 'beyond', label: 'Amazon and beyond',
    headline: 'Promote product listings',
    desc: 'Sponsored Products can help promote products to shoppers actively searching with related keywords or viewing similar products on Amazon.',
    link: 'Learn about Sponsored Products', route: '/cb/sp',
  },
  {
    key: 'business', label: 'Amazon Business',
    headline: 'Reach business customers',
    desc: 'Amazon Business simplifies buying for organisations of any size with business-relevant products, tools, and features.',
    link: 'How to choose where your ads appear', route: '/cb/sp?site=amazon-business',
  },
];

/** "Choose your campaign type" (/cb). */
export default function CreateCampaign() {
  const navigate = useNavigate();
  const [spTab, setSpTab] = useState('beyond');
  const sp = SP_TABS.find(t => t.key === spTab);

  return (
    <div className="cct-page">
      <div className="cct-subheader">
        <button type="button" className="cct-country">India <ChevronDown size={16} /></button>
      </div>
      <div className="cct-title-row">
        <h1 className="cct-title">Choose your campaign type</h1>
        <button type="button" className="cct-drafts" onClick={() => navigate(ROUTES.drafts)}>View drafts</button>
      </div>

      <div className="cct-grid">
        <div className="cct-col">
          <CampaignTypeCard title="Sponsored Products" tabs={SP_TABS} tab={spTab} onTab={setSpTab}
            slides={SLIDES.sp} headline={sp.headline} desc={sp.desc} link={sp.link} onCreate={() => navigate(sp.route)} />
          <CampaignTypeCard title="Sponsored Brands" slides={SLIDES.sb}
            headline="Drive brand discovery across Amazon"
            desc="Showcase your brand and products where shoppers browse and search on Amazon with engaging ad formats, including video."
            link="Learn about Sponsored Brands" onCreate={() => navigate('/cb/sb')} />
        </div>
        <div className="cct-col">
          <CampaignTypeCard title="Display, Video, and Audio" slides={SLIDES.sd} subTitle="Display"
            desc="Reach, re-engage, and convert customers wherever they spend time using their past behaviours and interests on Amazon."
            link="Learn about Display" onCreate={() => navigate('/cb/sd')} />
        </div>
      </div>
    </div>
  );
}
