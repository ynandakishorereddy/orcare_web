import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Regex that matches any Fabric / TurboModule native spec file path.
 * These files call TurboModuleRegistry.get/getEnforcing() at module-evaluation
 * time. react-native-web does NOT export TurboModuleRegistry, so loading them
 * on web crashes immediately with:
 *   TypeError: Cannot read properties of undefined (reading 'get')
 */
const NATIVE_FABRIC_FILTER = /[/\\](?:fabric|specs)[/\\]Native[^/\\]*\.js$/;

/**
 * Vite plugin — handles the production build and dev-mode transforms.
 *
 * Two strategies:
 *  1. load()     — fast path: stub by file path (fabric/specs directories)
 *  2. transform() — fallback: stub any node_module that calls TurboModuleRegistry.get
 *                   (catches native files outside the standard directory names)
 */
function stubNativeFabricPlugin() {
  return {
    name: 'stub-rn-native-fabric-modules',
    enforce: 'pre',

    load(id) {
      if (id.includes('node_modules') && NATIVE_FABRIC_FILTER.test(id)) {
        return 'export default null;';
      }
    },

    transform(code, id) {
      if (
        id.includes('node_modules') &&
        (code.includes('TurboModuleRegistry.get(') ||
          code.includes('TurboModuleRegistry.getEnforcing('))
      ) {
        return { code: 'export default null;', map: null };
      }
    },
  };
}

/**
 * esbuild plugin for optimizeDeps pre-bundling phase.
 * Vite's Rollup load/transform hooks are NOT invoked during pre-bundling;
 * this plugin ensures the same stubs are applied when esbuild processes deps.
 */
const esbuildStubNativeFabric = {
  name: 'stub-native-fabric',
  setup(build) {
    // Path-based: fabric/specs directories
    build.onLoad({ filter: NATIVE_FABRIC_FILTER }, () => ({
      contents: 'export default null;',
      loader: 'js',
    }));

    // Content-based: any .js file in node_modules that calls TurboModuleRegistry.get
    build.onLoad(
      { filter: /node_modules[/\\](?:react-native-screens|react-native-safe-area-context|react-native-svg)[/\\].*\.js$/ },
      async (args) => {
        const fs = await import('fs');
        const text = fs.readFileSync(args.path, 'utf8');
        if (
          text.includes('TurboModuleRegistry.get(') ||
          text.includes('TurboModuleRegistry.getEnforcing(')
        ) {
          return { contents: 'export default null;', loader: 'js' };
        }
        // Return nothing — let esbuild handle it normally
      }
    );
  },
};

export default defineConfig({
  plugins: [
    stubNativeFabricPlugin(),
    react(),
  ],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      '@react-native/assets-registry/registry': path.resolve(__dirname, './src/stubs/assets-registry.js'),
      buffer: 'buffer/',
      // Use the CJS build of lucide-react-native — the ESM build has broken exports
      'lucide-react-native': path.resolve(__dirname, 'node_modules/lucide-react-native/dist/cjs/lucide-react-native.js'),
      '@': path.resolve(__dirname, './src'),
    },
    extensions: [
      '.web.tsx', '.web.ts', '.web.jsx', '.web.js',
      '.tsx', '.ts', '.jsx', '.js',
    ],
  },
  define: {
    global: 'globalThis',
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  optimizeDeps: {
    include: [
      'react-native-web',
      // Pre-bundle lucide CJS → ESM so Vite serves it as a proper ES module
      'lucide-react-native',
    ],
    esbuildOptions: {
      plugins: [esbuildStubNativeFabric],
      resolveExtensions: [
        '.web.tsx', '.web.ts', '.web.jsx', '.web.js',
        '.tsx', '.ts', '.jsx', '.js',
      ],
      loader: { '.js': 'tsx' },
    },
  },
  server: {
    port: 3000,
    strictPort: false,
    open: true,
    proxy: {
      // Forward all /api requests to the backend — avoids CORS in dev
      '/api': {
        target: 'http://180.235.121.253:8182',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
