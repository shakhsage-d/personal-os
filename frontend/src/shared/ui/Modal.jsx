// 13-Qavat: Design System — Modal.
// Repo'da bu turdagi komponent avval umuman bo'lmagan (tekshirilgan: hech
// bir modulda "modal" so'zi ishlatilmagan) — shuning uchun bu yerda
// nol'dan, minimal-lekin-to'g'ri (Escape, tashqariga bosish, a11y
// atributlari) qilib yoziladi. `createPortal` ishlatilmaydi — loyihada
// bitta `#root` konteyneridan boshqa maxsus portal-node yo'q, va overlay
// `position: fixed` bo'lgani uchun DOM ichida qayerda render bo'lishi
// vizual natijaga ta'sir qilmaydi.
import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({ title, onClose, children, footer }) {
  const dialogRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  useEffect(() => {
    // Modal ochilishidan oldin fokusda bo'lgan elementni eslab qolamiz
    // (masalan "Sozlash" tugmasi) — yopilganda fokus o'shanga qaytariladi,
    // aks holda klaviatura fokusi sahifa boshiga (yoki hech qayerga)
    // "yo'qolib" qolardi.
    previouslyFocusedRef.current = document.activeElement;
    dialogRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      // Focus trap: Tab modal ichidagi fokuslanadigan elementlar
      // doirasidan chiqmasligi kerak (WCAG 2.4.3 — fokus tartibi).
      if (event.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const isShift = event.shiftKey;

        if (!isShift && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        } else if (isShift && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Modal yopilgach fokusni chaqiruvchi elementga qaytaramiz.
      previouslyFocusedRef.current?.focus?.();
    };
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
