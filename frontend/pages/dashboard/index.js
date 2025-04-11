import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "@/components/nav/sidebar";
import Navbar from "@/components/nav/navbar";
import useUserStore from "@/stores/user-store"; // Adjust path as needed
import Loading from "@/components/loading";

const Dashboard = () => {
  const router = useRouter();

  // Get data and actions from the store
  const {
    userData,
    isAuthenticated,
    isLoading,
    fetchUserData,
    updateCompanyAndStore,
    setupAuthCheck,
  } = useUserStore();

  // Initial data fetching
  useEffect(() => {
    const initializeUser = async () => {
      const result = await fetchUserData();
      if (!result) {
        router.push("/login");
      }
    };

    initializeUser();
  }, [fetchUserData, router]);

  // Set up event listeners
  useEffect(() => {
    // Handle localStorage changes from other tabs
    const handleStorageChange = (e) => {
      if (e.key === "id_company" || e.key === "id_store") {
        updateCompanyAndStore();
      }
    };

    // Handle custom localStorage change events (same tab)
    const handleLocalStorageCustomChange = (e) => {
      const { key } = e.detail || {};
      if (key === "id_company" || key === "id_store") {
        updateCompanyAndStore();
      }
    };

    // Set up authentication check interval
    const cleanupAuthCheck = setupAuthCheck();

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      "localStorageChange",
      handleLocalStorageCustomChange
    );

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "localStorageChange",
        handleLocalStorageCustomChange
      );
      cleanupAuthCheck();
    };
  }, [updateCompanyAndStore, setupAuthCheck]);

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated || !userData) {
    return null;
  }

  return (
    <div className="flex">
      <div className="z-50">
        <Navbar />
      </div>
      <Sidebar />
    </div>
  );
};

export default Dashboard;
