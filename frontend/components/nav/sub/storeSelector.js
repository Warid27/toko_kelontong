import React, { useEffect, useState, useRef } from "react";
import Select from "react-select";
import StoreIcon from "@/components/nav/sub/storeIcon";
import { fetchStoreList } from "@/libs/fetching/store";
import { getCompanyData } from "@/libs/fetching/company";

const StoreSelector = () => {
  const dropdownRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [storeList, setStoreList] = useState([]);
  const companyId = localStorage.getItem("id_company");
  const [storeSelect, setStoreSelect] = useState(() => {
    const storedStore = localStorage.getItem("id_store");
    return storedStore && storedStore !== "undefined" ? storedStore : null;
  });
  const [isStore, setIsStore] = useState(false);
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    const getCompany = async () => {
      const data = await getCompanyData(companyId);
      const name = data.name;
      setCompanyName(name);
    };
    const fetchAndSetStores = async () => {
      if (companyId && companyId !== "undefined") {
        try {
          const data = await fetchStoreList(companyId);
          if (Array.isArray(data)) {
            const filteredStores = data.filter(
              (store) => store.id_company === companyId
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
      } else {
        setStoreList([]);
        setStoreSelect(null);
        setIsStore(false);
      }
    };

    getCompany();
    fetchAndSetStores();
  }, [companyId]);

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
    setStoreSelect(null);
    setIsStore(false);
  };

  useEffect(() => {
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
      <div className="flex flex-row gap-2 items-center">
        {isStore && (
          <StoreIcon key={storeSelect} role={1} store_id={storeSelect} />
        )}
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md"
        >
          Select Store
        </button>
      </div>

      <div
        className={` absolute left-0 mt-2 w-64 bg-white border border-gray-300 rounded-md shadow-lg p-4 z-50 transition-all duration-300 ease-out transform  ${
          dropdownOpen
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-[-10px] pointer-events-none"
        }`}
      >
        <h1 className="text-center mb-2 text-xl font-semibold text-gray-800 tracking-wide">
          {companyName}
        </h1>
        <Select
          id="store"
          className="w-full"
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
      </div>
    </div>
  );
};

export default StoreSelector;
