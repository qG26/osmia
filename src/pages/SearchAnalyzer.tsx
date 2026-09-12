import { useEffect, useMemo, useState } from "react";
import FileDropzone from "../components/FileDropzone";
import StatCard from "../components/StatCard";
import ExportMenu from "../components/ExportMenu";
import ExportPreviewModal from "../components/ExportPreviewModal";
import BackupBanner from "../components/BackupBanner";
import Guide from "../components/Guide";
import { parseSearchTermsFile, SEARCH_REPORT_HELP } from "../lib/searchParser";
import { buildSearchExclusionItem, classifySearchTerms } from "../lib/classification";
import { buildExportContent, downloadExport, exportFileName } from "../lib/exporters";
import { loadBackup, saveBackup, clearBackup, isBackupFresh } from "../lib/storage";
import type {
  ExclusionItem,
  ExportFormat,
  ProcessState,
  SearchTermAnalyzed,
  SearchTermRaw,
  SearchTermStatus,
  SortDirection,
  StorageBackup,
} from "../types";
import { ParseError } from "../types";

type SortableColumn = "clicks" | "cost" | "conversions";

const STATUS_LABELS: Record<SearchTermStatus, string> = {
  geo: "Hors zone",
  warning: "À surveiller",
  ok: "OK",
};

const STATUS_ROW_CLASSES: Record<SearchTermStatus, string> = {
  geo: "bg-orange-50",
  warning: "bg-red-50",
  ok: "bg-white",
};

const STATUS_BADGE_CLASSES: Record<SearchTermStatus, string> = {
  geo: "bg-orange-100 text-orange-700",
  warning: "bg-red-100 text-red-700",
  ok: "bg-green-100 text-green-700",
};

const ALL_STATUSES: SearchTermStatus[] = ["geo", "warning", "ok"];

function parseZones(input: string): string[] {
  return input
    .split(",")
    .map((zone) => zone.trim())
    .filter(Boolean);
}

