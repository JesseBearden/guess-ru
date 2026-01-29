/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Drag Race themed colors
        'primary-pink': '#ff6b9d',
        'primary-purple': '#c44569',
        'secondary-blue': '#667eea',
        'secondary-purple': '#764ba2',
        'success-green': '#2ecc71',
        'warning-yellow': '#f39c12',
        'error-red': '#e74c3c',
        'text-dark': '#2c3e50',
        'text-light': '#ecf0f1',
        'border-light': '#bdc3c7',
        // Additional drag race colors
        'hot-pink': '#ff69b4',
        'deep-pink': '#ff1493',
        'gold': '#ffd700',
        // WCAG AA compliant feedback colors (4.5:1 contrast ratio on white text)
        'feedback-correct': '#1a8f4a', // Darker green for better contrast
        'feedback-close': '#b8860b', // Darker yellow/gold for better contrast
        'feedback-wrong': '#5a5a5a', // Darker gray for better contrast
        // Focus ring color
        'focus-ring': '#ff6b9d',
      },
      fontFamily: {
        'display': ['"Arial Black"', 'Arial', 'sans-serif'],
        'body': ['"Segoe UI"', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
        'mono': ['"Courier New"', 'monospace'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #ff6b9d, #c44569)',
        'gradient-secondary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-win': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-loss': 'linear-gradient(135deg, #434343 0%, #000000 100%)',
        'gradient-share': 'linear-gradient(45deg, #ff69b4, #ff1493)',
        'gradient-success': 'linear-gradient(45deg, #2ecc71, #27ae60)',
        'gradient-error': 'linear-gradient(45deg, #e74c3c, #c0392b)',
      },
      boxShadow: {
        'light': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'medium': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'heavy': '0 10px 40px rgba(0, 0, 0, 0.3)',
        'pink': '0 4px 15px rgba(255, 105, 180, 0.4)',
        'pink-hover': '0 6px 20px rgba(255, 105, 180, 0.6)',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out forwards',
        'slide-out': 'slideOut 0.3s ease-in forwards',
        'modal-slide-in': 'modalSlideIn 0.3s ease-out',
        'confetti-fall': 'confettiFall 3s infinite linear',
        'headshot-reveal': 'headshotReveal 1s ease-out',
        'bounce-arrow': 'bounceArrow 1s ease-in-out infinite',
        'spin': 'spin 1s linear infinite',
        'toggle-on': 'toggleOn 0.3s ease-out',
        'toggle-off': 'toggleOff 0.3s ease-out',
        'slide-in-left': 'slideInFromLeft 0.3s ease-out',
        'wiggle': 'wiggle 2s ease-in-out infinite',
      },
      keyframes: {
        slideIn: {
          from: { opacity: '0', transform: 'translateY(-20px)', maxHeight: '0' },
          to: { opacity: '1', transform: 'translateY(0)', maxHeight: '250px' },
        },
        slideOut: {
          from: { opacity: '1', transform: 'translateY(0)', maxHeight: '250px' },
          to: { opacity: '0', transform: 'translateY(-20px)', maxHeight: '0' },
        },
        modalSlideIn: {
          from: { opacity: '0', transform: 'translateY(-20px) scale(0.95)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        confettiFall: {
          '0%': { transform: 'translateY(-100px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100px) rotate(360deg)', opacity: '0' },
        },
        headshotReveal: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceArrow: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-3px)' },
          '60%': { transform: 'translateY(-1px)' },
        },
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        toggleOn: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
        toggleOff: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.8)' },
          '100%': { transform: 'scale(1)' },
        },
        slideInFromLeft: {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-8deg)' },
          '75%': { transform: 'rotate(8deg)' },
        },
      },
      minHeight: {
        'touch': '44px',
        'touch-lg': '48px',
      },
      minWidth: {
        'touch': '44px',
        'touch-lg': '48px',
      },
    },
  },
  plugins: [],
}
