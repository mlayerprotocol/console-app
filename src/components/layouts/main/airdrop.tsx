"use client";
import React, { ReactNode, Suspense, useContext, useState } from "react";
import { AppHeader } from "./header";
import { AppFooter } from "./footer";
import { AppAside } from "./sidebar";
import { AppAsideMobile } from "./sidebar/mobile";
import { AnimatePresence } from "framer-motion";
import { MainAuth } from "@/components/modals";
import { usePathname } from "next/navigation";
import { AirdropAside } from "./sidebar/airdrop";
import { AirDropContext } from "@/context";
import { AirdropMobileAside } from "./sidebar/airdrop-mobile";

export interface AirdropLayoutProps {
  children: ReactNode | ReactNode[];
}
export const AirdropLayout = (props: AirdropLayoutProps) => {
  const { children } = props;
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const [showAuthenticationModal, setShowAuthenticationModal] =
    useState<boolean>(false);
  const { showMobileMenu: showMobileMenuForAirdrop } =
    useContext(AirDropContext);

  return (
    <Suspense>
      <div className=" flex flex-col relative h-full">
        <AppHeader
          headerText="Airdrop Campaign"
          setShowMobileMenu={setShowMobileMenu}
          showMobileMenu={showMobileMenu}
          setShowAuthenticationModal={setShowAuthenticationModal}
          showAuthenticationModal={showAuthenticationModal}
        />
        <MainAuth
          isModalOpen={showAuthenticationModal}
          onCancel={() => {
            setShowAuthenticationModal((old) => !old);
          }}
          handleClose={() => setShowAuthenticationModal(false)}
        />
        <AnimatePresence>
          {showMobileMenu && (
            <AppAsideMobile
              setShowMobileMenu={setShowMobileMenu}
              showMobileMenu={showMobileMenu}
              setShowAuthenticationModal={setShowAuthenticationModal}
              showAuthenticationModal={showAuthenticationModal}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showMobileMenuForAirdrop && <AirdropMobileAside />}
        </AnimatePresence>
        <div className="grid grid-cols-12">
          <div className={`hidden lg:block col-span-3 xl:col-span-2`}>
            <AirdropAside />
          </div>
          <section
            className={`relative col-span-12 lg:col-span-9 xl:col-span-10`}
          >
            {children}
          </section>
        </div>

        <AppFooter />
      </div>
    </Suspense>
  );
};
