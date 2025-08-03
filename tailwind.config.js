module.exports = {
    content: [
      './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        colors: {
          border: 'var(--border)',
          input: 'var(--input)',
          ring: 'var(--ring)',
          background: 'var(--background)',
          foreground: 'var(--foreground)',
          primary: {
            DEFAULT: 'var(--primary)',
            foreground: 'var(--primary-foreground)',
          },
          secondary: {
            DEFAULT: 'var(--secondary)',
            foreground: 'var(--secondary-foreground)',
          },
          destructive: {
            DEFAULT: 'var(--destructive)',
            foreground: 'var(--destructive-foreground)',
          },
          muted: {
            DEFAULT: 'var(--muted)',
            foreground: 'var(--muted-foreground)',
          },
          accent: {
            DEFAULT: 'var(--accent)',
            foreground: 'var(--accent-foreground)',
          },
          popover: {
            DEFAULT: 'var(--popover)',
            foreground: 'var(--popover-foreground)',
          },
          card: {
            DEFAULT: 'var(--card)',
            foreground: 'var(--card-foreground)',
          },
        },
        borderRadius: {
          lg: 'var(--radius)',
          md: 'calc(var(--radius) - 2px)',
          sm: 'calc(var(--radius) - 4px)',
        },
        animation: {
          'bounce-soft': 'bounce-soft 0.4s ease-in-out',
          'wiggle': 'wiggle 0.3s ease-in-out',
          'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
          'glow': 'glow 1.5s ease-in-out infinite alternate',
          'button-press': 'button-press 0.15s ease-in-out',
        },
        keyframes: {
          'bounce-soft': {
            '0%, 100%': { 
              transform: 'translateY(0) scale(1)' 
            },
            '50%': { 
              transform: 'translateY(-2px) scale(1.02)' 
            },
          },
          'wiggle': {
            '0%, 100%': { 
              transform: 'rotate(0deg) scale(1)' 
            },
            '25%': { 
              transform: 'rotate(-1deg) scale(1.01)' 
            },
            '75%': { 
              transform: 'rotate(1deg) scale(1.01)' 
            },
          },
          'pulse-soft': {
            '0%, 100%': { 
              opacity: '1',
              transform: 'scale(1)'
            },
            '50%': { 
              opacity: '0.9',
              transform: 'scale(1.01)'
            },
          },
          'glow': {
            '0%': { 
              boxShadow: '0 0 5px rgba(var(--primary), 0.2), 0 0 10px rgba(var(--primary), 0.1)' 
            },
            '100%': { 
              boxShadow: '0 0 10px rgba(var(--primary), 0.4), 0 0 20px rgba(var(--primary), 0.2)' 
            },
          },
          'button-press': {
            '0%': { 
              transform: 'scale(1)' 
            },
            '50%': { 
              transform: 'scale(0.95)' 
            },
            '100%': { 
              transform: 'scale(1)' 
            },
          },
        },
      },
    },
    plugins: [],
  }