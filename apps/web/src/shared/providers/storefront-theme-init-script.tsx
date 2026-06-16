/** Blocking script — runs before paint to prevent theme flash and OS-scheme drift. */
export function StorefrontThemeInitScript() {
  const script = `
(function () {
  try {
    var raw = localStorage.getItem('sadafgold-theme');
    var mode = 'light';
    if (raw) {
      var parsed = JSON.parse(raw);
      mode = (parsed.state && parsed.state.mode) || 'light';
    }
    var dark = mode === 'dark';
    var root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(dark ? 'dark' : 'light');
    root.style.colorScheme = dark ? 'dark' : 'light';
  } catch (e) {}
})();
`.trim();

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
