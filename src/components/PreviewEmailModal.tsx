// src/components/PreviewEmailModal.tsx
import type { FC } from "react";

interface PreviewEmailModalProps {
  html: string;
  onClose: () => void;
}

const PreviewEmailModal: FC<PreviewEmailModalProps> = ({ html, onClose }) => {
  if (!html) return null;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-semibold text-slate-700">Email Preview</h2>
          <button
            className="text-xs px-2 py-1 border rounded hover:bg-slate-100"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <iframe
          src={url}
          className="w-full h-[80vh] border"
          title="Email Preview"
        />
      </div>
    </div>
  );
};

export default PreviewEmailModal;
