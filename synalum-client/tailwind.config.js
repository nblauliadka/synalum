export default {
  content: [
    './index.html', // Tailwind akan scan class yang dipakai di file HTML utama
    './src/**/*.{js,jsx,ts,tsx}', // Tailwind akan scan semua file source React
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0A6C75', // Warna utama brand SYNALUM
        accent: '#F2994A', // Warna aksen untuk CTA / highlight
        background: '#F3F4F6', // Warna background aplikasi
        text: '#4F4F4F', // Warna teks utama
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'], // Set font default jadi Inter
      },
    },
  },
  plugins: [],
}
