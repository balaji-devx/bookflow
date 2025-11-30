import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 🎯 FIX: Set the base path to resolve asset loading issues in production/deployment.
  base: '/', 
  
  // 🎯 Add build configuration to explicitly define the output directory structure
  build: {
    // Ensures the final output directory is 'dist' (matching your Express path helper)
    outDir: 'dist', 
    // Ensure asset references are stable
    assetsDir: 'assets', 
  }
});
