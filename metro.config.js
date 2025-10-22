// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// 🚫 Forzar modo clásico (desactivar Bridgeless y exports problemáticos)
config.transformer.unstable_allowRequireContext = true;
config.server = {
  ...config.server,
  enableVisualizer: false,
};
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
