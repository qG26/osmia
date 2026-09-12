interface BackupBannerProps {
  timestamp: number;
  fileName: string;
  onResume: () => void;
  onDismiss: () => void;
}

function formatBackupDate(timestamp: number): string {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month} à ${hours}h${minutes}`;
}

/** Bannière discrète de reprise d'analyse. Ne restaure jamais automatiquement. */
export default function BackupBanner({ timestamp, fileName, onResume, onDismiss }: BackupBannerProps) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-slate-700">
        Analyse du {formatBackupDate(timestamp)} sur <span className="font-semibold">{fileName}</span>
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onResume}
          className="rounded-lg bg-brand-blue px-3 py-1.5 font-semibold text-white"
        >
          Reprendre
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-600"
        >
          Ignorer
        </button>
      </div>
    </div>
  );
}
