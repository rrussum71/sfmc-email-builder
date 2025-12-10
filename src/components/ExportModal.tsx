import { useState, type FC } from "react";

interface ExportModalProps {
  html: string;
  onClose: () => void;
  onPreview: () => void; // ⭐ NEW
}

const ExportModal: FC<ExportModalProps> = ({ html, onClose, onPreview }) => {
  const [copied, setCopied] = useState(false);

  function copyToClipboard() {
    navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full h-[80vh] flex flex-col">

        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-700">Exported HTML</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-2 py-1 rounded border border-slate-300 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        {/* HTML CONTENT */}
        <div className="flex-1 overflow-auto p-4">
          <pre className="text-[11px] leading-snug font-mono whitespace-pre">
            {html}
          </pre>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="flex gap-2 p-3 border-t border-slate-200">

          {/* COPY BUTTON */}
          <button
            onClick={copyToClipboard}
            className="px-3 py-1 bg-blue-600 text-white text-xs rounded"
          >
            {copied ? "Copied!" : "Copy to Clipboard"}
          </button>

          {/* ⭐ PREVIEW BUTTON */}
          <button
            onClick={onPreview}
            className="px-3 py-1 bg-green-600 text-white text-xs rounded"
          >
            Preview Email
          </button>

          {/* CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="px-3 py-1 border text-xs rounded"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default ExportModal;
