const heroUINativePlugin = require('heroui-native/tailwind-plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}", // Si usas Expo Router (de la config de Heroui)
    "./node_modules/heroui-native/lib/**/*.{js,ts,jsx,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        default: {
          50: '#efefef',
          100: '#e4e4e4',
          200: '#dadada',
          300: '#cfcfcf',
          400: '#c5c5c5',
          500: '#bababa',
          600: '#afafaf',
          700: '#a5a5a5',
          800: '#9a9a9a',
          900: '#8f8f8f',
          foreground: '#000',
          DEFAULT: '#efefef',
        },
        primary: {
          50: '#1b1b1b',
          100: '#252525',
          200: '#303030',
          300: '#3a3a3a',
          400: '#454545',
          500: '#505050',
          600: '#5a5a5a',
          700: '#656565',
          800: '#707070',
          900: '#7a7a7a',
          foreground: '#fff',
          DEFAULT: '#1b1b1b',
        },
      },
      fontSize: {
        small: '1rem',
      },
      lineHeight: {
        small: '1.50rem',
      },
      fontFamily: {
        normal: ['PlusJakartaSans_400Regular'],
        medium: ['PlusJakartaSans_500Medium'],
        semibold: ['PlusJakartaSans_600SemiBold'],
        bold: ['PlusJakartaSans_700Bold'],
      },
    },
  },
  plugins: [heroUINativePlugin], 
};