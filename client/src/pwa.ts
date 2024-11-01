import { registerSW } from "virtual:pwa-register";
import { toast } from "sonner";
import i18n from 'i18next';

export function registerPWA() {
  const updateSW = registerSW({
    onNeedRefresh() {
      toast(i18n.t("pwa.newContentAvailable"), {
        description: i18n.t("pwa.clickToReload"),
        action: {
          label: i18n.t("pwa.reloadButton"),
          onClick: () => {
            updateSW(true);
          },
        },
      });
    },
    onOfflineReady() {
      toast.success(i18n.t("pwa.offlineReady"));
    },
  });
}
