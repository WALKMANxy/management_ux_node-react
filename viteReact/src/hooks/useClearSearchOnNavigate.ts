// src/hooks/useClearSearchOnNavigate.ts
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { clearResults } from "../features/search/searchSlice";

const useClearSearchOnNavigate = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearResults());
  }, [location.pathname, dispatch]);
};

export default useClearSearchOnNavigate;
