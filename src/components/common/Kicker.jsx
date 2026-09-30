/** Small uppercase section label with the gold rule from the design. */
export default function Kicker({ children, tone = 'red', as: Tag = 'p', className = '' }) {
  return <Tag className={`kicker kicker-${tone} ${className}`.trim()}>{children}</Tag>;
}
