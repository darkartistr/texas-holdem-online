import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import Providers from './context/Providers';
import ErrorBoundary from './utils/errorBoundary';

const rootElement = document.getElementById('root');

if (rootElement) {
  rootElement.style.display = 'block';
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <Providers>
          <App />
        </Providers>
      </ErrorBoundary>
    </React.StrictMode>,
  );
}

// Disable React DevTools in production
if (
  import.meta.env.PROD &&
  typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'object'
) {
  for (const [key, value] of Object.entries(
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__,
  )) {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__[key] =
      typeof value === 'function' ? () => {} : null;
  }
}
