import React, { useEffect, useState } from "react";
import Sidebar from "@/components/nav/sidebar";
import Navbar from "@/components/nav/navbar";
import { useRouter } from "next/router";
import { jwtDecode } from "jwt-decode"; // ✅ Corrected import

const Dashboard = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  let inactivityTimer;

  // Function to check if token is expired
  const checkAuth = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      logout();
      return;
    }

    try {
      const { exp } = jwtDecode(token); // ✅ Corrected usage
      if (exp * 1000 < Date.now()) {
        logout();
      }
    } catch (error) {
      console.error("Invalid token:", error.message);
      logout();
    }
  };

  // Logout function
  const logout = () => {
    console.log("User logged out due to inactivity");
    localStorage.clear();
    setIsAuthenticated(false);
    router.push("/login");
  };

  // Reset inactivity timer on user activity
  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimer); // Clear previous timer
    inactivityTimer = setTimeout(logout, 60 * 60 * 60 * 1000); // jam (1 = 1 jam) | menit (60 = 60 menit)| detik (60 = 1 menit) | milidetik (1000 = 1 detik)
  };

  useEffect(() => {
    checkAuth();

    // Listen for user activity (mouse, keyboard, touch)
    window.addEventListener("mousemove", resetInactivityTimer);
    window.addEventListener("keydown", resetInactivityTimer);
    window.addEventListener("click", resetInactivityTimer);
    window.addEventListener("scroll", resetInactivityTimer);

    // Start inactivity timer on mount
    resetInactivityTimer();

    return () => {
      // Cleanup: remove event listeners and clear timer
      window.removeEventListener("mousemove", resetInactivityTimer);
      window.removeEventListener("keydown", resetInactivityTimer);
      window.removeEventListener("click", resetInactivityTimer);
      window.removeEventListener("scroll", resetInactivityTimer);
      clearTimeout(inactivityTimer);
    };
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div className="flex">
      <Navbar />
      <Sidebar />
    </div>
  );
};

export default Dashboard;
// YUDA LUCU
