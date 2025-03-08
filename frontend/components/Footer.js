import React from "react";
import Image from "next/image";
import { HiMiniBuildingOffice } from "react-icons/hi2";
import { FaPhoneAlt } from "react-icons/fa";

const Footer = ({ logo = null, keterangan = "", address = "", phone = "" }) => {
  return (
    <div className="bg-[#FFFFFF] px-6 py-6">
      <div className="flex flex-row justify-between h-full">
        <div className="flex flex-row w-1/3 h-full mt-4">
          <div className="mr-4 h-full">
            <div className="avatar h-full">
              <div className="relative flex overflow-hidden w-12 h-12 rounded-full border-2 border-[var(--bg-primary)]">
                <Image
                  src={
                    logo ||
                    "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                  }
                  alt="logo"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
            </div>
          </div>
          <p className="h-full">{keterangan}</p>
        </div>
        <div className="flex flex-col h-full w-1/3">
          <p className="font-bold">Information</p>
          <p className="flex flex-row space-y-3">
            <HiMiniBuildingOffice className="text-4xl mr-2 mt-2" />
            <span className="text-sm font-semibold">{address}</span>
          </p>
          <p className="flex flex-row items-center space-y-3 mt-4">
            <FaPhoneAlt className="text-md mt-3" />
            <span className="font-semibold">{phone}</span>
          </p>
        </div>
      </div>
      <p className="mt-4 text-center w-full">
        Copyright © 2025 Carakan. All rights reserved
      </p>
    </div>
  );
};

export default Footer;
