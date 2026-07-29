// 13-Qavat: Design System — Modal.
// Repo'da bu turdagi komponent avval umuman bo'lmagan (tekshirilgan: hech
// bir modulda "modal" so'zi ishlatilmagan) — shuning uchun bu yerda
// nol'dan, minimal-lekin-to'g'ri (Escape, tashqariga bosish, a11y
// atributlari) qilib yoziladi. `createPortal` ishlatilmaydi — loyihada
// bitta `#root` konteyneridan boshqa maxsus portal-node yo'q, va overlay
// `position: fixed` bo'lgani uchun DOM ichida qayerda render bo'lishi
// vizual natijaga ta'sir qilmaydi.
import { useEffect, useRef } from "react";

export function Modal({ title, onClose, children, footer }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    dialogRef.current?.focus();
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget) onClose();
  }

  return (
    <div className="ui-modal-overlay" onMouseDown={handleOverlayClick}>
      <div
        className="ui-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={dialogRef}
      >
        <div className="ui-modal-header">
          {title && <h3 className="ui-modal-title">{title}</h3>}
          <button
            type="button"
            className="ui-modal-close"
            onClick={onClose}
            aria-label="Yopish"
          >
            ✕
          </button>
        </div>
        {children}
        {footer && <div className="ui-card-footer">{footer}</div>}
      </div>
    </div>
  );
}
