import React, { useEffect } from "react";
import Sidebar from "@/components/nav/sidebar";
import Navbar from "@/components/nav/navbar";
import { useRouter } from "next/router";

const Dashboard = () => {
  const router = useRouter();

  // Helper function to check token expiration
  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1])); // Decode the payload
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      return payload.exp < currentTime; // Check if the token is expired
    } catch (error) {
      console.error("Error decoding token:", error.message);
      return true; // Assume expired if decoding fails
    }
  };

  // Function to check authentication
  const checkAuth = () => {
    const token = localStorage.getItem("token");
    if (!token || isTokenExpired(token)) {
      console.log("Token missing or expired. Logging out...");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login"); // Use Next.js router for navigation
    }
  };

  useEffect(() => {
    // Check authentication when the component mounts
    checkAuth();
  }, [router]);

  return (
    <div className="flex">
      <Navbar />
      <Sidebar />
    </div>
  );
};

export default Dashboard;
