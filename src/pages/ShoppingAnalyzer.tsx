import { useEffect, useMemo, useState } from "react";
import FileDropzone from "../components/FileDropzone";
import StatCard from "../components/StatCard";
import ExportMenu from "../components/ExportMenu";
import ExportPreviewModal from "../components/ExportPreviewModal";
import BackupBanner from "../components/BackupBanner";
import Guide from "../components/Guide";
import { parseProductsFile, SHOPPING_REPORT_HELP } from "../lib/shoppingParser";
import { buildProductExclusionItem, classifyProducts } from "../lib/classification";
import { buildExportContent, downloadExport, exportFileName } from "../lib/exporters";
import { clearBackup, isBackupFresh, loadBackup, saveBackup } from "../lib/storage";
import type {
  ExclusionItem,
  ExportFormat,
  ProcessState,
  ProductAnalyzed,
  ProductRaw,
  ShoppingStatus,
  SortDirection,
  StorageBackup,
} from "../types";
import { ParseError } from "../types";

type SortableColumn = "clicks" | "cost" | "conversions";
type QuickFilter = "all" | "zombie" | "below-target" | "above-target";

const STATUS_LABELS: Record<ShoppingStatus, string> = {
  zombie: "Zombie",
  underperforming: "Sous la cible",
  top: "Top performer",
  neutral: "Neutre",
};

const STATUS_ROW_CLASSES: Record<ShoppingStatus, string> = {
  zombie: "bg-red-50",
  underperforming: "bg-orange-50",
  top: "bg-green-50",
  neutral: "bg-white",
};

const STATUS_BADGE_CLASSES: Record<ShoppingStatus, string> = {
  zombie: "bg-red-100 text-red-700",
  underperforming: "bg-orange-100 text-orange-700",
  top: "bg-green-100 text-green-700",
  neutral: "bg-slate-100 text-slate-500",
};

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#e2e8f0"/><path d="M18 40l10-12 8 9 6-7 10 10" stroke="#94a3b8" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="24" cy="22" r="4" fill="#94a3b8"/></svg>',
  );

function roasTone(roas: number, roasTarget: number): string {
  if (roas < 1) return "text-red-600";
  if (roas < roasTarget) return "text-orange-500";
  return "text-green-600";
}

