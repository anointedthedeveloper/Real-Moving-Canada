import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import Spinner from './Spinner.jsx';

/**
 * Button that renders as a router <Link> (`to`), a plain anchor (`href`, for
 * external/tel/mailto links) or a <button>. Variants follow the design:
 * primary (red), dark, outline, light (white on photos), ghost and link.
 */
export default function Button({
  to, href, variant = 'primary', size = 'md', block = false, loading = false,
  icon, iconRight, className = '', children, external, type = 'button', disabled, ...rest
}) {
  const cls = ['btn', `btn-${variant}`, size !== 'md' && `btn-${size}`, block && 'btn-block', className].filter(Boolean).join(' ');
  const content = (
    <>
      {loading ? <Spinner size={16} /> : icon && <Icon name={icon} />}
      {children && <span>{children}</span>}
      {iconRight && !loading && <Icon name={iconRight} />}
    </>
  );

  if (to && !disabled) return <Link to={to} className={cls} {...rest}>{content}</Link>;
  if (href && !disabled) {
    const ext = external ?? /^https?:/.test(href);
    return (
      <a href={href} className={cls} {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
        {content}
      </a>
    );
  }
  return (
    <button type={type} className={cls} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {content}
    </button>
  );
}
