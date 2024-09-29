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

const StyledImage = styled.img`
  height: 60%;
  margin-bottom: 10%;
  background-color: rgba(0, 0, 0, 0.01); /* Faint black background */
  border-radius: 8px; /* Rounded corners */
  padding: 10px; /* Optional padding to give some space around the image */
`;

const LoadingSpinner: React.FC<{ fadeoutDelay?: number }> = ({
  fadeoutDelay = 1500, // Default delay of 1.5 seconds
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
          height: "12%", // Adjust as needed
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <StyledImage
          src="/images/logo-appbar.png"
          alt="RCS Logo"
          style={{ height: "60%", marginBottom: "10%" }}
        />
        <CircularProgress
          style={{ color: "#9e9e9e", height: "9%", width: "9%" }} // Changed color to gray
          aria-label="loading"
        />
      </Box>
    </SpinnerContainer>
  );
};

export default LoadingSpinner;
