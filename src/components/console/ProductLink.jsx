import { amazonPdpUrl } from '../../data/demoProducts';

/** Product title linking to its amazon.in detail page in a new tab, as product titles do in the console. */
export default function ProductLink({ asin, className, children }) {
  const href = amazonPdpUrl(asin);
  if (!href) return <span className={className}>{children}</span>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`product-link ${className || ''}`}
      onClick={e => e.stopPropagation()}>
      {children}
    </a>
  );
}
