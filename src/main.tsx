import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import '@fontsource/bebas-neue/400.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import './styles/global.css';
import { StoreProvider } from './state/store';
import { App } from './app/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </StoreProvider>
  </StrictMode>,
);

// Installed app: cache the build so it opens offline. Hosts that don't allow service workers
// (for example an embedded review frame) simply skip this.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
