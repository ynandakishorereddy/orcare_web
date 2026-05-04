import React from 'react';
import { createRoot } from 'react-dom/client';

// Redundant safety net — the real early handler is the inline <script> in index.html
// which fires before this module is evaluated.
function showError(title: string, detail: string) {
  if (typeof (window as any)._showError === 'function') {
    (window as any)._showError(title, detail);
    return;
  }
  const div = document.createElement('div');
  div.style.cssText =
    'position:fixed;top:0;left:0;right:0;bottom:0;background:#fff;z-index:99999;' +
    'padding:24px;font-family:monospace;overflow:auto;color:#c00;white-space:pre-wrap';
  div.innerHTML = `<b style="font-size:18px">${title}</b>\n\n${String(detail).replace(/</g, '&lt;')}`;
  document.body.appendChild(div);
}

async function registerFontAliases() {
  const weightToName: Record<string, string> = {
    '300': 'Inter_300Light', '400': 'Inter_400Regular', '500': 'Inter_500Medium',
    '600': 'Inter_600SemiBold', '700': 'Inter_700Bold', '800': 'Inter_800ExtraBold',
  };
  try {
    const css = await fetch(
      'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
    ).then((r) => r.text());
    const aliases: string[] = [];
    for (const m of css.matchAll(/@font-face\s*\{([^}]+)\}/g)) {
      const b = m[1];
      const weight = b.match(/font-weight:\s*(\d+)/)?.[1];
      const src = b.match(/src:\s*([^;]+);/)?.[1];
      const style = b.match(/font-style:\s*(\w+)/)?.[1] ?? 'normal';
      const name = weight ? weightToName[weight] : undefined;
      if (name && src && style === 'normal')
        aliases.push(`@font-face{font-family:'${name}';font-style:normal;font-weight:${weight};font-display:swap;src:${src};}`);
    }
    if (aliases.length) {
      const el = document.createElement('style');
      el.textContent = aliases.join('');
      document.head.appendChild(el);
    }
  } catch { /* font aliases are cosmetic — ignore failures */ }
}

registerFontAliases();

// Dynamically import App so that any module-evaluation error in the
// app's import tree is caught here rather than silently killing the page.
(async () => {
  try {
    const { default: App } = await import('../App');
    const container = document.getElementById('root');
    if (!container) {
      showError('Mount Error', '#root element not found in index.html');
      return;
    }
    const root = createRoot(container);
    root.render(<App />);
  } catch (err: any) {
    showError('App Load Error', err?.stack ?? String(err));
  }
})();
