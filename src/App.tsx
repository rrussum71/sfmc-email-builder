import Sidebar from "./components/Sidebar";
import { Canvas } from "./components/Canvas";
import Inspector from "./components/Inspector";
import ExportModal from "./components/ExportModal";
import PreviewEmailModal from "./components/PreviewEmailModal";  // ⭐ NEW IMPORT

import { useEmailBuilder } from "./hooks/useEmailBuilder";

export default function App() {
  const {
    modules,
    selectedId,

    exportOpen,
    exportHtml,
    previewOpen,     // ⭐ PREVIEW STATE

    setSelectedId,
    setExportOpen,
    setPreviewOpen,  // ⭐ PREVIEW HANDLER

    addTopLevelModule,
    addNestedModule,
    moveTopLevelModule,
    moveNestedModule,
    removeModule,
    updateModuleValue,
    buildExportHtml,
  } = useEmailBuilder();

  const selectedModule =
    modules.find((m) => m.id === selectedId) || null;

  return (
    <div className="flex h-screen">

      {/* SIDEBAR */}
      <Sidebar onAdd={(key: string) => addTopLevelModule(key)} />

      {/* CANVAS */}
      <Canvas
        modules={modules}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onRemove={removeModule}
        onAddTopLevel={addTopLevelModule}
        onAddNested={addNestedModule}
        onReorderTopLevel={moveTopLevelModule}
        onReorderNested={moveNestedModule}
      />

      {/* INSPECTOR */}
      <Inspector
  module={selectedModule}
  onChangeField={(fieldId: string, value: string) =>
    updateModuleValue(selectedId!, fieldId, value)
  }
/>

      {/* EXPORT MODAL */}
      {exportOpen && (
        <ExportModal
          html={exportHtml}
          onClose={() => setExportOpen(false)}
          onPreview={() => setPreviewOpen(true)} // ⭐ WIRE PREVIEW
        />
      )}

      {/* PREVIEW MODAL */}
      {previewOpen && (
        <PreviewEmailModal
          html={exportHtml}
          onClose={() => setPreviewOpen(false)}
        />
      )}

      {/* EXPORT BUTTON */}
      <button
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow"
        onClick={buildExportHtml}
      >
        Export HTML
      </button>
    </div>
  );
}
