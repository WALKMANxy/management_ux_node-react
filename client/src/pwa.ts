import { registerSW } from "virtual:pwa-register";
import { toast } from "sonner";
import i18n from 'i18next'; // Import i18n directly

export function registerPWA() {
  const updateSW = registerSW({
    onNeedRefresh() {
      // Use Sonner to show a custom toast for the update with translation from i18n
      toast(i18n.t("pwa.new_content_available"), {
        description: i18n.t("pwa.click_to_reload"),
        action: {
          label: i18n.t("pwa.reload_button"),
          onClick: () => {
            updateSW(true); // Trigger the service worker update
          },
        },
      });
    },
    onOfflineReady() {
      // Show a toast when the app is ready to work offline, using i18n translation
      toast.success(i18n.t("pwa.offline_ready"));
    },
  });
}
