// src/components/LoadingSpinner.tsx
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Box, CircularProgress } from "@mui/material";
import React, { useEffect, useState } from "react";
import { fadeOut } from "../../utils/constants";

// Styled Box component with Emotion
const SpinnerContainer = styled(Box)<{ fadeout: string }>`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-color: transparent; /* No background */
  position: relative; /* Relative positioning */
  z-index: 1000; /* Adjust as needed */
  ${({ fadeout }) =>
    fadeout === "true" &&
    css`
      animation: ${fadeOut} 0.5s forwards;
      opacity: 0;
    `}
  transition: opacity 0.5s;
`;

const LoadingSpinner: React.FC<{ fadeoutDelay?: number }> = ({
  fadeoutDelay = 1500,
}) => {
  const [fadeOutEffect, setFadeOutEffect] = useState("false");

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOutEffect("true");
    }, fadeoutDelay);

    return () => {
      clearTimeout(timer);
    };
  }, [fadeoutDelay]);

  return (
    <SpinnerContainer fadeout={fadeOutEffect}>
      <Box
        sx={{
          height: "12%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress
          style={{ color: "#9e9e9e", height: "9%", width: "9%" }}
          aria-label="loading"
        />
      </Box>
    </SpinnerContainer>
  );
};

export default LoadingSpinner;
