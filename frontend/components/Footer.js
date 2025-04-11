import React from "react";
import { motion } from "framer-motion";
import { HiMiniBuildingOffice } from "react-icons/hi2";
import { FaPhoneAlt } from "react-icons/fa";
import ImageWithFallback from "@/utils/ImageWithFallback";

const Footer = ({ logo = null, keterangan = "", address = "", phone = "" }) => {
  return (
    <motion.div
      className="bg-[#FFFFFF] px-6 py-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="flex flex-row justify-between h-full">
        <motion.div
          className="flex flex-row w-1/3 h-full mt-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="mr-4 h-full">
            <motion.div className="avatar h-full" whileHover={{ scale: 1.1 }}>
              <div className="relative flex overflow-hidden w-12 h-12 rounded-full border-2 border-[var(--bg-primary)]">
                <ImageWithFallback
                  src={
                    logo ||
                    "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                  }
                  onError={"https://placehold.co/100x100"}
                  alt="logo"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
          <p className="h-full">{keterangan}</p>
        </motion.div>
        <motion.div
          className="flex flex-col h-full w-1/3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <p className="font-bold">Information</p>
          <p className="flex flex-row space-y-3">
            <HiMiniBuildingOffice className="text-4xl mr-2 mt-2" />
            <span className="text-sm font-semibold">{address}</span>
          </p>
          <p className="flex flex-row items-center space-y-3 mt-4">
            <FaPhoneAlt className="text-md mt-3" />
            <span className="font-semibold">{phone}</span>
          </p>
        </motion.div>
      </div>
      <motion.p
        className="mt-4 text-center w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
      >
        Copyright © 2025 Carakan. All rights reserved
      </motion.p>
    </motion.div>
  );
};

export default Footer;
