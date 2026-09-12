import type { ExclusionItem, ExportFormat } from "../types";
import { buildExportPreview } from "../lib/exporters";

interface ExportPreviewModalProps {
  format: ExportFormat;
  items: ExclusionItem[];
  fileName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const FORMAT_LABELS: Record<ExportFormat, string> = {
  "google-ads": "Google Ads (CSV)",
  "simple-list": "Liste simple (TXT)",
  detailed: "Export détaillé (CSV)",
};

/**
 * Avant tout téléchargement : nombre d'éléments, coût cumulé, et les 10
 * premiers éléments. Un export d'exclusions s'applique à un compte réel ;
 * cette relecture évite les mauvaises surprises.
 */
export default function ExportPreviewModal({
  format,
  items,
  fileName,
  onConfirm,
  onCancel,
}: ExportPreviewModalProps) {
  const preview = buildExportPreview(items);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-preview-title"
    >
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <h2 id="export-preview-title" className="text-xl font-black text-slate-900">
          Prévisualiser l'export
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Format : <span className="font-semibold text-slate-700">{FORMAT_LABELS[format]}</span> —
          fichier <span className="font-mono">{fileName}</span>
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-medium text-slate-500">Éléments sélectionnés</p>
            <p className="mt-1 text-xl font-black text-slate-900">{preview.count}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-medium text-slate-500">Coût cumulé sur la période du fichier</p>
            <p className="mt-1 text-xl font-black text-red-600">
              {preview.totalCost.toFixed(2)} €
            </p>
          </div>
        </div>

        <p className="mt-5 text-sm font-semibold text-slate-700">
          Aperçu des {Math.min(10, preview.firstItems.length)} premiers éléments :
        </p>
        <ul className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
          {preview.firstItems.map((item, index) => (
            <li key={`${item.value}-${index}`} className="flex items-center justify-between px-3 py-2 text-sm">
              <span className="truncate pr-2 text-slate-700">{item.sourceLabel || item.value}</span>
              <span className="whitespace-nowrap font-mono text-xs text-slate-500">
                {item.cost.toFixed(2)} €
              </span>
            </li>
          ))}
          {preview.firstItems.length === 0 && (
            <li className="px-3 py-4 text-center text-sm text-slate-400">Aucun élément sélectionné.</li>
          )}
        </ul>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="w-full rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={preview.count === 0}
            className="brand-gradient w-full rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            Confirmer et télécharger
          </button>
        </div>
      </div>
    </div>
  );
}
