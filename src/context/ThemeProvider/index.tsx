"use client";

import { ConfigProvider, theme } from "antd";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { store } from "@/redux/app";
import { Provider } from "react-redux";
import { THEME_STORAGE_KEY, Storage } from "@/utils";

type ThemeType = "dark" | "light";

interface ThemeContextValues {
  themeType: ThemeType;
  setThemeType?: Dispatch<SetStateAction<ThemeType>>;
  toggleTheme?: () => void;
}

export const ThemeContext = createContext<ThemeContextValues>({
  themeType: "light",
});

export const ThemeContextProvider = ({ children }: { children: ReactNode }) => {
  const [themeType, setThemeType] = useState<ThemeType>("light");
  const { defaultAlgorithm, darkAlgorithm, compactAlgorithm } = theme;
  const [checkThemeChange, setCheckThemeChange] = useState<boolean>(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storage = new Storage(THEME_STORAGE_KEY);
      if (storage.get()) {
        setThemeType(storage.get());
      }
      setCheckThemeChange(true);
    }
  }, []);
  useEffect(() => {
    // if (!checkThemeChange) return;
    const html = document.querySelector("html") as HTMLHtmlElement;
    html.className = themeType;
    if (typeof window !== "undefined") {
      const storage = new Storage(THEME_STORAGE_KEY);
      storage.set(themeType);
      console.log("storage", storage.get(), "themeType", themeType);
    }
    // console.log("themeType", themeType);
  }, [themeType]);

  const toggleTheme = () => {
    setThemeType((old) => (old == "light" ? "dark" : "light"));
  };

  return (
    <Provider store={store}>
      <ConfigProvider
        theme={{
          algorithm: themeType == "light" ? defaultAlgorithm : darkAlgorithm,
          token: {
            // Seed Token
            colorPrimary: "#25D366",
            borderRadius: 2,
            fontFamily: `"Roboto", sans-serif`,
            fontSize: 15

            // Alias Token
            // colorBgContainer: "#f6ffed",
          },

          components: {
            Input: {
              colorBgContainer: "#A3A3A3",
              padding: 12,
            },
          },
        }}
      >
        <ThemeContext.Provider value={{ themeType, setThemeType, toggleTheme }}>
          {children}
        </ThemeContext.Provider>
      </ConfigProvider>
    </Provider>
  );
};
