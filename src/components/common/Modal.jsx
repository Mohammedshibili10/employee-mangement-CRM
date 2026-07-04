import { createPortal } from "react-dom";

function Modal({ isOpen, onClose, title, children, size = "md" }) {
  if (!isOpen) return null;

  const widths = {
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-3xl",
  };

  // Render into document.body via a portal so the fixed overlay is always
  // positioned relative to the viewport — never trapped inside a parent
  // that has a CSS transform (e.g. page entrance animations).
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className={`relative bg-white rounded-2xl shadow-premium ring-1 ring-slate-900/5 w-full ${widths[size]} animate-scale-in`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors text-xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="p-5 max-h-[70vh] overflow-y-auto scrollbar-slim">{children}</div>
      </div>
    </div>,
    document.body
  );
}

export default Modal;
