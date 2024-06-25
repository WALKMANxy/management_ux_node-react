//src/components/common/Loader.tsx
import React, { useEffect, useState } from 'react';
import { CircularProgress, Box } from '@mui/material';
import styled from '@emotion/styled';
import { keyframes, css } from '@emotion/react';

// Keyframes for the fade-out effect
const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

// Styled Box component with Emotion
const FullScreenBox = styled(Box)<{ fadeout: string }>`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color: black;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1300;
  ${({ fadeout }) => fadeout === 'true' && css`
    animation: ${fadeOut} 0.5s forwards;
    opacity: 0;
  `}
  transition: opacity 0.5s;
`;

const Loader: React.FC = () => {
  const [fadeOutEffect, setFadeOutEffect] = useState('false');

  useEffect(() => {
    //console.log("Loader mounted");
    const timer = setTimeout(() => {
      //console.log("Fade out triggered");
      setFadeOutEffect('true');
    }, 1500);

    return () => {
      //console.log("Cleanup timer");
      clearTimeout(timer);
    };
  }, []);

  return (
    <FullScreenBox fadeout={fadeOutEffect}>
      <Box
        sx={{
          height: '12%', // 10% bigger than previous value
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img src="/logo-appbar.png" alt="RCS Logo" style={{ height: '60%', marginBottom: '10%' }} />
        <CircularProgress style={{ color: 'white', height: '9%', width: '9%' }} /> {/* 10% smaller */}
      </Box>
    </FullScreenBox>
  );
};

export default Loader;
