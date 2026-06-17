import { createRoot } from 'react-dom/client';
import './tailwind.css';
import './styles/global.css';
import App from './App';
import { applyPerfClass } from './three/perf';

applyPerfClass(); // tag <body> low-/high-performance for CSS

const container = document.getElementById('root');
if (!container) {
  throw new Error("Root element '#root' was not found in the document.");
}

// Note: StrictMode's dev-only double mount/unmount races with the imperative
// Lenis + GSAP ticker + Three.js setup (corrupting the shared gsap.ticker),
// so it is intentionally omitted for this animation-driven app.
createRoot(container).render(<App />);
