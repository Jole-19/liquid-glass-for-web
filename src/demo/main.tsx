import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

import '../lib/styles/index.css';
import './demo.css';

const container = document.getElementById('root');
if (!container) throw new Error('#root missing from index.html');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
