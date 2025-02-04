import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { syncThemeWithLocal } from "./helpers/theme_helpers";
import { useTranslation } from "react-i18next";
import "./localization/i18n";
import { updateAppLanguage } from "./helpers/language_helpers";
import { router } from "./routes/router";
import { RouterProvider } from "@tanstack/react-router";
import { useFileStore } from "./store/useFileStore";
import { useRecentFoldersStore } from "./store/useRecentFoldersStore";

export default function App() {
  const { i18n } = useTranslation();
  const setCurrentFolder = useFileStore(state => state.setCurrentFolder);
  const { recentFolders } = useRecentFoldersStore();

  useEffect(() => {
    syncThemeWithLocal();
    updateAppLanguage(i18n);
  }, [i18n]);

  useEffect(() => {
    const initializeLastFolder = async () => {
      if (recentFolders.length > 0) {
        const lastFolder = recentFolders[0];
        try {
          await setCurrentFolder(lastFolder);
          await router.navigate({ to: "/code-view" });
        } catch (error) {
          console.error('Failed to open last folder:', error);
        }
      }
    };

    initializeLastFolder();
  }, [recentFolders, setCurrentFolder]);

  return <RouterProvider router={router} />;
}

const root = createRoot(document.getElementById("app")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
