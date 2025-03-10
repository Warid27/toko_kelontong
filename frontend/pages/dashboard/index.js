import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "@/components/nav/sidebar";
import Navbar from "@/components/nav/navbar";

const Dashboard = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedLink, setSelectedLink] = useState("profile");

  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp < Math.floor(Date.now() / 1000);
    } catch (error) {
      console.error("Error decoding token:", error);
      return true; // Assume expired if decoding fails
    }
  };

  const checkAuth = () => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");

    if (
      !token ||
      token === "undefined" ||
      token === "null" ||
      isTokenExpired(token)
    ) {
      setIsAuthenticated(false);
      handleLogout();
    } else {
      setIsAuthenticated(true);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    localStorage.setItem("unauthorized", "true");
    setIsAuthenticated(false);
    router.push("/login");
  };

  return isAuthenticated ? (
    <div className="flex">
      <Navbar handleLogout={handleLogout} setSelectedLink={setSelectedLink} />
      <Sidebar selectedLink={selectedLink} setSelectedLink={setSelectedLink} />
    </div>
  ) : null; // Renders nothing while checking auth
};

export default Dashboard;
