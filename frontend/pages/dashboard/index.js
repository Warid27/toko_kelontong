import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Sidebar from "@/components/nav/sidebar";
import Navbar from "@/components/nav/navbar";
import { checkAuth } from "@/utils/checkAuth";
import { tokenDecoded } from "@/utils/tokenDecoded";

const Dashboard = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedLink, setSelectedLink] = useState("profile");
  const [idCompany, setIdCompany] = useState(null);
  const [idStore, setIdStore] = useState(null);
  const [rule, setRule] = useState(null);
  const prevIdCompanyRef = useRef(null); // Track previous id_company
  const prevIdStoreRef = useRef(null); // Track previous id_store
  const intervalIdRef = useRef(null); // Ref to store interval ID

  useEffect(() => {
    checkAuth(setIsAuthenticated, handleLogout);
    updateCompanyAndStore();

    // Refresh authentication every 5 minutes
    const authInterval = setInterval(() => {
      checkAuth(setIsAuthenticated, handleLogout);
    }, 5 * 60 * 1000);

    // Set up interval to check localStorage changes based on role
    const userData = tokenDecoded();
    const numericRole = userData?.rule;
    setRule(numericRole);
    if (numericRole === 1 || numericRole === 2) {
      intervalIdRef.current = setInterval(() => {
        const latestCompany = localStorage.getItem("id_company");
        const latestStore = localStorage.getItem("id_store");

        // Check and update id_company if changed
        if (latestCompany !== prevIdCompanyRef.current) {
          prevIdCompanyRef.current = latestCompany;
          setIdCompany(
            latestCompany !== "undefined" && latestCompany !== "null"
              ? latestCompany
              : null
          );
        }

        // Check and update id_store if changed
        if (latestStore !== prevIdStoreRef.current) {
          prevIdStoreRef.current = latestStore;
          setIdStore(
            latestStore !== "undefined" && latestStore !== "null"
              ? latestStore
              : null
          );
        }
      }, 1000); // Check every second
    }

    // Cleanup intervals on unmount
    return () => {
      clearInterval(authInterval);
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, []);

  const updateCompanyAndStore = () => {
    const userData = tokenDecoded();
    const numericRole = userData?.rule;

    let companyId = null;
    let storeId = null;

    // Determine IDs based on role
    if (numericRole === 1 || numericRole === 2) {
      const storedCompany = localStorage.getItem("id_company");
      const storedStore = localStorage.getItem("id_store");

      companyId =
        storedCompany !== "undefined" && storedCompany !== "null"
          ? storedCompany
          : null;
      storeId =
        storedStore !== "undefined" && storedStore !== "null"
          ? storedStore
          : null;
    } else {
      companyId = userData?.id_company || null;
      storeId = userData?.id_store || null;
    }

    // Update state only if values have changed
    if (prevIdCompanyRef.current !== companyId) {
      prevIdCompanyRef.current = companyId;
      setIdCompany(companyId);
    }
    if (prevIdStoreRef.current !== storeId) {
      prevIdStoreRef.current = storeId;
      setIdStore(storeId);
    }
  };

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
          idStore={idStore}
        />
      </div>
      <Sidebar
        numericRole={rule}
        selectedLink={selectedLink}
        setSelectedLink={setSelectedLink}
        idCompany={idCompany}
        idStore={idStore}
      />
    </div>
  ) : null;
};

export default Dashboard;
