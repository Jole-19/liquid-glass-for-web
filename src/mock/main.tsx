import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '../lib/styles/index.css';
import './mock.css';

import { MockApp } from './MockApp';

const root = document.getElementById('root');
if (!root) throw new Error('#root is missing from mock.html');

createRoot(root).render(
  <StrictMode>
    <MockApp />
  </StrictMode>,
);
