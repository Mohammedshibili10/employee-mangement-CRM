function Modal({ isOpen, onClose, title, children, size = "md" }) {
  if (!isOpen) return null;

  const widths = {
    md: "max-w-md",
    lg: "max-w-lg",
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-xl shadow-lg w-full ${widths[size]}`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="p-5 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