export default function SearchAnalyzer() {
  const [processState, setProcessState] = useState<ProcessState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>("");

  const [rawRows, setRawRows] = useState<SearchTermRaw[]>([]);
  const [allowedZonesInput, setAllowedZonesInput] = useState("");
  const [manualNegatives, setManualNegatives] = useState<Record<string, string>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [statusFilters, setStatusFilters] = useState<Set<SearchTermStatus>>(new Set(ALL_STATUSES));
  const [sortColumn, setSortColumn] = useState<SortableColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [exclusions, setExclusions] = useState<ExclusionItem[]>([]);
  const [exportFormat, setExportFormat] = useState<ExportFormat | null>(null);

  const [backup, setBackup] = useState<StorageBackup<SearchTermRaw> | null>(null);
  const [backupDismissed, setBackupDismissed] = useState(false);

  useEffect(() => {
    const stored = loadBackup<SearchTermRaw>("search");
    if (isBackupFresh(stored)) {
      setBackup(stored);
    }
  }, []);

  const allowedZones = useMemo(() => parseZones(allowedZonesInput), [allowedZonesInput]);

  const analyzedRows = useMemo<SearchTermAnalyzed[]>(
    () => classifySearchTerms(rawRows, allowedZones),
    [rawRows, allowedZones],
  );

  function negativeValueFor(row: SearchTermAnalyzed): string {
    return manualNegatives[row.id] ?? row.suggestedNegative;
  }

  async function handleFile(file: File) {
    setProcessState("reading");
    setErrorMessage(null);
    setNotes([]);
    setFileName(file.name);
    try {
      setProcessState("analyzing");
      const result = await parseSearchTermsFile(file);
      setRawRows(result.rows);
      setNotes(result.notes);
      setManualNegatives({});
      setSelectedIds(new Set());
      setExclusions([]);
      setProcessState("success");
      saveBackup<SearchTermRaw>("search", {
        timestamp: Date.now(),
        fileName: file.name,
        data: result.rows,
        exclusions: [],
        meta: { allowedZonesInput },
      });
    } catch (error) {
      setProcessState("error");
      if (error instanceof ParseError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          `Une erreur inattendue est survenue pendant la lecture du fichier. ${SEARCH_REPORT_HELP}`,
        );
      }
    }
  }

  function handleResumeBackup() {
    if (!backup) return;
    setRawRows(backup.data);
    setFileName(backup.fileName);
    setExclusions(backup.exclusions);
    const meta = backup.meta as { allowedZonesInput?: string; manualNegatives?: Record<string, string> } | undefined;
    setAllowedZonesInput(meta?.allowedZonesInput ?? "");
    setManualNegatives(meta?.manualNegatives ?? {});
    setNotes([]);
    setProcessState("success");
    setBackupDismissed(true);
  }

  function handleDismissBackup() {
    setBackupDismissed(true);
    clearBackup("search");
  }

  const visibleRows = useMemo(() => {
    const filtered = analyzedRows.filter((row) => statusFilters.has(row.status));
    if (!sortColumn) return filtered;
    const sorted = [...filtered].sort((a, b) => {
      const diff = a[sortColumn] - b[sortColumn];
      return sortDirection === "asc" ? diff : -diff;
    });
    return sorted;
  }, [analyzedRows, statusFilters, sortColumn, sortDirection]);

  const stats = useMemo(() => {
    const total = analyzedRows.length;
    const geoCount = analyzedRows.filter((r) => r.status === "geo").length;
    const warningCount = analyzedRows.filter((r) => r.status === "warning").length;
    const issueCost = analyzedRows
      .filter((r) => r.status === "geo" || r.status === "warning")
      .reduce((sum, r) => sum + r.cost, 0);
    return { total, geoCount, warningCount, issueCost };
  }, [analyzedRows]);

  function toggleSort(column: SortableColumn) {
    if (sortColumn === column) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  }

  function toggleStatusFilter(status: SearchTermStatus) {
    setStatusFilters((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
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

  function selectGeoAndWarning() {
    setSelectedIds(
      new Set(analyzedRows.filter((r) => r.status === "geo" || r.status === "warning").map((r) => r.id)),
    );
  }

  function handleConfirmExclusion() {
    const selectedRows = analyzedRows.filter((r) => selectedIds.has(r.id));
    if (selectedRows.length === 0) return;
    const newItems = selectedRows.map((row) => buildSearchExclusionItem(row, negativeValueFor(row)));
    setExclusions((prev) => {
      const byKey = new Map(prev.map((item) => [item.sourceLabel, item]));
      for (const item of newItems) byKey.set(item.sourceLabel, item);
      return [...byKey.values()];
    });
    saveBackup<SearchTermRaw>("search", {
      timestamp: Date.now(),
      fileName,
      data: rawRows,
      exclusions: [...exclusions, ...newItems],
      meta: { allowedZonesInput, manualNegatives },
    });
  }

  function handleDownload() {
    if (!exportFormat) return;
    const content = buildExportContent(exclusions, exportFormat, "search");
    const name = exportFileName("search", exportFormat);
    downloadExport(content, name, exportFormat);
    setExportFormat(null);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Analyseur de termes de recherche</h1>
        <p className="mt-1 text-slate-600">
          Repérez les requêtes hors zone et les dépenses sans conversion dans votre rapport Google Ads.
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
        label="Déposez votre export CSV « Termes de recherche », ou cliquez pour sélectionner"
        hint="Fichier CSV exporté depuis Google Ads"
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
          <div>
            <label htmlFor="allowed-zones" className="block text-sm font-semibold text-slate-700">
              Zones autorisées
            </label>
            <input
              id="allowed-zones"
              type="text"
              value={allowedZonesInput}
              onChange={(event) => setAllowedZonesInput(event.target.value)}
              placeholder="Ex : Paris, Lyon 3, Toulouse"
              className="mt-1 w-full max-w-lg rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-brand-blue"
            />
            <p className="mt-1 text-xs text-slate-500">
              Séparées par des virgules. Sans zone saisie, la détection géographique reste désactivée.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Total termes" value={String(stats.total)} />
            <StatCard label="Hors zone" value={String(stats.geoCount)} tone="orange" />
            <StatCard label="À surveiller" value={String(stats.warningCount)} tone="red" />
            <StatCard label="Coût cumulé (hors zone + à surveiller)" value={`${stats.issueCost.toFixed(2)} €`} tone="red" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-700">Filtrer :</span>
            {ALL_STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => toggleStatusFilter(status)}
                aria-pressed={statusFilters.has(status)}
                className={[
                  "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                  statusFilters.has(status)
                    ? STATUS_BADGE_CLASSES[status]
                    : "bg-slate-100 text-slate-400",
                ].join(" ")}
              >
                {STATUS_LABELS[status]}
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
            <button type="button" onClick={selectGeoAndWarning} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              Sélectionner hors zone + à surveiller
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
                  <th className="px-3 py-3">Terme</th>
                  <th className="px-3 py-3">Négatif suggéré</th>
                  <th className="px-3 py-3">Mot-clé</th>
                  <SortableHeader label="Clics" column="clicks" activeColumn={sortColumn} direction={sortDirection} onSort={toggleSort} />
                  <SortableHeader label="Coût" column="cost" activeColumn={sortColumn} direction={sortDirection} onSort={toggleSort} />
                  <SortableHeader label="Conversions" column="conversions" activeColumn={sortColumn} direction={sortDirection} onSort={toggleSort} />
                  <th className="px-3 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleRows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => toggleRow(row.id)}
                    className={`cursor-pointer ${STATUS_ROW_CLASSES[row.status]} hover:brightness-95`}
                  >
                    <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(row.id)}
                        onChange={() => toggleRow(row.id)}
                        aria-label={`Sélectionner ${row.searchTerm}`}
                      />
                    </td>
                    <td className="px-3 py-2 font-medium text-slate-800">{row.searchTerm}</td>
                    <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                      {row.status !== "ok" ? (
                        <input
                          type="text"
                          value={negativeValueFor(row)}
                          onChange={(event) =>
                            setManualNegatives((prev) => ({ ...prev, [row.id]: event.target.value }))
                          }
                          className="w-40 rounded-lg border border-slate-300 px-2 py-1 text-xs"
                        />
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-500">{row.keyword}</td>
                    <td className="px-3 py-2 tabular-nums">{row.clicks}</td>
                    <td className="px-3 py-2 tabular-nums">{row.cost.toFixed(2)} €</td>
                    <td className="px-3 py-2 tabular-nums">{row.conversions}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE_CLASSES[row.status]}`}>
                        {STATUS_LABELS[row.status]}
                      </span>
                    </td>
                  </tr>
                ))}
                {visibleRows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center text-slate-400">
                      Aucun terme ne correspond aux filtres actifs.
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
                className={`rounded-2xl border border-slate-200 p-4 ${STATUS_ROW_CLASSES[row.status]}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(row.id)}
                      onChange={() => toggleRow(row.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1"
                      aria-label={`Sélectionner ${row.searchTerm}`}
                    />
                    <p className="font-semibold text-slate-800">{row.searchTerm}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE_CLASSES[row.status]}`}>
                    {STATUS_LABELS[row.status]}
                  </span>
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-600">
                  <div><dt className="text-slate-400">Clics</dt><dd className="font-semibold">{row.clicks}</dd></div>
                  <div><dt className="text-slate-400">Coût</dt><dd className="font-semibold">{row.cost.toFixed(2)} €</dd></div>
                  <div><dt className="text-slate-400">Conv.</dt><dd className="font-semibold">{row.conversions}</dd></div>
                </dl>
                {row.status !== "ok" && (
                  <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                    <label className="text-xs font-medium text-slate-500">Négatif suggéré</label>
                    <input
                      type="text"
                      value={negativeValueFor(row)}
                      onChange={(event) =>
                        setManualNegatives((prev) => ({ ...prev, [row.id]: event.target.value }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                    />
                  </div>
                )}
              </div>
            ))}
            {visibleRows.length === 0 && (
              <p className="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-slate-400">
                Aucun terme ne correspond aux filtres actifs.
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
                Insights et rapports → Termes de recherche → sélectionnez les colonnes Clics, Coût,
                Conversions → Télécharger → CSV. N'ouvrez pas et ne réenregistrez pas le fichier
                dans Excel avant de l'importer ici : cela casse souvent l'encodage des accents.
              </p>
            ),
          },
          {
            title: "Comprendre les trois statuts",
            content: (
              <ul className="list-disc space-y-1 pl-5">
                <li><strong>Hors zone</strong> : le terme mentionne une ville hors de vos zones autorisées.</li>
                <li><strong>À surveiller</strong> : aucune conversion pour plus de 0,10 € dépensés.</li>
                <li><strong>OK</strong> : le reste, rien à faire.</li>
              </ul>
            ),
          },
          {
            title: "Réimporter les négatifs dans Google Ads",
            content: (
              <p>
                Dans Google Ads : Mots clés → Mots clés à exclure → « + » → collez la liste
                exportée, ou importez directement le CSV au format Google Ads.
              </p>
            ),
          },
        ]}
      />

      {exportFormat && (
        <ExportPreviewModal
          format={exportFormat}
          items={exclusions}
          fileName={exportFileName("search", exportFormat)}
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
