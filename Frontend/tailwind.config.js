/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
 
    theme: {
      screens: {
        'xs': '360px',
        'sm': '640px',  
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      fontFamily: {
        sans: [
          'Inter var',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji',
        ],
      },
      extend: {
        animation: {
          scroll: 'scroll 20s linear infinite',
        },
        keyframes: {
          scroll: {
            '0%': { transform: 'translateX(100%)' },
            '100%': { transform: 'translateX(-50%)' },
          },
        },
        margin: {
          '100p': '100%' // Custom class for margin-top 100%
        },
        colors: {
     
  
          redErrorText: 'rgb(248 113 113)',
          redErrorBg: '#f55',
          overlayWhite: 'rgba(255, 255, 255, 0.7)', // White with 70% opacity
          success:'#22c55e',
          redBg:'#E61A23',
          redText:'#E61A23',
  
  
  
          primaryBlack: '#000000',        // Pure black
          secondaryBlack: '#111827',      // Very dark gray (Gray 800)
          tertiaryBlack: '#1F2937',       // Dark gray (Gray 900)
  
          bgHoverDark: '#1F2937',          // Dark gray for hover background
          bgHoverLight: '#F3F4F6', 
          bgHoverLight2:'#F2F2F2'   ,     // Light gray for hover background
          bgHoverLight3:'#D1D5D5'   ,     // Light gray for hover background
    
     bgSkeleton:'#E9EEF4',
  
  
  
          iconsColor: '#4B5563',           // Gray color for icons
          borderColor: '#D1D5DB',          // Light gray for borders
  
          primaryWhite: '#FFFFFF',          // Pure white
          secondaryWhite: '#F9FAFB',        // Very light gray
          tertiaryWhite: '#F3F4F6',         // Light gray
          primaryBlue : '#0095F6',
          secondaryBlue:'#1877F2',
          textHeadingsColor: '#000000',     // Black for headings
          textSubHeadingColor: '#111827',   // Dark gray for subheadings
          textParagraphColor: '#4B5563',    // Gray for paragraphs
          textSecondaryColor: '#6B7280',    // Medium gray for secondary text
          disabledBg:'#E1E6EB',
  
          buttonBgDark :"#000",
  
    primaryGreen : "#28b5a4"
  
  
  
  
        },
        height: {
          'navbar': '4rem', 
        },
        backgroundImage: {
          'hero-pattern': "url('/heroImg.png')", // Replace with your image URL
        },
        backgroundBlendMode: {
          'overlay': 'overlay', // Ensure blend mode is available
        },
      },
    },
 
  plugins: [],
};
