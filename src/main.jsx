import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './presentation/pages/App.jsx';
import ErrorBoundary from '../src/presentation/components/ErrorBoundary/ErrorBoundary.jsx';
import { RecoilRoot } from 'recoil';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <RecoilRoot>
        <App />
      </RecoilRoot>
    </ErrorBoundary>
  </React.StrictMode>
);
