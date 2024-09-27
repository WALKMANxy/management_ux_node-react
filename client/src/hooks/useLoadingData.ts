import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { RootState } from "../app/store";
import {
  fetchInitialData,
  getPromos,
  getVisits,
} from "../features/data/dataThunks";
import { selectCurrentUser } from "../features/users/userSlice";
import { DataSliceState } from "../models/stateModels";
import { updateUserEntityNameIfMissing } from "../utils/checkUserName";
import { showToast } from "../utils/toastMessage";

const useLoadingData = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const [localError, setLocalError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0); // Track retry attempts
  const [fakeLoading, setFakeLoading] = useState(true);

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
      (Object.keys(clients).length === 0 ||
        Object.keys(agents).length === 0 ||
        !currentUserData ||
        !currentUserDetails)
    );
  }, [status, clients, agents, currentUserData, currentUserDetails]);

  const fetchData = useCallback(async () => {
    try {
      showToast.loading(t("useStatsToasts.loadingData"));

      setLoading(true);
      await dispatch(fetchInitialData()).unwrap();
      await Promise.all([
        dispatch(getVisits()).unwrap(),
        dispatch(getPromos()).unwrap(),
      ]);
      setLocalError(null);
      setRetryCount(0);

      showToast.success(t("useStatsToasts.successData"));

      updateUserEntityNameIfMissing(dispatch, currentUser, currentUserDetails);
    } catch (err: unknown) {
      showToast.error(t("useStatsToasts.failedData"));
      console.error("Error fetching initial data:", err);
      if (err instanceof Error) {
        setLocalError(err.message);
        showToast.error(
          t("useStatsToasts.errorMessage", { message: err.message })
        );
      } else {
        setLocalError("An unknown error occurred while fetching data.");
        showToast.error(t("useStatsToasts.unknownError"));
      }

      if (retryCount < 5) {
        setRetryCount((prevCount) => prevCount + 1);
        console.log(`Retry count incremented: ${retryCount + 1}`);
      }
    } finally {
      setLoading(false);
      toast.dismiss();
    }
  }, [dispatch, retryCount, currentUser, currentUserDetails, t]);

  useEffect(() => {
    if (shouldFetchData) {
      fetchData();
    }
  }, [shouldFetchData, fetchData]);

  useEffect(() => {
    if (retryCount > 0 && retryCount <= 5) {
      console.log(`Retry attempt #${retryCount}`);
      showToast.loading(
        t("useStatsToasts.retryingData", { attempt: retryCount })
      );

      const retryTimeout = setTimeout(() => {
        console.log("Retrying fetchData");
        fetchData();
      }, 5000);

      return () => {
        console.log("Clearing retry timeout");
        clearTimeout(retryTimeout);
      };
    }
  }, [retryCount, fetchData, t]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFakeLoading(false);
    }, 50); // Fake loading for 700ms

    return () => clearTimeout(timer);
  }, []);

  const loadingState = loading || fakeLoading;

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
