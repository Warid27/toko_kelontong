import React, { useEffect, useState } from "react";
import Select from "react-select";
import StoreIcon from "@/components/nav/sub/storeIcon";
import { fetchCompanyList } from "@/libs/fetching/company";
import { fetchStoreList } from "@/libs/fetching/store";

const CompanySelector = () => {
  const [companyList, setCompanyList] = useState([]);
  const [storeList, setStoreList] = useState([]);
  const [companySelect, setCompanySelect] = useState(() => {
    const storedCompany = localStorage.getItem("id_company");
    return storedCompany && storedCompany != "undefined" ? storedCompany : null;
  });
  const [storeSelect, setStoreSelect] = useState(() => {
    const storedStore = localStorage.getItem("id_store");
    return storedStore && storedStore != "undefined" ? storedStore : null;
  });
  const [isCompany, setIsCompany] = useState(false);
  const [isStore, setIsStore] = useState(false);

  // Fetch companies on mount
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const data = await fetchCompanyList();
        if (Array.isArray(data)) {
          setCompanyList(data);
        } else {
          console.error("Unexpected response:", data);
          setCompanyList([]);
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
        setCompanyList([]);
      }
    };
    fetchCompany();
  }, []);

  // Handle company selection and fetch stores
  useEffect(() => {
    const fetchAndSetStores = async () => {
      if (companySelect && companySelect !== "undefined") {
        try {
          const data = await fetchStoreList();
          if (Array.isArray(data)) {
            const filteredStores = data.filter(
              (store) => store.id_company === companySelect
            );
            setStoreList(filteredStores);

            // Check if stored store ID exists in the filtered list
            const storedStore = localStorage.getItem("id_store");
            if (storedStore && storedStore !== "undefined") {
              const storeExists = filteredStores.some(
                (store) => store._id === storedStore
              );
              if (storeExists) {
                setStoreSelect(storedStore);
                setIsStore(true);
              } else {
                setStoreSelect(null);
                localStorage.removeItem("id_store");
              }
            }
          } else {
            console.error("Unexpected response:", data);
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

  // Update localStorage when selections change
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

  const handleBersih = () => {
    localStorage.removeItem("id_store");
    localStorage.removeItem("id_company");
    setCompanySelect(null);
    setStoreSelect(null);
    setIsCompany(false);
    setIsStore(false);
  };

  return (
    <div className="flex flex-row gap-2 items-center">
      {isStore && (
        <StoreIcon key={storeSelect} role={1} store_id={storeSelect} />
      )}

      <Select
        id="company"
        className="basic-single"
        options={companyList.map((c) => ({
          value: c._id,
          label: c.name,
        }))}
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
            className="basic-single"
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
          <button onClick={handleBersih}>Bersihkan company</button>
        </>
      )}
    </div>
  );
};

export default CompanySelector;
