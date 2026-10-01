import { ICONS } from './icons.js';

/** Inline SVG icon. Decorative by default; pass `label` when the icon carries meaning on its own. */
export default function Icon({ name, size, className = '', label, ...rest }) {
  const body = ICONS[name] || ICONS.box;
  return (
    <svg
      className={`icon ${className}`.trim()}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden={label ? undefined : 'true'}
      role={label ? 'img' : undefined}
      aria-label={label}
      focusable="false"
      dangerouslySetInnerHTML={{ __html: body }}
      {...rest}
    />
  );
}
