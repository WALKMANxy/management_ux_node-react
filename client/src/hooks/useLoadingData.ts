//src/hooks/useLoadingData.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { shallowEqual } from "react-redux";
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
import { updateUserEntityNameIfMissing } from "../services/checkUserName";
import { ensureEncryptionInitialized } from "../utils/cacheUtils";

const timeMS = getTimeMs();

const useLoadingData = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const [localError, setLocalError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [fakeLoading, setFakeLoading] = useState(true);

  const retryCountRef = useRef(retryCount);
  retryCountRef.current = retryCount;

  const toastId = "loadingDataToast";

  const {
    clients,
    agents,
    currentUserData,
    currentUserDetails,
    status,
    error,
    currentUser,
    role,
  } = useAppSelector(
    (state: RootState) => ({
      clients: state.data.clients,
      agents: state.data.agents,
      currentUserData: state.data.currentUserData,
      currentUserDetails: state.data.currentUserDetails,
      status: state.data.status,
      error: state.data.error,
      currentUser: selectCurrentUser(state),
      role: selectCurrentUser(state)?.role,
    }),
    shallowEqual
  );

  const shouldFetchData = useMemo(() => {
    return (
      status !== "succeeded" &&
      role !== "employee" &&
      (Object.keys(clients).length === 0 ||
        Object.keys(agents).length === 0 ||
        !currentUserData ||
        !currentUserDetails) &&
      retryCountRef.current < 5
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

      if (retryCountRef.current < 5) {
        setRetryCount((prevCount) => prevCount + 1);
        // console.log(`Retry count incremented: ${retryCountRef.current + 1}`);
      }
    } finally {
      setLoading(false);
      toast.dismiss(toastId);
    }
  }, [dispatch, currentUser, currentUserDetails, t]);

  useEffect(() => {
    if (role !== "employee" && shouldFetchData) {
      fetchData();
    }
  }, [shouldFetchData, fetchData, role]);

  useEffect(() => {
    if (retryCount > 0 && retryCount <= 5) {
      const retryTimeout = setTimeout(() => {
        fetchData();
      }, 500);

      return () => {
        // console.log("Clearing retry timeout");
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
