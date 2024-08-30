// src/hooks/useClearSearchOnNavigate.ts
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAppDispatch } from "../app/hooks";
import { clearResults } from "../features/search/searchSlice";

const useClearSearchOnNavigate = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(clearResults());
  }, [location.pathname, dispatch]);
};

export default useClearSearchOnNavigate;
