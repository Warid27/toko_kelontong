import React, { useEffect, useState } from "react";
import client from "@/libs/axios";
import Select from "react-select";

import { fetchCompanyList } from "@/libs/fetching/company";
import { fetchStoreList } from "@/libs/fetching/store";

const CompanySelector = () => {
  const [companyList, setCompanyList] = useState([]);
  const [storeList, setStoreList] = useState([]);
  const [companySelect, setCompanySelect] = useState(
    localStorage.getItem("id_company") == "undefined"
      ? null
      : localStorage.getItem("id_company")
  );
  const [storeSelect, setStoreSelect] = useState(
    localStorage.getItem("id_store") == "undefined"
      ? null
      : localStorage.getItem("id_store")
  );
  const [isCompany, setIsCompany] = useState(false);

  useEffect(() => {
    if (companySelect) {
      localStorage.setItem("id_company", companySelect);
      localStorage.removeItem("id_store");
      setIsCompany(true);
    } else {
      setIsCompany(false);
    }
  }, [companySelect]);

  useEffect(() => {
    if (storeSelect) {
      localStorage.setItem("id_store", storeSelect);
    }
  }, [storeSelect]);

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

  const HandleBersih = async () => {
    localStorage.removeItem("id_store");
    localStorage.removeItem("id_company");
    setCompanySelect("");
    setStoreSelect("");
    setIsCompany(false);
  };

  useEffect(() => {
    if (companySelect) {
      const fetchStore = async () => {
        try {
          const data = await fetchStoreList();

          if (Array.isArray(data)) {
            setStoreList(data);
          } else {
            console.error("Unexpected response:", data);
            setStoreList([]);
          }
        } catch (error) {
          console.error("Error fetching stores:", error);
          setStoreList([]);
        }
      };
      fetchStore();
    } else {
      setStoreList([]);
    }
  }, [companySelect]);

  return (
    <div className="flex flex-row gap-2">
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
        required
        placeholder={
          companyList.find((d) => d._id === companySelect)?.name ||
          "Select a company"
        }
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
            onChange={(selectedOption) => setStoreSelect(selectedOption?.value)}
            isSearchable
            required
            placeholder={
              storeList.find((d) => d._id === storeSelect)?.name ||
              "Select a store"
            }
            noOptionsMessage={() => "No Store available"}
          />
          <button onClick={HandleBersih}>bersihkan company</button>
        </>
      )}
    </div>
  );
};

export default CompanySelector;
