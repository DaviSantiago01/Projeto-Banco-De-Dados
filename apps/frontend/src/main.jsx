import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Aplicacao from './Aplicacao.jsx';

// Ponto de entrada do frontend.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Aplicacao />
  </StrictMode>,
);
