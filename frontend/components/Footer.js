import React from "react";
import Image from "next/image";
import { HiMiniBuildingOffice } from "react-icons/hi2";
import { FaPhoneAlt } from "react-icons/fa";

const Footer = () => {
  return (
    <div className="bg-[#FFFFFF] px-6 py-6">
      <div className="flex flex-row justify-between h-full">
        <div className="flex flex-row w-1/3 h-full mt-4">
          <div className="mr-4 h-full">
            <div className="avatar h-full">
              <div className="w-24 rounded-full h-full">
                <Image
                  src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                  alt="logo"
                  width={40}
                  height={40}
                />
              </div>
            </div>
          </div>
          <p className="h-full">
            Experience the epitome of dependable and secure communication
            through Prime, a premier platform for messaging, coordination, and
            calls that sets new benchmarks in reliability and security
            standards.
          </p>
        </div>
        <div className="flex flex-col h-full w-1/3">
          <p className="font-bold">Information</p>
          <p className="flex flex-row space-y-3">
            <HiMiniBuildingOffice className="text-4xl mr-2 mt-2" />
            <span className="text-sm font-semibold">
              Jl. Palagan Tentara Pelajar Blok B No.6 Sariharjo, Ngaglik, Tambak
              Rejo, Sariharjo, Kec. Ngaglik, Kabupaten Sleman, Daerah Istimewa
              Yogyakarta 55581
            </span>
          </p>
          <p className="flex flex-row items-center space-y-3 mt-4">
            <FaPhoneAlt className="text-md mt-3" />
            <span className="font-semibold">+62 822-2506-8682</span>
          </p>
        </div>
      </div>
      <p className="mt-4 text-center w-full">
        Copyright © 2024 Carakan. All rights reserved
      </p>
    </div>
  );
};

export default Footer;
