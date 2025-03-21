import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Sidebar from "@/components/nav/sidebar";
import Navbar from "@/components/nav/navbar";
import { checkAuth } from "@/utils/checkAuth";
import { tokenDecoded, clearUserCache } from "@/utils/tokenDecoded";

const Dashboard = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedLink, setSelectedLink] = useState("profile");
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to get values from localStorage with validation
  const getValidatedLocalStorageValue = (key) => {
    const value = localStorage.getItem(key);
    return value && value !== "undefined" && value !== "null" ? value : null;
  };

  // Memoized logout handler
  const handleLogout = useCallback(
    (setUnauthorized = true) => {
      localStorage.clear();
      clearUserCache();
      if (setUnauthorized) {
        localStorage.setItem("unauthorized", "true");
      }
      setIsAuthenticated(false);
      setUserData(null);
      router.push("/login");
    },
    [router] // Dependency: router
  );

  // Helper function to update localStorage and trigger updates
  const updateLocalStorage = useCallback((key, value) => {
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
      // Update userData if the key is id_company or id_store
      if (key === "id_company" || key === "id_store") {
        setUserData((prevUserData) => {
          if (!prevUserData) return prevUserData;
          return {
            ...prevUserData,
            [key]: null, // Set the corresponding field to null
          };
        });
      }
    } else {
      localStorage.setItem(key, value);
      // Update userData if the key is id_company or id_store
      if (key === "id_company" || key === "id_store") {
        setUserData((prevUserData) => {
          if (!prevUserData) return prevUserData;
          return {
            ...prevUserData,
            [key]: value, // Set the corresponding field to the new value
          };
        });
      }
    }

    // Create and dispatch a custom event with the key and value
    const event = new CustomEvent("localStorageChange", {
      detail: { key, value },
    });
    window.dispatchEvent(event);
  }, []); // No dependencies since setUserData is stable

  // Memoized function to update company and store IDs
  const updateCompanyAndStore = useCallback(() => {
    if (!userData) return;

    // Get values from localStorage only if userData values are null
    const companyId =
      userData.id_company !== null
        ? userData.id_company
        : getValidatedLocalStorageValue("id_company");

    const storeId =
      userData.id_store !== null
        ? userData.id_store
        : getValidatedLocalStorageValue("id_store");
    // Update userData to reflect the determined values
    setUserData((prevUserData) => {
      // Only update if the values are actually different to prevent infinite loop
      if (
        prevUserData.id_company === companyId &&
        prevUserData.id_store === storeId
      ) {
        return prevUserData;
      }

      return {
        ...prevUserData,
        id_company: companyId,
        id_store: storeId,
      };
    });
  }, [userData]); // Only depend on userData, not its properties

  // Initial setup effect
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Check authentication status
        const authCheckPromise = new Promise((resolve) => {
          checkAuth((authStatus) => {
            setIsAuthenticated(authStatus);
            if (!authStatus) {
              handleLogout();
            }
            resolve(authStatus);
          }, handleLogout);
        });

        const authStatus = await authCheckPromise;

        if (!authStatus) {
          setIsLoading(false);
          return;
        }

        // Get user data from token
        const response = await tokenDecoded();
        if (response && typeof response === "object") {
          // If userData has null values for company or store, get from localStorage
          const companyId =
            response.id_company !== null
              ? response.id_company
              : getValidatedLocalStorageValue("id_company");

          const storeId =
            response.id_store !== null
              ? response.id_store
              : getValidatedLocalStorageValue("id_store");

          // Set merged user data
          const mergedUserData = {
            ...response,
            id_company: companyId,
            id_store: storeId,
          };

          // Set state once with all values
          setUserData(mergedUserData);
        } else {
          handleLogout();
        }
      } catch (error) {
        console.error("Error initializing user:", error);
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, [handleLogout]); // Empty dependency array - only run once

  // Event listeners effect
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

    // Auth check interval
    const authInterval = setInterval(() => {
      checkAuth((authStatus) => {
        setIsAuthenticated(authStatus);
        if (!authStatus) {
          handleLogout();
        }
      }, handleLogout);
    }, 5 * 60 * 1000);

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
      clearInterval(authInterval);
    };
  }, [updateCompanyAndStore, handleLogout]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated || !userData) {
    return null;
  }

  return (
    <div className="flex">
      <div className="z-50">
        <Navbar
          handleLogout={() => handleLogout(false)}
          setSelectedLink={setSelectedLink}
          userData={userData}
          updateLocalStorage={updateLocalStorage}
        />
      </div>
      <Sidebar
        userData={userData}
        numericRole={userData?.rule}
        selectedLink={selectedLink}
        setSelectedLink={setSelectedLink}
      />
    </div>
  );
};

export default Dashboard;
