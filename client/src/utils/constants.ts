// src/utils/constants.ts

import { keyframes } from "@emotion/react";
import { UserRole } from "../models/entityModels";

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

export const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const ChartData = (categories: string[], data: number[]) => ({
  options: {
    chart: {
      id: "basic-bar",
      toolbar: {
        show: false,
      },
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

export const ignoreArticleNames = Object.freeze(
  new Set(["RESO CARCASSA", "TRASPORTO ", "TRASPORTO URGENTE"])
);

export const agentColorMap: { [key: string]: string } = Object.freeze({
  "10": "#FFFACD", // Lemon Chiffon (Fazio Adriano Salvatore)
  "11": "#FFB6C1", // Light Pink (Salvatore Spinella)
  "12": "#B0E0E6", // Powder Blue (Riccardo Carpentiere)
  "13": "#98FB98", // Pale Green (Vito D'Antonio)
  "14": "#FFB6C1", // Light Pink (G.C.)
  "15": "#FFDAB9", // Peach Puff (Luddeni Renato)
  "16": "#20B2AA", // Light Sea Green (Luca Scaffo) *Kept as is since it's already relatively light
  "50": "#E6E6FA", // Lavender (Marco Coppola)
  "60": "#D3D3D3", // Light Grey (Web)
  "90": "#E6E6FA", // Lavender (Direzionale)
  "91": "#FFA07A", // Light Salmon (Direzionale Diesel)
  "92": "#B0C4DE", // Light Steel Blue (Direzionale D)
  "95": "#FFA07A", // Light Salmon (Cliente Agente)
  "99": "#F4A460", // Sandy Brown (Seguito da Avvocato)
  "100": "#D3D3D3", // Light Grey (Non Assegnato)
});

// src/constants/routes.ts
export const CLIENTS_OR_MESSAGES_PATHS = [
  "/clients",
  "/messages",
  "/visits",
  "/promos",
  "/calendar",
  "/movements",
  "/articles",
];

export const SETTINGS_PATH = "/settings";

export const ALLOWED_ROLES_FOR_PROTECTED_ROUTES: UserRole[] = [
  "admin",
  "client",
  "agent",
];

export const ALLOWED_ROLES_FOR_UNPROTECTED_ROUTES: UserRole[] = [
  "admin",
  "client",
  "agent",
  "employee",
];
