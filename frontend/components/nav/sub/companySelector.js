import React, { useEffect, useState, useRef } from "react";
import Select from "react-select";
import StoreIcon from "@/components/nav/sub/storeIcon";
import { fetchCompanyList } from "@/libs/fetching/company";
import { fetchStoreList } from "@/libs/fetching/store";

const CompanySelector = () => {
  const dropdownRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [companyList, setCompanyList] = useState([]);
  const [storeList, setStoreList] = useState([]);
  const [companySelect, setCompanySelect] = useState(() => {
    const storedCompany = localStorage.getItem("id_company");
    return storedCompany && storedCompany !== "undefined"
      ? storedCompany
      : null;
  });
  const [storeSelect, setStoreSelect] = useState(() => {
    const storedStore = localStorage.getItem("id_store");
    return storedStore && storedStore !== "undefined" ? storedStore : null;
  });
  const [isCompany, setIsCompany] = useState(false);
  const [isStore, setIsStore] = useState(false);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const data = await fetchCompanyList();
        setCompanyList(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching companies:", error);
        setCompanyList([]);
      }
    };
    fetchCompany();
  }, []);

  useEffect(() => {
    const fetchAndSetStores = async () => {
      if (companySelect && companySelect !== "undefined") {
        try {
          const data = await fetchStoreList(companySelect);
          if (Array.isArray(data)) {
            const filteredStores = data.filter(
              (store) => store.id_company === companySelect
            );
            setStoreList(filteredStores);

            const storedStore = localStorage.getItem("id_store");
            if (storedStore && storedStore !== "undefined") {
              const storeExists = filteredStores.some(
                (store) => store._id === storedStore
              );
              setStoreSelect(storeExists ? storedStore : null);
              setIsStore(storeExists);
            }
          } else {
            setStoreList([]);
          }
        } catch (error) {
          console.error("Error fetching stores:", error);
          setStoreList([]);
        }
        setIsCompany(true);
      } else {
        setStoreList([]);
        setIsCompany(false);
        setStoreSelect(null);
        setIsStore(false);
      }
    };

    fetchAndSetStores();
  }, [companySelect]);

  useEffect(() => {
    if (companySelect && companySelect !== "undefined") {
      localStorage.setItem("id_company", companySelect);
    } else {
      localStorage.removeItem("id_company");
    }
  }, [companySelect]);

  useEffect(() => {
    if (storeSelect && storeSelect !== "undefined") {
      localStorage.setItem("id_store", storeSelect);
      setIsStore(true);
    } else {
      localStorage.removeItem("id_store");
      setIsStore(false);
    }
  }, [storeSelect]);

  const handleChangeStore = (store) => {
    setStoreSelect(store);
  };

  const clearSelector = () => {
    localStorage.removeItem("id_store");
    localStorage.removeItem("id_company");
    setCompanySelect(null);
    setStoreSelect(null);
    setIsCompany(false);
    setIsStore(false);
  };

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className=" flex flex-row gap-2 items-center">
        {isStore && (
          <StoreIcon key={storeSelect} role={1} store_id={storeSelect} />
        )}
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md"
        >
          Select Company & Store
        </button>
      </div>

      <div
        className={`absolute left-0 mt-2 w-64 bg-white border border-gray-300 rounded-md shadow-lg p-4 z-50 transition-all duration-300 ease-out transform  ${
          dropdownOpen
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-[-10px] pointer-events-none"
        }`}
      >
        <Select
          id="company"
          className="w-full"
          options={companyList.map((c) => ({ value: c._id, label: c.name }))}
          value={
            companyList
              .map((c) => ({ value: c._id, label: c.name }))
              .find((opt) => opt.value === companySelect) || null
          }
          onChange={(selectedOption) => setCompanySelect(selectedOption?.value)}
          isSearchable
          placeholder="Select a company"
          noOptionsMessage={() => "No Company available"}
        />

        {isCompany && (
          <>
            <Select
              id="store"
              className="w-full mt-2"
              options={storeList.map((s) => ({
                value: s._id,
                label: s.name,
              }))}
              value={
                storeList
                  .map((s) => ({ value: s._id, label: s.name }))
                  .find((opt) => opt.value === storeSelect) || null
              }
              onChange={(selectedOption) =>
                handleChangeStore(selectedOption?.value)
              }
              isSearchable
              placeholder="Select a store"
              noOptionsMessage={() => "No Store available"}
            />
            <button className="dangerBtn mt-2 w-full" onClick={clearSelector}>
              Clear
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CompanySelector;
