var _a;
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        port: 5173,
        proxy: {
            // En local (pnpm dev sur l'hôte) le backend est exposé sur localhost:3000.
            // En conteneur, surcharger via VITE_API_URL=http://backend:3000.
            '/api': (_a = process.env.VITE_API_URL) !== null && _a !== void 0 ? _a : 'http://localhost:3000',
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './src/test/setup.ts',
    },
});
