// src/index.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./app/store";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import "./index.css"
import * as serviceWorkerRegistration from './serviceWorkerRegistration';


const container = document.getElementById("root");
const root = ReactDOM.createRoot(container!);


root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <App />
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);

serviceWorkerRegistration.register();