export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-500 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold text-slate-700">AdsLens</p>
          <p>100% local : vos fichiers CSV ne quittent jamais votre navigateur.</p>
        </div>
        <p className="mt-4 text-xs text-slate-400">
          © {new Date().getFullYear()} AdsLens. Logiciel propriétaire, tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
