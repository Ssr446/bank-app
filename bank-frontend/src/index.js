import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CssBaseline, ThemeProvider, createTheme, GlobalStyles } from '@mui/material';

// --- "BIOLUMINESCENT" DARK THEME (No change here) ---
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#05ff9e', // Vibrant, glowing green
    },
    secondary: {
      main: '#00f5d4', // Bright cyan
    },
    background: {
      default: '#000000', // Pure black
      paper: 'rgba(10, 25, 41, 0.7)', // Translucent "glass"
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0bec5',
    },
    error: {
      main: '#ff5252',
    },
    success: {
      main: '#00f5d4', // Use cyan for success
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', // Using Inter font
    h4: {
      fontWeight: 700,
      color: '#ffffff',
    },
    h5: {
      fontWeight: 600,
      color: '#ffffff',
    },
    h6: {
      fontWeight: 600,
      color: '#ffffff',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    }
  },
  components: {
     MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#05ff9e',
              boxShadow: '0 0 10px rgba(5, 255, 158, 0.5)',
            },
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          background: 'linear-gradient(90deg, #05ff9e, #00f5d4)',
          height: '4px',
          borderRadius: '4px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(10, 25, 41, 0.7)',
          backdropFilter: 'blur(12px) saturate(150%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: 'none',
        },
      },
    },
  },
});

// --- DYNAMIC BLOB BACKGROUND (Corrected) ---
const BlobBackground = () => (
  <GlobalStyles styles={`
    @keyframes moveBlob1 {
      0% { transform: translate(0, 0) scale(1); }
      25% { transform: translate(30vw, -20vh) scale(1.1); }
      50% { transform: translate(-10vw, 30vh) scale(0.9); }
      75% { transform: translate(20vw, 10vh) scale(1.2); }
      100% { transform: translate(0, 0) scale(1); }
    }
    @keyframes moveBlob2 {
      0% { transform: translate(0, 0) scale(1); }
      25% { transform: translate(-25vw, 15vh) scale(0.8); }
      50% { transform: translate(15vw, -25vh) scale(1.1); }
      75% { transform: translate(-10vw, -10vh) scale(0.9); }
      100% { transform: translate(0, 0) scale(1); }
    }

    body {
      background-color: #000;
      /* overflow: hidden; */ /* <<< REMOVED THIS LINE TO ALLOW SCROLLING */
      overflow-x: hidden; /* Keep this to prevent horizontal scroll */
      position: relative;
    }

    .blob-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1; /* Behind everything */
      overflow: hidden;
      filter: blur(80px); /* Soften the blob edges */
    }

    .blob {
      position: absolute;
      border-radius: 50%;
      opacity: 0.4; /* Make them semi-transparent */
      mix-blend-mode: screen; /* How blobs interact visually */
    }

    .blob-1 {
      width: 50vmax; /* Use viewport units for responsiveness */
      height: 50vmax;
      left: 10%;
      top: 10%;
      background: radial-gradient(circle, ${theme.palette.primary.main} 0%, rgba(5, 255, 158, 0) 70%);
      animation: moveBlob1 30s infinite alternate ease-in-out;
    }

    .blob-2 {
      width: 40vmax;
      height: 40vmax;
      right: 15%;
      bottom: 15%;
      background: radial-gradient(circle, ${theme.palette.secondary.main} 0%, rgba(0, 245, 212, 0) 70%);
      animation: moveBlob2 35s infinite alternate ease-in-out;
    }

    /* Simple fade-in for page content (remains the same) */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    main {
      animation: fadeIn 0.5s ease-out;
    }
  `} />
);
// --- END OF BLOB BACKGROUND ---

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BlobBackground />
      {/* Inject container divs for blobs directly into body */}
      <div className="blob-container">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);