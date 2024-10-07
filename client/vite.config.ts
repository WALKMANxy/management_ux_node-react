import react from "@vitejs/plugin-react-swc";
import fs from "fs";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// Define the configuration function to receive the mode parameter
export default defineConfig(({ mode }) => {
  // Check if running in development mode
  const isDevelopment = mode === "development";

  // Conditionally load environment variables for development
  let serverConfig = undefined;
  if (isDevelopment) {
    const env = loadEnv(mode, process.cwd());
    const devkey = env.VITE_DEV_KEY;
    const devcrt = env.VITE_DEV_CRT;

    serverConfig = {
      https: {
        key: fs.readFileSync(devkey as string),
        cert: fs.readFileSync(devcrt as string),
      },
      host: "localhost",
      port: 3000,
    };
  }

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: [
          "apple-touch-icon.png",
          "masked-icon.svg",
          "rcs_icon.png",
          "locales/en/translation.json",
          "locales/es/translation.json",
          "locales/fr/translation.json",
          "locales/de/translation.json",
          "locales/it/translation.json",
          "locales/ru/translation.json",
          "checkerboard-cross.png",
          "funky-lines.png",
          "light_noise_diagonal.png",
          "logo-appbar.png",
          "logobig.png",
          "noise_lines.png",
          "pipes.png",
          "rough_diagonal.png",
          "struckaxiom.png",
        ],
        manifest: {
          name: "RCS Next",
          short_name: "RCS",
          description: "Internal management application.",
          start_url: "/",
          display: "standalone",
          background_color: "#000000",
          theme_color: "#000000",
          orientation: "portrait",
          icons: [
            {
              src: "/images/rcs_icon.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/images/rcs_icon.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        },
      }),
    ],
    // Only include server configuration if running in development
    ...(isDevelopment && { server: serverConfig }),
  };
});
