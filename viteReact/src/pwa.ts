import { registerSW } from "virtual:pwa-register";

export function registerPWA() {
  const updateSW = registerSW({
    onNeedRefresh() {
      // You can show a prompt to the user here if you want to allow manual updates
      if (confirm("New content available. Reload?")) {
        updateSW(true);
      }
    },
    onOfflineReady() {
      console.log("App ready to work offline");
    },
  });
}
