import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';
import tsconfigPaths from 'vite-tsconfig-paths';
import legacy from '@vitejs/plugin-legacy';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const common = {
    base: '',
    plugins: [
      react(),
      eslint(),
      tsconfigPaths(),
      legacy({
        modernPolyfills: ['es.array.find-last'],
      }),
    ],
    server: {
      // Proxy HTTP requests to the flask server
      proxy: {
        '/outputs': {
          target: 'http://127.0.0.1:9090/outputs',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/outputs/, ''),
        },
        '/upload': {
          target: 'http://127.0.0.1:9090/upload',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/upload/, ''),
        },
        '/flaskwebgui-keep-server-alive': {
          target: 'http://127.0.0.1:9090/flaskwebgui-keep-server-alive',
          changeOrigin: true,
          rewrite: (path) =>
            path.replace(/^\/flaskwebgui-keep-server-alive/, ''),
        },
        // Proxy socket.io to the flask-socketio server
        '/socket.io': {
          target: 'ws://127.0.0.1:9090',
          ws: true,
        },
        '/get_challenge': {
          target: 'http://127.0.0.1:9090/get_challenge',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/get_challenge/, ''),
        },
      },
    },
    build: {
      /**
       * We need to polyfill for Array.prototype.findLast(); the polyfill plugin above
       * overrides any target specified here.
       */
      // target: 'esnext',
      chunkSizeWarningLimit: 1500, // we don't really care about chunk size
    },
  };
  if (mode == 'development') {
    return {
      ...common,
      build: {
        ...common.build,
        // sourcemap: true, // this can be enabled if needed, it adds ovwer 15MB to the commit
      },
    };
  } else {
    return {
      ...common,
    };
  }
});
