import Library from "./components/Library";
import Canvas from "./components/Canvas";
import Inspector from "./components/Inspector";
import { useEmailBuilder } from "./hooks/useEmailBuilder";

function App() {
  const {
    modules,
    selectedId,
    bgColor,
    exportOpen,
    exportHtml,

    setBgColor,
    setSelectedId,
    setExportOpen,

    addModule,
    addNestedModule,
    moveModuleTopLevel,
    moveNestedModule,
    removeModule,
    updateModuleValue,
    buildExportHtml,
  } = useEmailBuilder();

  const selectedModule =
    modules.find((m) => m.id === selectedId) ?? null;

  return (
    <div className="flex h-screen bg-slate-100">
      {/* LEFT: Library */}
      <Library onAdd={(key) => addModule(key)} />

      {/* MIDDLE: Canvas */}
      <Canvas
        modules={modules}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onRemove={removeModule}
        onAddTopLevel={(key, index) => addModule(key, index ?? undefined)}
        onAddNested={(key, parentId, country) =>
          addNestedModule(key, parentId, country)
        }
        onReorderTopLevel={(id, newIndex) =>
          moveModuleTopLevel(id, newIndex)
        }
        onMoveNested={(id, parentId, country, newIndex) =>
          moveNestedModule(id, parentId, country, newIndex)
        }
      />

      {/* RIGHT: Inspector + Export */}
      <div className="flex flex-col w-[420px] border-l border-slate-200 bg-white">
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200">
          <span className="text-xs text-slate-500">Email Settings</span>
          <button
            type="button"
            onClick={buildExportHtml}
            className="px-3 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700"
          >
            Export HTML
          </button>
        </div>

        <Inspector
          module={selectedModule}
          bgColor={bgColor}
          onBgChange={setBgColor}
          onChangeField={(fieldId, value) => {
            if (selectedId) {
              updateModuleValue(selectedId, fieldId, value);
            }
          }}
        />
      </div>

      {exportOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-700">
                Exported HTML
              </h2>
              <button
                type="button"
                onClick={() => setExportOpen(false)}
                className="text-xs px-2 py-1 rounded border border-slate-300 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <pre className="text-[11px] leading-snug font-mono whitespace-pre">
                {exportHtml}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;