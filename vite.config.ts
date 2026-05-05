import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Fix: Cast process to any to avoid type error "Property 'cwd' does not exist on type 'Process'"
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Safely expose the API key. 
      // If the variable isn't set (e.g. local dev without .env), it defaults to an empty string to prevent build crashes.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY || ''),
      // Polyfill process.env to prevent "Uncaught ReferenceError: process is not defined"
      'process.env': {},
    },
    build: {
      outDir: 'dist',
    },
  };
});