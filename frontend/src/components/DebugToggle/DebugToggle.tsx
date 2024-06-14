// src/components/DebugToggle.tsx
import React from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { toggleDebug } from '../../features/debug/debugSlice';

const DebugToggle: React.FC = () => {
  const dispatch = useAppDispatch();
  const debugEnabled = useAppSelector((state) => state.debug.enabled);

  return (
    <button onClick={() => dispatch(toggleDebug())}>
      {debugEnabled ? 'Disable Debug' : 'Enable Debug'}
    </button>
  );
};

export default DebugToggle;
