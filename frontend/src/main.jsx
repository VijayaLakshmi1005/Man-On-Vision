import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { Provider } from 'react-redux';
import { store } from './store/store';

import { ApolloProvider } from '@apollo/client/react';
import apolloClient from './apollo/client';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <Provider store={store}>
        <ApolloProvider client={apolloClient}>
          <BrowserRouter>
            <AuthProvider>
              <ThemeProvider>
                <App />
              </ThemeProvider>
            </AuthProvider>
          </BrowserRouter>
        </ApolloProvider>
      </Provider>
    </StrictMode>,
  );
}
