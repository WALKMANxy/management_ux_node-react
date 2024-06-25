// src/index.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./app/store";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container!);
// Save the original console.warn method
const originalWarn = console.warn;

// Override console.warn to filter out specific warnings
console.warn = function(message, ...args) {
  if (typeof message === 'string' && message.includes('Added non-passive event listener')) {
    return;
  }
  originalWarn.apply(console, [message, ...args]);
};



root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <App />
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);
