import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { App } from './app';
import { AudioSessionProvider } from './features/audio/audio-session';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode><BrowserRouter><AudioSessionProvider><App /></AudioSessionProvider></BrowserRouter></StrictMode>,
);
