import type { ReactNode } from "react";

interface ConfirmModalProps {
  eyebrow: string;
  title: string;
  text: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** 通用二次确认弹窗（复用 .item-modal 视觉），用于「跳过会影响结局/得分」一类警示。 */
export function ConfirmModal({
  eyebrow, title, text, confirmLabel, cancelLabel = "再 想 想", onConfirm, onCancel,
}: ConfirmModalProps) {
  return (
    <div className="item-modal-backdrop" onClick={onCancel}>
      <div className="item-modal" onClick={(e) => e.stopPropagation()}>
        <div className="item-modal-eyebrow">{eyebrow}</div>
        <div className="confirm-modal-title">{title}</div>
        <div className="confirm-modal-text">{text}</div>
        <div className="confirm-modal-btnrow">
          <button className="btn-ghost press" onClick={onCancel}>{cancelLabel}</button>
          <button className="btn-primary press" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
