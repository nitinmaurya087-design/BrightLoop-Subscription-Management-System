/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0B0F14',
          sidebar: '#10151D',
          navbar: '#111720',
          card: '#151C26',
          surface: '#1B2430',
          hover: '#222D3D',
          border: '#273241',
          'border-light': '#323F52',
        },
        text: {
          primary: '#E8EDF3',
          secondary: '#929DAB',
          muted: '#687586',
        },
        brand: {
          DEFAULT: '#4F83CC',
          hover: '#3E6EB5',
          active: '#355F9E',
          muted: 'rgba(79, 131, 204, 0.12)',
          border: 'rgba(79, 131, 204, 0.28)',
        },
        status: {
          success: '#3FA77A',
          'success-bg': 'rgba(63, 167, 122, 0.12)',
          'success-border': 'rgba(63, 167, 122, 0.25)',
          warning: '#D6A04B',
          'warning-bg': 'rgba(214, 160, 75, 0.12)',
          'warning-border': 'rgba(214, 160, 75, 0.25)',
          danger: '#D65B65',
          'danger-bg': 'rgba(214, 91, 101, 0.12)',
          'danger-border': 'rgba(214, 91, 101, 0.25)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '6px',
        lg: '8px',
        xl: '10px',
        '2xl': '12px',
      }
    },
  },
  plugins: [],
}
