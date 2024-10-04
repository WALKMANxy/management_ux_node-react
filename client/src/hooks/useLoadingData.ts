import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { RootState } from "../app/store";
import { getTimeMs } from "../config/config";
import {
  fetchInitialData,
  getPromos,
  getVisits,
} from "../features/data/dataThunks";
import { selectCurrentUser } from "../features/users/userSlice";
import { DataSliceState } from "../models/stateModels";
import { ensureEncryptionInitialized } from "../utils/cacheUtils";
import { updateUserEntityNameIfMissing } from "../services/checkUserName";

const timeMS = getTimeMs(); // Ensure this is set in your .env file

const useLoadingData = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const [localError, setLocalError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0); // Track retry attempts
  const [fakeLoading, setFakeLoading] = useState(true);

  const toastId = "loadingDataToast";

  // Get data from the dataSlice
  const {
    clients,
    agents,
    currentUserData,
    currentUserDetails,
    status,
    error,
  } = useAppSelector<RootState, DataSliceState>((state) => state.data);

  const currentUser = useAppSelector(selectCurrentUser);
  const role = currentUser?.role;

  const shouldFetchData = useMemo(() => {
    return (
      status !== "succeeded" &&
      role !== "employee" &&
      (Object.keys(clients).length === 0 ||
        Object.keys(agents).length === 0 ||
        !currentUserData ||
        !currentUserDetails)
    );
  }, [status, clients, agents, currentUserData, currentUserDetails, role]);

  const fetchData = useCallback(async () => {
    try {
      toast.loading(t("useStatsToasts.loadingData"), { id: toastId });
      setLoading(true);

      // Ensure encryption is initialized with necessary params
      await ensureEncryptionInitialized({
        userId: currentUser?._id || "",
        userAgent: navigator.userAgent,
        timeMS: timeMS,
      });

      await dispatch(fetchInitialData()).unwrap();
      await Promise.all([
        dispatch(getVisits()).unwrap(),
        dispatch(getPromos()).unwrap(),
      ]);
      setLocalError(null);
      setRetryCount(0);

      toast.success(t("useStatsToasts.successData"));

      updateUserEntityNameIfMissing(dispatch, currentUser, currentUserDetails);
    } catch (err: unknown) {
      toast.error(t("useStatsToasts.failedData"), { id: toastId });
      console.error("Error fetching initial data:", err);
      if (err instanceof Error) {
        setLocalError(err.message);
        toast.error(
          t("useStatsToasts.errorMessage", { message: err.message }),
          { id: toastId }
        );
      } else {
        setLocalError("An unknown error occurred while fetching data.");
        toast.error(t("useStatsToasts.unknownError"), { id: toastId });
      }

      if (retryCount < 5) {
        setRetryCount((prevCount) => prevCount + 1);
        console.log(`Retry count incremented: ${retryCount + 1}`);
      }
    } finally {
      setLoading(false);
      toast.dismiss(toastId);
    }
  }, [dispatch, retryCount, currentUser, currentUserDetails, t]);

  useEffect(() => {
    if (role !== "employee" && shouldFetchData) {
      fetchData();
    }
  }, [shouldFetchData, fetchData, role]);

  useEffect(() => {
    if (retryCount > 0 && retryCount <= 5) {
      const retryTimeout = setTimeout(() => {
        fetchData();
      }, 5000);

      return () => {
        console.log("Clearing retry timeout");
        clearTimeout(retryTimeout);
      };
    }
  }, [retryCount, fetchData, t, shouldFetchData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFakeLoading(false);
    }, 50); // Fake loading for 700ms

    return () => clearTimeout(timer);
  }, []);

  const loadingState = loading || fakeLoading;

  useEffect(() => {
    if (localError) {
      setFakeLoading(false);
    }
  }, [localError]);

  return {
    loading,
    loadingState,
    localError,
    shouldFetchData,
    clients,
    agents,
    currentUser,
    role,
    currentUserData,
    currentUserDetails,
    error,
  };
};

export default useLoadingData;
