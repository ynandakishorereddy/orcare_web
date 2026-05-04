// Web-native stub for react-native-svg/lib/module/utils/fetchData.js
// Replaces Buffer-based decode with browser-native atob / fetch.

export async function fetchText(uri) {
  if (!uri) return null;

  if (uri.startsWith('data:image/svg+xml;utf8,')) {
    return decodeURIComponent(uri).split(',').slice(1).join(',');
  }

  if (uri.startsWith('data:image/svg+xml;base64,')) {
    const base64 = uri.split(',')[1];
    return atob(base64);
  }

  const response = await fetch(uri);
  if (response.ok) return response.text();
  throw new Error(`Fetching ${uri} failed with status ${response.status}`);
}
