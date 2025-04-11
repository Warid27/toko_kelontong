import React from "react";

import Avatar from "@/components/nav/sub/avatar";
import { motion } from "framer-motion";
import { SidebarToggle } from "../form/sidebarToggle";
import IconSelector from "@/components/nav/sub/iconSelector";

export default function Navbar() {
  return (
    <motion.div
      className="navbar fixed top-0 left-0 right-0 z-50
      shadow-lg backdrop-blur-lg border-b px-6 py-3 bg-gradient-to-r from-green-500 to-green-600"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center">
          <SidebarToggle />
          <IconSelector />
        </div>
        <Avatar />
      </div>
    </motion.div>
  );
}
