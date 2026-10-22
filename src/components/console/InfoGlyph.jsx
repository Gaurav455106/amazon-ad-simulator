/** The console's solid "ⓘ" info glyph (dark disc, white "i"). Drop-in for lucide's outline Info. */
export default function InfoGlyph({ size = 14, className, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" className={className} style={{ flexShrink: 0, verticalAlign: 'middle' }} {...rest}>
      <circle cx="8" cy="8" r="8" fill="#3f4448" />
      <circle cx="8" cy="4.6" r="1.1" fill="#fff" />
      <rect x="7" y="6.6" width="2" height="5.6" rx="0.6" fill="#fff" />
    </svg>
  );
}
