// Stub for @react-native/assets-registry/registry
// Used by react-native-svg for native asset resolution — not needed on web.
const assets = [];

export function registerAsset(asset) {
  return assets.push(asset);
}

export function getAssetByID(assetId) {
  return assets[assetId - 1];
}
