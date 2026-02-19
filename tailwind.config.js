/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'app-bg':      '#0d0f1a',
        'header-bg':   '#0f172a',
        'panel-1':     '#0f1120',
        'panel-2':     '#080c18',
        'panel-3':     '#060810',
        'panel-4':     '#060d14',
        'panel-5':     '#08101a',
        'panel-6':     '#090b16',
        'panel-7':     '#07090f',
        'modal-bg':    '#0e1122',
        'chip-bg':     '#0f1422',
        'btn-bg':      '#1e2235',
        'btn-hover':   '#2a3050',

        'border-dim':   '#1a2235',
        'border-mid':   '#1e2840',
        'border-light': '#2e3a55',

        'txt-primary':   '#c8d6e5',
        'txt-secondary': '#4e6a8a',
        'txt-muted':     '#94a1af',
        'txt-dim':       '#798595',
        'txt-faint':     '#2e3a55',

        'blue':       '#7ecfff',
        'blue-dim':   '#2e4a6a',
        'green':      '#57d97a',
        'green-dim':  '#2a5a34',
        'green-bg':   '#0a1a10',
        'orange':     '#f0a030',
        'orange-dim': '#8a4a18',
        'red-acc':    '#e04040',
        'red-dim':    '#8a1e1e',

        'sf-green':        '#2a6a3a',
        'sf-green-border': '#1a3a22',
        'sf-green-hover':  '#57d97a',
        'sf-green-active': '#3a9a4a',
        'sf-blue':         '#2a4a8a',
        'sf-blue-border':  '#1a2a5a',
        'sf-orange':       '#8a4a18',
        'sf-orange-border':'#5a2e08',
        'sf-red':          '#8a1e1e',
        'sf-red-border':   '#5a1010',
      },
      fontFamily: {
        lato:    ['Lato', 'sans-serif'],
        courier: ['"Courier New"', 'monospace'],
      },
      animation: {
        'blink':      'blink 1s step-start infinite',
        'blink-fast': 'blink 0.5s step-start infinite',
        'blink-slow': 'blink 0.9s step-start infinite',
        'spin-slow':  'spin-slow 2s linear infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
}
