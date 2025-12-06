import Sidebar from "./components/Sidebar";
import { Canvas } from "./components/Canvas";
import Inspector from "./components/Inspector";
import ExportModal from "./components/ExportModal";

import { useEmailBuilder } from "./hooks/useEmailBuilder";

export default function App() {
  const {
    modules,
    selectedId,
    bgColor,
    exportOpen,
    exportHtml,
    setSelectedId,
    setBgColor,
    setExportOpen,
    addTopLevelModule,
    addNestedModule,
    moveTopLevelModule,
    moveNestedModule,
    removeModule,
    updateModuleValue,
    buildExportHtml,
  } = useEmailBuilder();

  const selectedModule = modules.find((m) => m.id === selectedId) || null;

  return (
    <div className="flex h-screen">
      {/* SIDEBAR */}
      <Sidebar
        onAdd={(key: string) => addTopLevelModule(key)}
      />

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
        bgColor={bgColor}
        onBgChange={(value: string) => setBgColor(value)}
        onChangeField={(fieldId: string, value: string) =>
          updateModuleValue(selectedId!, fieldId, value)
        }
      />

      {/* EXPORT MODAL */}
      {exportOpen && (
        <ExportModal
          html={exportHtml}
          onClose={() => setExportOpen(false)}
        />
      )}

      {/* FOOTER ACTION */}
      <button
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow"
        onClick={buildExportHtml}
      >
        Export HTML
      </button>
    </div>
  );
}