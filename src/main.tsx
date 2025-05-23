
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add Leaflet CSS and JS
const leafletCSS = document.createElement('link');
leafletCSS.rel = 'stylesheet';
leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
leafletCSS.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
leafletCSS.crossOrigin = '';
document.head.appendChild(leafletCSS);

const leafletScript = document.createElement('script');
leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
leafletScript.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
leafletScript.crossOrigin = '';
document.head.appendChild(leafletScript);

// Add PapaParse for CSV export
const papaScript = document.createElement('script');
papaScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js';
document.head.appendChild(papaScript);

createRoot(document.getElementById("root")!).render(<App />);
