// src/hooks/usePromoForm.ts

import { deDE, enUS, frFR, itIT, ruRU } from "@mui/x-date-pickers/locales";
import { SubmitHandler, useForm } from "react-hook-form";

import dayjs, { Dayjs } from "dayjs";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Promo } from "../models/dataModels";
import { showToast } from "../services/toastMessage";
import usePromos from "./usePromos";

interface UsePromoFormProps {
  promoData?: Promo;
  isCreating: boolean;
  onSubmit: (promoData: Promo) => Promise<void>;
  onClose: () => void;
}

interface FormValues {
  promoType: string;
  name: string;
  discount: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  selectedClients: string[];
  excludedClients: string[];
  global: boolean;
}

// Locale Map moved outside the component
const localeMap = {
  en: {
    adapterLocale: "en",
    localeText: enUS.components.MuiLocalizationProvider.defaultProps.localeText,
  },
  fr: {
    adapterLocale: "fr",
    localeText: frFR.components.MuiLocalizationProvider.defaultProps.localeText,
  },
  it: {
    adapterLocale: "it",
    localeText: itIT.components.MuiLocalizationProvider.defaultProps.localeText,
  },
  ru: {
    adapterLocale: "ru",
    localeText: ruRU.components.MuiLocalizationProvider.defaultProps.localeText,
  },
  de: {
    adapterLocale: "de",
    localeText: deDE.components.MuiLocalizationProvider.defaultProps.localeText,
  },
} as const;

const usePromoForm = ({
  promoData,
  isCreating,
  onSubmit,
  onClose,
}: UsePromoFormProps) => {
  const { userId, clients } = usePromos();
  const { t, i18n } = useTranslation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormValues>({
    defaultValues: useMemo(
      () => ({
        promoType: promoData?.promoType || "",
        name: promoData?.name || "",
        discount: promoData?.discount || "",
        startDate: promoData?.startDate ? dayjs(promoData.startDate) : dayjs(),
        endDate: promoData?.endDate ? dayjs(promoData.endDate) : dayjs(),
        selectedClients: promoData?.clientsId || [],
        excludedClients: promoData?.excludedClientsId || [],
        global: promoData?.global || false,
      }),
      [promoData]
    ),
  });

  const { selectedLocale } = useMemo(() => {
    return {
      selectedLocale:
        localeMap[i18n.language as keyof typeof localeMap] || localeMap.en,
    };
  }, [i18n.language]);

  const onSubmitHandler: SubmitHandler<FormValues> = useCallback(
    async (data) => {
      // Validation
      if (!data.promoType || !data.name || !data.startDate || !data.endDate) {
        // Handle validation errors (optional)
        return;
      }

      if (data.endDate.isBefore(data.startDate)) {
        // Handle date validation error (optional)
        return;
      }

      /*       console.log("Form data before processing:", data);
       */
      // Prepare promo data
      const preparedPromoData: Promo = {
        _id: promoData?._id,
        name: data.name,
        promoType: data.promoType,
        discount: data.discount,
        clientsId: data.global ? [] : data.selectedClients,
        excludedClientsId: data.global ? data.excludedClients : [],
        global: data.global,
        createdAt: new Date(),
        startDate: data.startDate.set("hour", 8).set("minute", 0).toDate(),
        endDate: data.endDate.set("hour", 23).set("minute", 59).toDate(),
        promoIssuedBy: userId || "unknown",
      };

      console.log("Prepared promo data being sent:", preparedPromoData);

      try {
        await onSubmit(preparedPromoData);
        // Optionally reset the form
        if (isCreating) {
          reset();
        }
        onClose();
      } catch (error: unknown) {
        if (error instanceof Error) {
          showToast.error(t("promoForm.updateFailed " + error.message));
        } else {
          showToast.error("There was a problem with the promo.");
        }
      }
    },
    [onSubmit, isCreating, reset, onClose, userId, promoData?._id, t]
  );

  return {
    control,
    watch,
    setValue,
    handleSubmit: handleSubmit(onSubmitHandler),
    selectedLocale,
    clients, // Expose clients if needed
    t, // Expose translation function if needed
    errors, // Expose form errors if needed
  };
};

export default usePromoForm;
