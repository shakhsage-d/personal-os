import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 17-Qavat (Performance audit):
// - `echarts`/`echarts-for-react` (Finance modulida ishlatiladi) ~1MB+
//   og'irlikda bo'lgani uchun alohida "vendor-charts" chunkiga ajratiladi —
//   shu tufayli Finance sahifasiga kirmagan foydalanuvchi uni umuman
//   yuklamaydi (App.jsx'dagi React.lazy() bilan birga ishlaydi).
// - React/react-dom alohida "vendor-react" chunkiga ajratiladi — brauzer
//   kesh siyosati tufayli ilova kodi o'zgarganda ham foydalanuvchi
//   React'ni qayta yuklab olmaydi.
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Route-based code-splitting (App.jsx, React.lazy) natijasida ba'zi
    // chunklar standart 500kb ogohlantirish chegarasiga yaqinlashishi
    // mumkin — chegarani biroz oshiramiz, lekin haqiqiy nazorat quyidagi
    // manualChunks orqali amalga oshiriladi.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('echarts')) return 'vendor-charts'
          if (id.includes('react-dom') || id.includes('/react/')) return 'vendor-react'
          return 'vendor'
        },
      },
    },
  },
})
