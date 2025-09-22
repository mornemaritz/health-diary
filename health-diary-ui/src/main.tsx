import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App.tsx'
import { createTheme, ThemeProvider } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3876d9',
    },
    secondary: {
      main: '#f44336',
    },
  },  
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
