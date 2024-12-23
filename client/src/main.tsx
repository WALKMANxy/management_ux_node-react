//src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import App from "./App";
import store from "./app/store";
import i18n from "./i18n";
import "./main.css";
import { registerPWA } from "./pwa";
import "./services/axiosInterceptor";
import { webSocketService } from "./services/webSocketService";

webSocketService.injectStore(store);

registerPWA();

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container!);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <Toaster
          theme="system"
          richColors
          closeButton
          position="bottom-center"
          toastOptions={{ duration: 2500 }}
        />
        <App />
      </I18nextProvider>
    </Provider>
  </React.StrictMode>
);
