// Applique le thème stocké avant l'hydratation, pour éviter le flash de contenu mal thémé.
const THEME_INIT = `
try {
  const stored = localStorage.getItem("osmia-theme");
  if (stored === "dark" || stored === "light") {
    document.documentElement.setAttribute("data-theme", stored);
  }
} catch {}
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />;
}
