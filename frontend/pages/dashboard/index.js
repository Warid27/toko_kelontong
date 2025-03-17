import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "@/components/nav/sidebar";
import Navbar from "@/components/nav/navbar";
import { checkAuth } from "@/utils/checkAuth";

const Dashboard = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedLink, setSelectedLink] = useState("profile");

  useEffect(() => {
    checkAuth(setIsAuthenticated, handleLogout);

    const interval = setInterval(() => {
      checkAuth(setIsAuthenticated, handleLogout);
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const handleLogout = (setUnauthorized = true) => {
    localStorage.clear();
    if (setUnauthorized) {
      localStorage.setItem("unauthorized", "true");
    }
    setIsAuthenticated(false);
    router.push("/login");
  };

  return isAuthenticated ? (
    <div className="flex">
      <div className="z-50">
        <Navbar
          handleLogout={() => handleLogout(false)}
          setSelectedLink={setSelectedLink}
        />
      </div>
      <Sidebar selectedLink={selectedLink} setSelectedLink={setSelectedLink} />
    </div>
  ) : null;
};

export default Dashboard;
