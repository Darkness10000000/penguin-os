import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Store install prompt for later use
let deferredPrompt: any;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  (window as any).deferredPrompt = deferredPrompt;
});

createRoot(document.getElementById("root")!).render(<App />);
