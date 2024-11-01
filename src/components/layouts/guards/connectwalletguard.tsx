"use client";
import React from "react";
import { useAccount } from "wagmi";

import { useWeb3Modal } from "@web3modal/wagmi/react";

import { Button, Card, notification } from "antd";

export default function ConnectWalletGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isConnected } = useAccount();
  const { open } = useWeb3Modal();

  if (!isConnected) {
    return (
      <div className="w-full h-full flex items-center justify-center py-20">
        <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-[#2e5cd1] to-[#6a7df1] p-6 rounded-xl shadow-xl">
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold text-white">
                Welcome to MLayer&#39;s Studio App
              </h1>
              <p className="text-lg text-white/80">
                Connect your wallet to create and manage your app&#39;s subnet.
              </p>
            </div>
            <Button
              className="rounded-full px-6 py-3 text-lg font-medium text-white shadow-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              onClick={() =>
                open().catch((err) => {
                  console.error("Failed to connect wallet", err);
                  notification.error({ message: "Failed to connect wallet" });
                })
              }
              type="default"
              shape="round"
            >
              Connect Wallet
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  return <>{children}</>;
}
