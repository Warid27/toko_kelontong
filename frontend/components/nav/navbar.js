import React, { useEffect, useState } from "react";
import CompanySelector from "@/components/nav/sub/companySelector";
import Avatar from "@/components/nav/sub/avatar";
import { tokenDecoded } from "@/utils/tokenDecoded";
import StoreIcon from "@/components/nav/sub/storeIcon";
import { motion } from "framer-motion";

export default function Navbar({ handleLogout, setSelectedLink }) {
  const [userRole, setUserRole] = useState(4);

  useEffect(() => {
    const userData = tokenDecoded();
    const role = userData.rule;
    setUserRole(role);
  }, []);

  return (
    <motion.div
      className="navbar fixed top-0 left-0 right-0 z-50 bg-[var(--bg-primary)] 
    shadow-lg backdrop-blur-lg border-b border-[var(--bg-primary)]/30 px-6 py-3"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex justify-between items-center w-full">
        <div>
          {userRole === 1 ? (
            <CompanySelector />
          ) : (
            <StoreIcon role={userRole} store_id={null} />
          )}
        </div>

        <Avatar setSelectedLink={setSelectedLink} handleLogout={handleLogout} />
      </div>
    </motion.div>
  );
}
