import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { I18nextProvider } from 'react-i18next';
import { Provider } from "react-redux";
import App from "./App";
import store from "./app/store";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import i18n from './i18n';
import "./index.css";
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container!);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);

serviceWorkerRegistration.register();
