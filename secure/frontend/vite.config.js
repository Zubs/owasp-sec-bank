import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue()],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'https://owasp-sec-bank-insecure.onrender.com',
                changeOrigin: true,
                secure: false,
            },
            '/uploads': {
                target: 'https://owasp-sec-bank-insecure.onrender.com',
                changeOrigin: true,
                secure: false,
            }
        }
    }
})
