"use client";
import { Modal } from "antd";
import React, { useContext, useEffect, useState } from "react";

import { WalletConnect } from "./wallet";
import { LoginAuth } from "./login";
import { RegisterAuth } from "./register";
import { AnimatePresence, motion } from "framer-motion";
import { WalletContext } from "@/context";

interface MainAuthProps {
  isModalOpen?: boolean;
  handleClose?: ()=> void;
  onCancel?: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}
export const MainAuth = (props: MainAuthProps) => {
  const { isModalOpen = false, onCancel, handleClose } = props;
  const [page, setPage] = useState<number>(0);
  const [payload, setPayload] = useState({});
  const {
    connectedWallet,
  } = useContext(WalletContext);

  useEffect(() => {
    setTimeout(() => {
      if (connectedWallet) handleClose?.()
    }, 1000)
  
  }, [connectedWallet])

  return (
    <Modal
      className="rounded-lg"
      title={null}
      open={isModalOpen}
      // onOk={handleOk}
      onCancel={(e) => {
        setPage(0);
        onCancel?.(e);
      }}
      footer={null}
    >
      <div className="flex flex-col">
        {page != 1 && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="text-[32px]"
          >
            Welcome to MLayer developer console!
          </motion.span>
        )}
        {page == 1 && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="text-[32px]"
          >
            We Missed You!
          </motion.span>
        )}
        <span className="text-gray-500 mb-11">
          mLayer&apos;s developer console allows developer create and manage their subnet applications.
        </span>

        {/* <SocialAuth /> */}
        {/* <div className="overflow-y-auto whitespace-nowrap"> */}
        {page == 0 && (
          <WalletConnect
            onSelect={() => {
              onCancel?.(null as any);
            }}
          />
        )}

        {page == 1 && (
          <LoginAuth
            handleCreateAccount={() => {
              setPage(2);
            }}
            onSuccess={(payload) => {
              //
              // onCancel
              if (payload?.["data"]?.["emailVerified"] == false) {
                setPayload(payload);
                setPage(3);
                return;
              }
              onCancel?.(payload);
            }}
          />
        )}

        {page == 2 && (
          <RegisterAuth
            handleLoginAccount={() => {
              setPage(1);
            }}
            onSuccess={(_payload) => {
              setPage(3);
              setPayload(_payload);
            }}
          />
        )}
      </div>
      {/* </div> */}
    </Modal>
  );
};
