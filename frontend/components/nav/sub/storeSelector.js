// export default StoreSelector;
import React, { useEffect, useState, useRef } from "react";
import Select from "react-select";
import { fetchStoreList } from "@/libs/fetching/store";
import { getCompanyData } from "@/libs/fetching/company";
import { motion, AnimatePresence } from "framer-motion";
import useUserStore from "@/stores/user-store";

const StoreSelector = () => {
  const { userData, updateLocalStorage } = useUserStore();
  const companyId = userData?.id_company;
  const dropdownRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [storeList, setStoreList] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [storeSelect, setStoreSelect] = useState(
    () => localStorage.getItem("id_store") || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanyAndStores = async () => {
      setError(null);
      if (!companyId || companyId === "null") {
        setStoreList([]);
        setCompanyName("");
        setStoreSelect(null);
        updateLocalStorage("id_store", null);
        return;
      }
      setIsLoading(true);
      try {
        const companyData = await getCompanyData(companyId);
        setCompanyName(companyData?.name || "Unknown Company");
        const storeData = await fetchStoreList(companyId);
        const filteredStores = Array.isArray(storeData)
          ? storeData.filter((store) => store.id_company === companyId)
          : [];
        setStoreList(filteredStores);
        const validStore = filteredStores.find(
          (store) => store._id === storeSelect
        );
        if (!validStore) {
          setStoreSelect(null);
          updateLocalStorage("id_store", null);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load store data");
        setStoreList([]);
        setCompanyName("");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompanyAndStores();
  }, [companyId, storeSelect, updateLocalStorage]);

  useEffect(() => {
    if (storeSelect) {
      updateLocalStorage("id_store", storeSelect);
    } else {
      updateLocalStorage("id_store", null);
    }
  }, [storeSelect, updateLocalStorage]);

  const clearSelector = () => {
    setStoreSelect(null);
    updateLocalStorage("id_store", null);
    setDropdownOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="block w-full px-6 py-3 text-left text-gray-800 bg-white hover:bg-gray-100 transition-all duration-200"
        disabled={isLoading}
      >
        {isLoading ? "Loading stores..." : "Select Store"}
      </motion.button>
      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-slate-200 p-5 flex flex-col gap-3"
          >
            <h1 className="text-center text-gray-800">
              {companyName || "Select a Store"}
            </h1>
            {error ? (
              <div className="text-red-500 text-center">{error}</div>
            ) : (
              <Select
                options={storeList.map((store) => ({
                  value: store._id,
                  label: store.name,
                }))}
                value={
                  storeList.find((store) => store._id === storeSelect) || null
                }
                onChange={(selectedOption) =>
                  setStoreSelect(selectedOption?.value || null)
                }
                isSearchable
                isLoading={isLoading}
                placeholder={isLoading ? "Loading stores..." : "Select a store"}
                noOptionsMessage={() => "No stores available"}
              />
            )}
            <motion.button
              className="dangerBtn mt-2 w-full"
              onClick={clearSelector}
              disabled={!storeSelect || isLoading}
            >
              Clear
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StoreSelector;
