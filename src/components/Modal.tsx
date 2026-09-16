"use client";

import { useEffect } from "react";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
  wide?: boolean;
};

/** М'який попап: затемнення, легкий масштаб, Esc і клік поза вікном закривають. */
export function Modal({ open, title, onClose, children, actions, wide }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.classList.add("modal-open");
    return () => { window.removeEventListener("keydown", onKey); document.body.classList.remove("modal-open"); };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-back" onClick={onClose}>
      <div className={`modal ${wide ? "wide" : ""}`} role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{title}</h2>
          <div className="modal-actions">
            {actions}
            <button className="modal-x" onClick={onClose} aria-label="Закрити">✕</button>
          </div>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