export default function ShoppingAnalyzer() {
  const [processState, setProcessState] = useState<ProcessState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>("");

  const [rawRows, setRawRows] = useState<ProductRaw[]>([]);
  const [roasTargetInput, setRoasTargetInput] = useState("3.0");
  const [zombieThresholdInput, setZombieThresholdInput] = useState("15");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [sortColumn, setSortColumn] = useState<SortableColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [exclusions, setExclusions] = useState<ExclusionItem[]>([]);
  const [exportFormat, setExportFormat] = useState<ExportFormat | null>(null);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

  const [backup, setBackup] = useState<StorageBackup<ProductRaw> | null>(null);
  const [backupDismissed, setBackupDismissed] = useState(false);

  useEffect(() => {
    const stored = loadBackup<ProductRaw>("shopping");
    if (isBackupFresh(stored)) {
      setBackup(stored);
    }
  }, []);

  const roasTarget = Number.parseFloat(roasTargetInput) || 3;
  const zombieThreshold = Number.parseFloat(zombieThresholdInput) || 15;

  const analyzedRows = useMemo<ProductAnalyzed[]>(
    () => classifyProducts(rawRows, { roasTarget, zombieThreshold }),
    [rawRows, roasTarget, zombieThreshold],
  );

  async function handleFile(file: File) {
    setProcessState("reading");
    setErrorMessage(null);
    setNotes([]);
    setFileName(file.name);
    try {
      setProcessState("analyzing");
      const result = await parseProductsFile(file);
      setRawRows(result.rows);
      setNotes(result.notes);
      setSelectedIds(new Set());
      setExclusions([]);
      setBrokenImages(new Set());
      setProcessState("success");
      saveBackup<ProductRaw>("shopping", {
        timestamp: Date.now(),
        fileName: file.name,
        data: result.rows,
        exclusions: [],
        meta: { roasTargetInput, zombieThresholdInput },
      });
    } catch (error) {
      setProcessState("error");
      if (error instanceof ParseError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          `Une erreur inattendue est survenue pendant la lecture du fichier. ${SHOPPING_REPORT_HELP}`,
        );
      }
    }
  }

  function handleResumeBackup() {
    if (!backup) return;
    setRawRows(backup.data);
    setFileName(backup.fileName);
    setExclusions(backup.exclusions);
    const meta = backup.meta as { roasTargetInput?: string; zombieThresholdInput?: string } | undefined;
    setRoasTargetInput(meta?.roasTargetInput ?? "3.0");
    setZombieThresholdInput(meta?.zombieThresholdInput ?? "15");
    setNotes([]);
    setProcessState("success");
    setBackupDismissed(true);
  }

  function handleDismissBackup() {
    setBackupDismissed(true);
    clearBackup("shopping");
  }

  const hasIssuesColumn = analyzedRows.some((row) => row.issues.trim() !== "");

  const visibleRows = useMemo(() => {
    let filtered = analyzedRows;
    if (quickFilter === "zombie") filtered = filtered.filter((r) => r.statusClass === "zombie");
    if (quickFilter === "below-target") filtered = filtered.filter((r) => r.roas < roasTarget);
    if (quickFilter === "above-target") filtered = filtered.filter((r) => r.roas >= roasTarget);

    if (!sortColumn) return filtered;
    return [...filtered].sort((a, b) => {
      const diff = a[sortColumn] - b[sortColumn];
      return sortDirection === "asc" ? diff : -diff;
    });
  }, [analyzedRows, quickFilter, roasTarget, sortColumn, sortDirection]);

  const stats = useMemo(() => {
    const total = analyzedRows.length;
    const zombieRows = analyzedRows.filter((r) => r.statusClass === "zombie");
    const topCount = analyzedRows.filter((r) => r.statusClass === "top").length;
    const wastedCost = zombieRows.reduce((sum, r) => sum + r.cost, 0);
    return { total, zombieCount: zombieRows.length, topCount, wastedCost };
  }, [analyzedRows]);

  function toggleSort(column: SortableColumn) {
    if (sortColumn === column) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  }

  function toggleRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllVisible() {
    setSelectedIds(new Set(visibleRows.map((r) => r.id)));
  }

  function selectNone() {
    setSelectedIds(new Set());
  }

  function selectZombies() {
    setSelectedIds(new Set(analyzedRows.filter((r) => r.statusClass === "zombie").map((r) => r.id)));
  }

  function handleConfirmExclusion() {
    const selectedRows = analyzedRows.filter((r) => selectedIds.has(r.id));
    if (selectedRows.length === 0) return;
    const newItems = selectedRows.map((row) => buildProductExclusionItem(row, roasTarget));
    setExclusions((prev) => {
      const byKey = new Map(prev.map((item) => [item.itemId || item.sourceLabel, item]));
      for (const item of newItems) byKey.set(item.itemId || item.sourceLabel, item);
      return [...byKey.values()];
    });
    saveBackup<ProductRaw>("shopping", {
      timestamp: Date.now(),
      fileName,
      data: rawRows,
      exclusions: [...exclusions, ...newItems],
      meta: { roasTargetInput, zombieThresholdInput },
    });
  }

  function handleDownload() {
    if (!exportFormat) return;
    const content = buildExportContent(exclusions, exportFormat, "shopping");
    const name = exportFileName("shopping", exportFormat);
    downloadExport(content, name, exportFormat);
    setExportFormat(null);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Analyseur Shopping / PMax</h1>
        <p className="mt-1 text-slate-600">
          Repérez les produits « zombies » qui dépensent sans jamais convertir.
        </p>
      </div>

      {backup && !backupDismissed && (
        <BackupBanner
          timestamp={backup.timestamp}
          fileName={backup.fileName}
          onResume={handleResumeBackup}
          onDismiss={handleDismissBackup}
        />
      )}

      <FileDropzone
        label="Déposez votre export CSV « Produits », ou cliquez pour sélectionner"
        hint="Shopping standard ou performance produit Performance Max"
        disabled={processState === "reading" || processState === "analyzing"}
        onFileSelected={handleFile}
      />

      {(processState === "reading" || processState === "analyzing") && (
        <p className="text-sm font-medium text-slate-500" role="status">
          {processState === "reading" ? "Lecture du fichier…" : "Analyse en cours…"}
        </p>
      )}

      {processState === "error" && errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {errorMessage}
        </div>
      )}

      {processState === "success" && notes.length > 0 && (
        <p className="text-sm text-slate-500">{notes.join(" ")}</p>
      )}

      {processState === "success" && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:max-w-lg">
            <div>
              <label htmlFor="roas-target" className="block text-sm font-semibold text-slate-700">
                ROAS cible
              </label>
              <input
                id="roas-target"
                type="number"
                step="0.1"
                min="0"
                value={roasTargetInput}
                onChange={(event) => setRoasTargetInput(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-brand-blue"
              />
            </div>
            <div>
              <label htmlFor="zombie-threshold" className="block text-sm font-semibold text-slate-700">
                Seuil « zombie » (€)
              </label>
              <input
                id="zombie-threshold"
                type="number"
                step="1"
                min="0"
                value={zombieThresholdInput}
                onChange={(event) => setZombieThresholdInput(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-brand-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Produits analysés" value={String(stats.total)} />
            <StatCard label="Zombies" value={String(stats.zombieCount)} tone="red" />
            <StatCard label="Top performers" value={String(stats.topCount)} tone="green" />
            <StatCard label="Dépense inutile cumulée" value={`${stats.wastedCost.toFixed(2)} €`} tone="red" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-700">Filtrer :</span>
            {(
              [
                ["all", "Tous"],
                ["zombie", "Zombies"],
                ["below-target", "ROAS < cible"],
                ["above-target", "ROAS ≥ cible"],
              ] as [QuickFilter, string][]
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setQuickFilter(value)}
                aria-pressed={quickFilter === value}
                className={[
                  "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                  quickFilter === value ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-500",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={selectAllVisible} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              Tout sélectionner
            </button>
            <button type="button" onClick={selectNone} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              Ne rien sélectionner
            </button>
            <button type="button" onClick={selectZombies} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              Sélectionner les zombies
            </button>
            <span className="ml-auto self-center text-xs font-medium text-slate-500">
              {selectedIds.size} sélectionné(s)
            </span>
          </div>

          {/* Tableau desktop */}
          <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-3"></th>
                  <th className="px-3 py-3">Produit</th>
                  <th className="px-3 py-3">Prix</th>
                  <SortableHeader label="Clics" column="clicks" activeColumn={sortColumn} direction={sortDirection} onSort={toggleSort} />
                  <SortableHeader label="Coût" column="cost" activeColumn={sortColumn} direction={sortDirection} onSort={toggleSort} />
                  <th className="px-3 py-3">Valeur conv.</th>
                  <th className="px-3 py-3">ROAS</th>
                  {hasIssuesColumn && <th className="px-3 py-3">Problèmes</th>}
                  <th className="px-3 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleRows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => toggleRow(row.id)}
                    className={`cursor-pointer ${STATUS_ROW_CLASSES[row.statusClass]} hover:brightness-95`}
                  >
                    <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(row.id)}
                        onChange={() => toggleRow(row.id)}
                        aria-label={`Sélectionner ${row.title}`}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={brokenImages.has(row.id) ? PLACEHOLDER_IMAGE : row.imageUrl || PLACEHOLDER_IMAGE}
                          onError={() => setBrokenImages((prev) => new Set(prev).add(row.id))}
                          alt=""
                          className="h-16 w-16 shrink-0 rounded-lg border border-slate-200 object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-800">{row.title || "(sans titre)"}</p>
                          <p className="truncate text-xs text-slate-400">{row.itemId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 tabular-nums">{row.price.toFixed(2)} €</td>
                    <td className="px-3 py-2 tabular-nums">{row.clicks}</td>
                    <td className="px-3 py-2 tabular-nums">{row.cost.toFixed(2)} €</td>
                    <td className="px-3 py-2 tabular-nums">{row.conversionValue.toFixed(2)} €</td>
                    <td className={`px-3 py-2 font-semibold tabular-nums ${roasTone(row.roas, roasTarget)}`}>
                      {row.roas.toFixed(2)}
                    </td>
                    {hasIssuesColumn && (
                      <td className="px-3 py-2 max-w-[200px] truncate text-xs text-slate-500">{row.issues}</td>
                    )}
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE_CLASSES[row.statusClass]}`}>
                        {STATUS_LABELS[row.statusClass]}
                      </span>
                    </td>
                  </tr>
                ))}
                {visibleRows.length === 0 && (
                  <tr>
                    <td colSpan={hasIssuesColumn ? 9 : 8} className="px-3 py-8 text-center text-slate-400">
                      Aucun produit ne correspond aux filtres actifs.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Cartes empilées mobile */}
          <div className="space-y-3 md:hidden">
            {visibleRows.map((row) => (
              <div
                key={row.id}
                onClick={() => toggleRow(row.id)}
                className={`rounded-2xl border border-slate-200 p-4 ${STATUS_ROW_CLASSES[row.statusClass]}`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(row.id)}
                    onChange={() => toggleRow(row.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1"
                    aria-label={`Sélectionner ${row.title}`}
                  />
                  <img
                    src={brokenImages.has(row.id) ? PLACEHOLDER_IMAGE : row.imageUrl || PLACEHOLDER_IMAGE}
                    onError={() => setBrokenImages((prev) => new Set(prev).add(row.id))}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-lg border border-slate-200 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-800">{row.title || "(sans titre)"}</p>
                        <p className="truncate text-xs text-slate-400">{row.itemId}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE_CLASSES[row.statusClass]}`}>
                        {STATUS_LABELS[row.statusClass]}
                      </span>
                    </div>
                    <dl className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <div><dt className="text-slate-400">Coût</dt><dd className="font-semibold">{row.cost.toFixed(2)} €</dd></div>
                      <div><dt className="text-slate-400">ROAS</dt><dd className={`font-semibold ${roasTone(row.roas, roasTarget)}`}>{row.roas.toFixed(2)}</dd></div>
                    </dl>
                    {row.issues && <p className="mt-2 text-xs text-slate-500">⚠ {row.issues}</p>}
                  </div>
                </div>
              </div>
            ))}
            {visibleRows.length === 0 && (
              <p className="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-slate-400">
                Aucun produit ne correspond aux filtres actifs.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-slate-800">Liste d'exclusions : {exclusions.length} élément(s)</p>
              <p className="text-xs text-slate-500">Confirmez la sélection ci-dessus pour l'ajouter à cette liste avant export.</p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <button
                type="button"
                onClick={handleConfirmExclusion}
                disabled={selectedIds.size === 0}
                className="w-full rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                Confirmer l'exclusion
              </button>
              <ExportMenu disabled={exclusions.length === 0} onSelectFormat={setExportFormat} />
            </div>
          </div>
        </>
      )}

      <Guide
        title="Guide d'utilisation"
        sections={[
          {
            title: "Exporter le rapport depuis Google Ads",
            content: (
              <p>
                Shopping standard : campagne → Produits → Télécharger. Performance Max : Insights
                et rapports → performances produit → Télécharger → CSV.
              </p>
            ),
          },
          {
            title: "Comprendre le ROAS et le seuil zombie",
            content: (
              <p>
                Le ROAS (Return On Ad Spend) est la valeur de conversion générée pour 1 € dépensé.
                Un produit « zombie » a dépensé plus que le seuil sans jamais convertir : c'est une
                perte sèche. Le seuil est ajustable pour éviter de signaler des produits à faible
                volume, pas encore significatifs.
              </p>
            ),
          },
          {
            title: "Appliquer les exclusions",
            content: (
              <p>
                Depuis Merchant Center (exclusion de produits) ou en suspendant directement les
                produits concernés dans votre campagne Google Ads.
              </p>
            ),
          },
        ]}
      />

      {exportFormat && (
        <ExportPreviewModal
          format={exportFormat}
          items={exclusions}
          fileName={exportFileName("shopping", exportFormat)}
          onConfirm={handleDownload}
          onCancel={() => setExportFormat(null)}
        />
      )}
    </div>
  );
}

interface SortableHeaderProps {
  label: string;
  column: SortableColumn;
  activeColumn: SortableColumn | null;
  direction: SortDirection;
  onSort: (column: SortableColumn) => void;
}

function SortableHeader({ label, column, activeColumn, direction, onSort }: SortableHeaderProps) {
  const isActive = activeColumn === column;
  return (
    <th className="px-3 py-3">
      <button type="button" onClick={() => onSort(column)} className="flex items-center gap-1 font-semibold uppercase">
        {label}
        <span className={isActive ? "text-slate-700" : "text-slate-300"}>{direction === "asc" ? "↑" : "↓"}</span>
      </button>
    </th>
  );
}
