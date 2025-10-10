import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from './components/ui/sonner.jsx';
import { SocketProvider } from './context/SocketContext';
import { HashRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(

  <HashRouter>
    <SocketProvider>
      <App />
      <Toaster closeButton position="top-center" />
    </SocketProvider>
  </HashRouter>

);
