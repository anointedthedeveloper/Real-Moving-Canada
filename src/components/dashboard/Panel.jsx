/** White card with a title row — the basic building block of every portal page. */
export default function Panel({ title, subtitle, badge, action, children, className = '', dark = false, as: Tag = 'section' }) {
  return (
    <Tag className={`panel${dark ? ' panel-dark' : ''} ${className}`.trim()} aria-label={typeof title === 'string' ? title : undefined}>
      {(title || badge || action) && (
        <header className="panel-head">
          <div>
            {title && <h3>{title}</h3>}
            {subtitle && <p className="panel-sub">{subtitle}</p>}
          </div>
          {(badge || action) && <div className="panel-head-side">{badge}{action}</div>}
        </header>
      )}
      {children}
    </Tag>
  );
}
