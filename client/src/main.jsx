import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from './components/ui/sonner.jsx';
import { SocketProvider } from './context/SocketContext';
import { HashRouter } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <HashRouter>
    <SocketProvider>
      <App />
      <Toaster closeButton position="top-center" />
    </SocketProvider>
  </HashRouter>
  // </StrictMode>,
);
