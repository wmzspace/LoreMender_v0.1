import { Fragment, type ReactNode } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  if (!open) return null;
  return (
    <Fragment>
      <div className="sheet-backdrop" onClick={onClose}/>
      <div className="sheet">
        <div className="paper-panel" style={{
          margin: 0,
          borderRadius: "12px 12px 0 0",
          padding: "14px 18px 20px",
          maxHeight: "70vh",
          overflowY: "auto",
        }}>
          <div style={{
            width: 40, height: 4, background: "rgba(78,58,20,0.4)",
            margin: "0 auto 12px", borderRadius: 2,
          }}/>
          {children}
        </div>
      </div>
    </Fragment>
  );
}
