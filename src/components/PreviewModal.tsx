import type { FC } from "react";

interface PreviewModalProps {
  url: string;
  onClose: () => void;
}

const PreviewModal: FC<PreviewModalProps> = ({ url, onClose }) => {
  if (!url) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="bg-white p-3 rounded shadow-xl max-w-[90vw] max-h-[90vh]">
        <img
          src={url}
          alt="Preview"
          className="max-w-full max-h-[85vh] object-contain"
        />
      </div>
    </div>
  );
};

export default PreviewModal;