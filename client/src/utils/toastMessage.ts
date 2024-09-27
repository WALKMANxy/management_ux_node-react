//src/utils/toastMessage.ts

import { toast } from "sonner";

export const showToast = {
  default: (message: string) => {
    toast(message, {
      duration: 3000,
    });
  },

  message: (message: string, description: string) => {
    toast.message(message, {
      description: description,
      duration: 4000,
    });
  },

  success: (message: string) => {
    toast.success(message, {
      duration: 3000,
    });
  },

  info: (message: string) => {
    toast.info(message, {
      duration: 3000,
    });
  },

  warning: (message: string) => {
    toast.warning(message, {
      duration: 3000,
    });
  },

  error: (message: string) => {
    toast.error(message, {
      duration: 3000,
    });
  },
};
