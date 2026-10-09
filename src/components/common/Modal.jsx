import { useEffect, useRef } from 'react';
import Icon from './Icon.jsx';

/** Accessible dialog on top of the native <dialog> element (focus trap and Esc handled by the browser). */
export default function Modal({ open, onClose, title, children, footer }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog ref={ref} className="modal" onClose={onClose} onClick={(e) => { if (e.target === ref.current) onClose(); }} aria-labelledby="modal-title">
      <div className="modal-card">
        <header className="modal-head">
          <h2 id="modal-title">{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" /></button>
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-foot">{footer}</footer>}
      </div>
    </dialog>
  );
}
