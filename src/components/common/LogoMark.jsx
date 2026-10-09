/** Maple leaf outline (100×100 box) used in the logo and as a decorative icon. */
export const LEAF_PATH = 'M50 2 L56 14 L63 10 L61 32 L71 22 L75 29 L87 26 L83 39 L95 44 L77 58 L80 67 L57 63 L53 64 L53 97 L47 97 L47 64 L43 63 L20 67 L23 58 L5 44 L17 39 L13 26 L25 29 L29 22 L39 32 L37 10 L44 14 L50 2 Z';

export function MapleLeaf({ className = 'maple-leaf' }) {
  return <svg className={className} viewBox="0 0 100 100" aria-hidden="true" focusable="false"><path d={LEAF_PATH} fill="currentColor" /></svg>;
}

/**
 * The RMC house mark (roof, window, maple leaf, "RMC"), drawn as SVG so it stays
 * sharp at every size. Navy parts use currentColor, so the light logo variant
 * simply sets color: white; the window and leaf stay red.
 */
export default function LogoMark({ className = 'logo-mark', title }) {
  return (
    <svg className={className} viewBox="0 0 150 100" role={title ? 'img' : undefined} aria-hidden={title ? undefined : 'true'} focusable="false">
      {title && <title>{title}</title>}
      <path d="M6 50 L56 10 L84 32" fill="none" stroke="currentColor" strokeWidth="9" />
      <path d="M98 32 L112 32 L146 56" fill="none" stroke="currentColor" strokeWidth="7.5" />
      <g fill="#E21F26">
        <rect x="37" y="33" width="6" height="6" /><rect x="45" y="33" width="6" height="6" />
        <rect x="37" y="41" width="6" height="6" /><rect x="45" y="41" width="6" height="6" />
      </g>
      <path d={LEAF_PATH} fill="#E21F26" transform="translate(70 3) scale(.36)" />
      <text x="76" y="97" textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontStyle="italic" fontWeight="900" fontSize="54" fill="currentColor" letterSpacing="-2">RMC</text>
    </svg>
  );
}
