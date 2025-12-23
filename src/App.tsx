import Sidebar from "./components/Sidebar";
import { Canvas } from "./components/Canvas";
import Inspector from "./components/Inspector";
import ExportModal from "./components/ExportModal";
import PreviewEmailModal from "./components/PreviewEmailModal";

import { useEmailBuilder } from "./hooks/useEmailBuilder";

export default function App() {
  const {
    modules,
    selectedId,

    exportOpen,
    exportHtml,
    previewOpen,

    setSelectedId,
    setExportOpen,
    setPreviewOpen,

    addTopLevelModule,
    addNestedModule,
    moveTopLevelModule,
    moveNestedModule,
    removeModule,
    duplicateModule,
    updateModuleValue,
    buildExportHtml,
  } = useEmailBuilder();

  const selectedModule =
    modules.find((m) => m.id === selectedId) || null;

  return (
    <div className="flex h-screen">
      <Sidebar onAdd={addTopLevelModule} />

      <Canvas
        modules={modules}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onRemove={removeModule}
        onDuplicate={duplicateModule}
        onAddTopLevel={addTopLevelModule}
        onAddNested={addNestedModule}
        onReorderTopLevel={moveTopLevelModule}
        onReorderNested={moveNestedModule}
      />

      <Inspector
        module={selectedModule}
        onChangeField={(field, value) =>
          selectedModule &&
          updateModuleValue(selectedModule.id, field, value)
        }
      />

      {exportOpen && (
        <ExportModal
          html={exportHtml}
          onClose={() => setExportOpen(false)}
          onPreview={() => setPreviewOpen(true)}
        />
      )}

      {previewOpen && (
        <PreviewEmailModal
          html={exportHtml}
          onClose={() => setPreviewOpen(false)}
        />
      )}

      <button
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded"
        onClick={buildExportHtml}
      >
        Export HTML
      </button>
    </div>
  );
}