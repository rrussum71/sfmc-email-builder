import { FC, useState } from "react";

interface ExportModalProps {
  html: string;
  onClose: () => void;
  onPreview?: () => void; // optional
}

const ExportModal: FC<ExportModalProps> = ({ html, onClose, onPreview }) => {
  const [copied, setCopied] = useState(false);

 const handleCopy = async () => {
  try {
    // Try direct clipboard first (works outside iframe)
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  } catch (err) {
    console.warn("Direct clipboard failed. Sending to parent window…");

    // Send message to parent CloudPage for clipboard handling
    try {
      window.parent.postMessage(
        {
          type: "copy_html",
          payload: html
        },
        "*"
      );
      
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error("Parent postMessage failed:", e);
    }
  }
};

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full h-[80vh] flex flex-col">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-700">Exported HTML</h2>

          <div className="flex gap-2 items-center">
            {/* COPY BUTTON */}
            <button
              onClick={handleCopy}
              className="text-xs px-2 py-1 rounded border border-slate-300 hover:bg-slate-50"
            >
              {copied ? "Copied!" : "Copy HTML"}
            </button>

            {/* PREVIEW BUTTON (optional) */}
            {onPreview && (
              <button
                onClick={onPreview}
                className="text-xs px-2 py-1 rounded border border-blue-400 text-blue-600 hover:bg-blue-50"
              >
                Preview
              </button>
            )}

            {/* CLOSE BUTTON */}
            <button
              onClick={onClose}
              className="text-xs px-2 py-1 rounded border border-slate-300 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>

        {/* BODY */}
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
