"use client";
import { Button, Input, Space } from "antd";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { BsDiscord, BsGithub, BsTwitterX } from "react-icons/bs";
import { MdSend } from "react-icons/md";

interface AppFooterProps {}
export const AppFooter = (props: AppFooterProps) => {
  return (
    <footer className="p-4 lg:p-12 mt-10 bg-gray-300 dark:bg-[#101020] flex flex-col gap-12   ">
      <div className="flex flex-wrap justify-between">
        <div className="flex flex-col gap-8 w-full lg:w-auto mt-20 lg:mt-0">
          <div className="flex items-start gap-2">
            <a href="/">
              <Image
                src="/logo.png"
                alt="Vercel Logo"
                className="bg-cover mt-1"
                width={35}
                height={35}
                priority
              />{" "}
            </a>
            <div className="flex flex-col">
              <a href="/">
                <span className="text-2xl font-bold font-assistant dark:text-white">
                  mlConsole
                </span>
              </a>
              <span className=" text-sm text-opacity-0">by Fero Tech</span>
            </div>
          </div>
          <div className="flex  gap-2">
            {/* <Link
                className="inline-block hover:text-white transition-all duration-300"
                href="#"
              >
                <BsFacebook />
              </Link> */}
            <Link
              className="inline-flex items-center justify-center p-2 rounded-lg w-10 h-10 dark:bg-[#28303F] hover:text-white transition-all duration-300"
              href="https://twitter.com/mlayerprotocol"
              target="_blank"
            >
              <BsTwitterX size={30} />
            </Link>
            <Link
              className="inline-flex items-center justify-center p-2 rounded-lg w-10 h-10 dark:bg-[#28303F] hover:text-white transition-all duration-300"
              href="https://discord.gg/QazYZYBqus"
              target="_blank"
            >
              <BsDiscord size={30} />
            </Link>
            <Link
              className="inline-flex items-center justify-center p-2 rounded-lg w-10 h-10 dark:bg-[#28303F] hover:text-white transition-all duration-300"
              target="_blank"
              href="https://github.com/mlayerprotocol"
            >
              <BsGithub size={30} />
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-4  w-full lg:w-auto mt-20 lg:mt-0">
          <span className="font-semibold mb-2 dark:text-white">Company</span>
          <span className="font-light text-sm  text-opacity-80">
            <Link href="https://www.mlayer.network" target="_blank">
              www.mlayer.network
            </Link>
          </span>

          <span className="font-light text-sm  text-opacity-80">
            <Link href="https://mlayer.gitbook.io/white-paper" target="_blank">
              Whitepaper
            </Link>
          </span>
          <span className="font-light text-sm  text-opacity-80">
            <Link
              href="https://mlayer.gitbook.io/introduction/what-is-mlayer"
              target="_blank"
            >
              Documentation
            </Link>
          </span>
        </div>

        <div className="flex flex-col gap-4  w-full lg:w-auto mt-20 lg:mt-0">
          <span className="font-semibold mb-2 dark:text-white">Socials</span>
          <Link target="_blank" href="https://github.com/mlayerprotocol">
            <span className="font-light text-sm  text-opacity-80">Github</span>
          </Link>
          <Link href="https://twitter.com/mlayerprotocol" target="_blank">
            <span className="font-light text-sm  text-opacity-80">
              X (formally twitter)
            </span>
          </Link>
          <Link href="https://discord.gg/QazYZYBqus" target="_blank">
            <span className="font-light text-sm  text-opacity-80">Discord</span>
          </Link>
        </div>

        <div className="flex flex-col gap-4  w-full lg:w-auto mt-20 lg:mt-0">
          <span className="font-semibold mb-2 dark:text-white">
            Subscribe to us
          </span>

          <span className="font-light text-sm  text-opacity-80 max-w-[254px]">
            Signup for our newsletter to get the latest news in your inbox.
          </span>
          <Space.Compact className="rounded-4xl">
            <Input
              ref={(element) => {
                if (element)
                  element.input?.style.setProperty(
                    "background",
                    "transparent",
                    "important"
                  );
              }}
              placeholder="Enter your email address"
              className="!rounded-l-[43px] !bg-transparent"
            />
            <Button type="primary" className="!rounded-r-[43px]">
              <MdSend size={20} />
            </Button>
          </Space.Compact>
        </div>
      </div>
    </footer>
  );
};
