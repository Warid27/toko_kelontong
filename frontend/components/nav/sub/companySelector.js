import React, { useEffect, useState, useRef } from "react";
import Select from "react-select";
import { fetchCompanyList } from "@/libs/fetching/company";
import { fetchStoreList } from "@/libs/fetching/store";
import { motion, AnimatePresence } from "framer-motion";

const CompanySelector = ({ updateLocalStorage }) => {
  const dropdownRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [companyList, setCompanyList] = useState([]);
  const [storeList, setStoreList] = useState([]);
  const [companySelect, setCompanySelect] = useState(
    () => localStorage.getItem("id_company") || null
  );
  const [storeSelect, setStoreSelect] = useState(
    () => localStorage.getItem("id_store") || null
  );

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await fetchCompanyList();
        setCompanyList(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    const fetchStores = async () => {
      if (companySelect && companySelect !== "null") {
        try {
          const data = await fetchStoreList(companySelect);
          setStoreList(Array.isArray(data) ? data : []);
          const validStore = data.find((store) => store._id === storeSelect);
          if (!validStore) {
            setStoreSelect(null);
            updateLocalStorage("id_store", null); // Updated here
          }
        } catch (error) {
          console.error("Error fetching stores:", error);
        }
      } else {
        setStoreList([]);
        setStoreSelect(null);
      }
    };
    fetchStores();
  }, [companySelect, updateLocalStorage, storeSelect]); // Added updateLocalStorage to dependencies

  useEffect(() => {
    if (companySelect && companySelect !== "null") {
      updateLocalStorage("id_company", companySelect); // Updated here
    } else {
      updateLocalStorage("id_company", null); // Updated here
    }
  }, [companySelect, updateLocalStorage]); // Added updateLocalStorage to dependencies

  useEffect(() => {
    if (storeSelect) {
      updateLocalStorage("id_store", storeSelect); // Updated here
    } else {
      updateLocalStorage("id_store", null); // Updated here
    }
  }, [storeSelect, updateLocalStorage]); // Added updateLocalStorage to dependencies

  const clearSelector = () => {
    updateLocalStorage("id_company", null);
    updateLocalStorage("id_store", null);
    setCompanySelect(null);
    setStoreSelect(null);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="block w-full px-6 py-3 text-left text-gray-800 bg-white hover:bg-gray-100 transition-all duration-200"
      >
        Select Company & Store
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
            <Select
              options={companyList.map((c) => ({
                value: c._id,
                label: c.name,
              }))}
              value={
                companyList.find((c) => c._id === companySelect)
                  ? {
                      value: companySelect,
                      label: companyList.find((c) => c._id === companySelect)
                        ?.name,
                    }
                  : null
              }
              onChange={(selectedOption) =>
                setCompanySelect(selectedOption?.value || null)
              }
              isSearchable
              placeholder="Select a company"
            />
            {companySelect && companySelect !== "null" && (
              <Select
                options={storeList.map((s) => ({
                  value: s._id,
                  label: s.name,
                }))}
                value={
                  storeList.find((s) => s._id === storeSelect)
                    ? {
                        value: storeSelect,
                        label: storeList.find((s) => s._id === storeSelect)
                          ?.name,
                      }
                    : null
                }
                onChange={(selectedOption) =>
                  setStoreSelect(selectedOption?.value || null)
                }
                isSearchable
                placeholder="Select a store"
              />
            )}
            <motion.button
              className="dangerBtn mt-2 w-full"
              onClick={clearSelector}
            >
              Clear
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompanySelector;
