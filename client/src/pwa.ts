import { registerSW } from "virtual:pwa-register";
import { toast } from "sonner";
import i18n from 'i18next'; // Import i18n directly

export function registerPWA() {
  const updateSW = registerSW({
    onNeedRefresh() {
      // Use Sonner to show a custom toast for the update with translation from i18n
      toast(i18n.t("pwa.newContentAvailable"), {
        description: i18n.t("pwa.clickToReload"),
        action: {
          label: i18n.t("pwa.reloadButton"),
          onClick: () => {
            updateSW(true); // Trigger the service worker update
          },
        },
      });
    },
    onOfflineReady() {
      // Show a toast when the app is ready to work offline, using i18n translation
      toast.success(i18n.t("pwa.offlineReady"));
    },
  });
}
