import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { getRouter } from './router';
import './styles.css';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from '@/components/ui/sonner';

const router = getRouter();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element with id="root" not found in index.html');
}

createRoot(rootElement).render(
  <ErrorBoundary>
    <RouterProvider router={router} />
    <Toaster richColors position="top-right" />
  </ErrorBoundary>
);
