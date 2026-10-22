import { Link, useParams } from 'react-router-dom';
import { ROUTES } from '../routes';

/** Console areas that exist in the real Amazon Ads menu but aren't simulated. */
export default function Unavailable() {
  const { feature } = useParams();
  return (
    <div className="cx-unavailable">
      <h1>{decodeURIComponent(feature || 'This tool')}</h1>
      <p>
        This is part of the real Amazon Ads console, so it appears in the menu where you will find it at work.
        It isn&apos;t included in the simulator — practise campaign management from Campaigns.
      </p>
      <Link className="cx-btn cx-btn-primary" to={ROUTES.allCampaigns}>Go to Campaigns</Link>
    </div>
  );
}
