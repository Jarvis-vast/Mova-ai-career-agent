import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // The preview proxy does not reliably forward Vite's HMR WebSocket.
      // Disable HMR at the Vite config level so @vite/client never opens it.
      hmr: false,
      // Avoid file-watcher restarts that can leave stale Vite sockets behind.
      watch: null,
    },
  };
});
