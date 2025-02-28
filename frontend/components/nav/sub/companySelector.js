import React, { useEffect, useState } from "react";
import client from "@/libs/axios";
import Select from "react-select";

const CompanySelector = () => {
  const [companyList, setCompanyList] = useState([]);
  const [storeList, setStoreList] = useState([]);
  const [companySelect, setCompanySelect] = useState("");
  const [storeSelect, setStoreSelect] = useState("");
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
        const response = await client.post("/company/listcompany", {});
        const data = response.data;

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

  useEffect(() => {
    if (companySelect) {
      const fetchStore = async () => {
        try {
          const response = await client.post("/store/liststore", {
            id_company: companySelect,
          });
          const data = response.data;

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
          "Company masih kosong"
        }
        noOptionsMessage={() => "No Company available"}
      />

      {isCompany && (
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
      )}
    </div>
  );
};

export default CompanySelector;
