import { useId, useRef, useState } from "react";
import type { DragEvent } from "react";

interface FileDropzoneProps {
  label: string;
  hint?: string;
  accept?: string;
  disabled?: boolean;
  onFileSelected: (file: File) => void;
}

/**
 * Dropzone réutilisable : clic pour ouvrir le sélecteur de fichier, ou
 * glisser-déposer réel. Ne fait aucune hypothèse sur le contenu du fichier
 * (générique aux deux outils).
 */
export default function FileDropzone({
  label,
  hint,
  accept = ".csv",
  disabled = false,
  onFileSelected,
}: FileDropzoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingOver(false);
    if (disabled) return;
    const file = event.dataTransfer.files?.[0];
    if (file) onFileSelected(file);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (!disabled) setIsDraggingOver(true);
  }

  function handleDragLeave() {
    setIsDraggingOver(false);
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(event) => {
        if (!disabled && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={[
        "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors",
        disabled ? "cursor-not-allowed opacity-60" : "",
        isDraggingOver
          ? "border-brand-blue bg-blue-50"
          : "border-slate-300 bg-white hover:border-slate-400",
      ].join(" ")}
    >
      <svg viewBox="0 0 24 24" fill="none" className="mb-3 h-10 w-10 text-slate-400" aria-hidden="true">
        <path
          d="M12 16V4m0 0L7 9m5-5 5 5M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className="font-semibold text-slate-700">{label}</p>
      {hint && <p className="mt-1 text-sm text-slate-500">{hint}</p>}
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFileSelected(file);
          event.target.value = "";
        }}
      />
    </div>
  );
}
