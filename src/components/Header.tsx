import { Link, NavLink } from "react-router-dom";

const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
  [
    "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
    isActive ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  ].join(" ");

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-black text-slate-900" aria-label="AdsLens — Accueil">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg brand-gradient text-white">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
              <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="2.5" />
              <line x1="15" y1="15" x2="20" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </span>
          <span className="text-lg">AdsLens</span>
        </Link>
        <nav className="flex items-center gap-1" aria-label="Navigation principale">
          <NavLink to="/search-analyzer" className={navLinkClass}>
            Termes de recherche
          </NavLink>
          <NavLink to="/shopping-analyzer" className={navLinkClass}>
            Shopping / PMax
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
