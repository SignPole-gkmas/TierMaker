import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import App from './App';

// オレンジ 1 色だけを差し色にした、影なし・枠線ベースの簡素なテーマ
const theme = createTheme({
  palette: {
    primary: { main: '#f57c00', contrastText: '#fff' },
    text: { primary: '#222', secondary: '#888' },
    background: { default: '#fff' },
    divider: '#eee',
  },
  shape: { borderRadius: 6 },
  typography: {
    fontFamily: '"Hiragino Sans", "Noto Sans JP", "Yu Gothic UI", sans-serif',
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiTextField: { defaultProps: { size: 'small' } },
  },
});

// GitHub Pages は SPA のパスを解決できない（リロードで 404 になる）ため HashRouter を使う
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </HashRouter>
  </StrictMode>,
);
