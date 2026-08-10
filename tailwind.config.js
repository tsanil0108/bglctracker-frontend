/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#0B1220',
          50: '#F4F6F9',
          100: '#E7EBF1',
          700: '#1E2A3D',
          800: '#141C2B',
          900: '#0B1220',
        },
        paper: '#F6F7F9',
        border: '#E3E7EE',
        muted: '#5B6472',
        bg: {
          DEFAULT: '#1D6F5C',
          50: '#EAF4F1',
          100: '#D3E9E2',
          600: '#1D6F5C',
          700: '#175A4A',
        },
        lc: {
          DEFAULT: '#2A4B8D',
          50: '#EAEEF7',
          100: '#D2DBEE',
          600: '#2A4B8D',
          700: '#213C72',
        },
        fd: {
          DEFAULT: '#B8862B',
          50: '#FBF3E4',
          100: '#F3E2BE',
          600: '#B8862B',
          700: '#966D20',
        },
        danger: {
          DEFAULT: '#B3261E',
          50: '#FBEAE9',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,18,32,0.04), 0 1px 8px rgba(11,18,32,0.04)',
      },
      borderRadius: {
        xl2: '14px',
      },
    },
  },
  plugins: [],
}
