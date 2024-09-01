"use client";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from "react";

type TabDetail = {
  title: string;
  subTitle: string;
  startIndex: number;
  endIndex: number;
};
interface AirDropContextValues {
  showMobileMenu?: boolean;
  setShowMobileMenu?: Dispatch<SetStateAction<boolean>>;
  selectedScreen: number;
  setSelectedScreen?: Dispatch<SetStateAction<number>>;
  tabsDetails: TabDetail[];
}

export const AirDropContext = createContext<AirDropContextValues>({
  selectedScreen: 0,
  tabsDetails: [],
});

export const AirDropContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [selectedScreen, setSelectedScreen] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const tabsDetails: TabDetail[] = [
    {
      title: "Chapter 1 - Onboarding",
      subTitle: "Points Earned - 60 out of 500",
      startIndex: 0,
      endIndex: 2,
    },
    {
      title: "Chapter 2 - Discord",
      subTitle: "Points Earned - 80 out of 200",
      startIndex: 2,
      endIndex: 5,
    },
    {
      title: "Chapter 3 - mLayer Studio",
      subTitle: "Points Earned - 0 out of 2500",
      startIndex: 5,
      endIndex: 9,
    },
  ];

  return (
    <AirDropContext.Provider
      value={{
        selectedScreen,
        setSelectedScreen,
        tabsDetails,
        showMobileMenu,
        setShowMobileMenu,
      }}
    >
      {children}
    </AirDropContext.Provider>
  );
};