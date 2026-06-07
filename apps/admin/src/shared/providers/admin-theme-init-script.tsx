/** Blocking script — runs before paint to prevent theme flash. */
export function AdminThemeInitScript() {
  const script = `
(function () {
  try {
    var raw = localStorage.getItem('admin-ui-store');
    var mode = 'system';
    if (raw) {
      var parsed = JSON.parse(raw);
      mode = (parsed.state && parsed.state.themeMode) || 'system';
    }
    var dark =
      mode === 'dark' ||
      (mode === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    var root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(dark ? 'dark' : 'light');
    root.style.colorScheme = dark ? 'dark' : 'light';
  } catch (e) {}
})();
`.trim();

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
