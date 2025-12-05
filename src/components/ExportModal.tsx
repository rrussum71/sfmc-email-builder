import type { FC } from "react";

interface ExportModalProps {
  html: string;
  onClose: () => void;
}

const ExportModal: FC<ExportModalProps> = ({ html, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-700">
            Exported HTML
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-2 py-1 rounded border border-slate-300 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <pre className="text-[11px] leading-snug font-mono whitespace-pre">
            {html}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;