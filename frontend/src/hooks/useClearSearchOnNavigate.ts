// src/hooks/useClearSearchOnNavigate.ts
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearResults } from '../features/search/searchSlice';

const useClearSearchOnNavigate = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearResults());
  }, [location.pathname, dispatch]);
};

export default useClearSearchOnNavigate;
