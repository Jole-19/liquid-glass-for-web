import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// The library's stylesheet first, the site's second, so site rules win where
// they overlap without needing specificity games.
import '../lib/styles/index.css';
import './site.css';
import './showcase.css';

import { App } from './App';

const root = document.getElementById('root');
if (!root) throw new Error('#root is missing from index.html');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
