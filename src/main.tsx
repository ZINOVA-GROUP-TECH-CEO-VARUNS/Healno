import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker for full offline support and instant updates
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('Healno updated with new offline resources.');
  },
  onOfflineReady() {
    console.log('Healno is fully cached and ready for offline use.');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
