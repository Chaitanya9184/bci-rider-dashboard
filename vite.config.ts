import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // ===================================================================================
  //  IMPORTANT FOR GITHUB PAGES DEPLOYMENT
  // ===================================================================================
  // You MUST change this to your repository name for GitHub Pages to work correctly.
  // For example, if your repository URL is "https://github.com/your-username/my-cool-app",
  // you must change the line below to:
  // base: '/my-cool-app/',
  // ===================================================================================
  base: '/bci-rider-dashboard/', 
})
