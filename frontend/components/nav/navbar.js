import React, { useEffect, useState } from "react";

import Avatar from "@/components/nav/sub/avatar";
import StoreIcon from "@/components/nav/sub/storeIcon";
import { motion } from "framer-motion";

export default function Navbar({
  handleLogout,
  setSelectedLink,
  userData,
  updateLocalStorage,
}) {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    setUserRole(userData.rule);
  }, [userData.rule]);

  return (
    <motion.div
      className="navbar fixed top-0 left-0 right-0 z-50
      shadow-lg backdrop-blur-lg border-b px-6 py-3 bg-gradient-to-r from-green-500 to-green-600"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex justify-between items-center w-full">
        <StoreIcon idStore={userData.id_store} role={userRole} />
        <Avatar
          updateLocalStorage={updateLocalStorage}
          selector={userRole == 1 ? "superadmin" : userRole == 2 ? "admin" : ""}
          setSelectedLink={setSelectedLink}
          handleLogout={handleLogout}
          userData={userData}
        />
      </div>
    </motion.div>
  );
}
