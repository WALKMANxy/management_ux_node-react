// src/components/common/AnimatedBox.tsx
import React from 'react';
import { Box, BoxProps } from '@mui/material';

interface AnimatedBoxProps extends BoxProps {
  animation?: string;
  duration?: string;
}

const AnimatedBox: React.FC<AnimatedBoxProps> = ({
  animation = 'fadeInUp',
  duration = '0.5s',
  children,
  ...rest
}) => {
  return (
    <Box
      className={`animate__animated animate__${animation}`}
      sx={{
        animationDuration: duration,
        ...rest.sx, 
      }}
    >
      {children}
    </Box>
  );
};

export default AnimatedBox;
