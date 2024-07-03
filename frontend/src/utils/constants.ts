// src/utils/constants.ts

import { keyframes } from "@emotion/react";

export const gradients = [
  "linear-gradient(135deg, #fffde7 30%, #fff9c4 100%)",
  "linear-gradient(135deg, #ffe0b2 30%, #ffcc80 100%)",
  "linear-gradient(135deg, #e8f5e9 30%, #c8e6c9 100%)",
  "linear-gradient(135deg, #f3e5f5 30%, #e1bee7 100%)",
];

export const brandColors = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#FF9F40",
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#FF9F40",
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#FF9F40",
  "#FF6384",
];

export const monthMap: { [key: string]: string } = {
  "01": "January",
  "02": "February",
  "03": "March",
  "04": "April",
  "05": "May",
  "06": "June",
  "07": "July",
  "08": "August",
  "09": "September",
  "10": "October",
  "11": "November",
  "12": "December",
};

// Keyframes for the fade-out effect
export const fadeOut = keyframes`
from {
  opacity: 1;
}
to {
  opacity: 0;
}
`;

export const ChartData = (categories: string[], data: number[]) => ({
  options: {
    chart: {
      id: "basic-bar",
    },
    xaxis: {
      categories,
      labels: {
        style: {
          colors: "#000",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#000",
        },
      },
    },
  },
  series: [
    {
      name: "Total Orders",
      data,
    },
  ],
});

export const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 6);
};

export const paginationPageSizeSelector = [20, 50, 100, 200, 500];
