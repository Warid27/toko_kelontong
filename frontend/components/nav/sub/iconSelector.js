import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ImageWithFallback from "@/utils/ImageWithFallback";
import useUserStore from "@/stores/user-store";
import { fetchCompanyList } from "@/libs/fetching/company";
import { fetchStoreList } from "@/libs/fetching/store";

const IconSelector = () => {
  const { userData } = useUserStore();
  const { id_company, id_store, rule: role } = userData || {};

  const [companyList, setCompanyList] = useState([]);
  const [storeList, setStoreList] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isStore, setIsStore] = useState(false);

  // Fetch companies on component mount
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

  // Find and set selected company when company list or id changes
  useEffect(() => {
    if (!id_company || id_company === "null" || !companyList.length) return;

    const company = companyList.find((company) => company._id === id_company);
    if (company) setSelectedCompany(company);
  }, [companyList, id_company]);

  // Fetch stores when company is selected
  useEffect(() => {
    if (!id_company || id_company === "null") {
      setSelectedCompany(null);
      setStoreList([]);
      setSelectedStore(null);
      return;
    }

    const fetchStores = async () => {
      try {
        const data = await fetchStoreList(id_company);
        const stores = Array.isArray(data) ? data : [];
        setStoreList(stores);

        if (id_store && id_store !== "null") {
          const store = stores.find((store) => store._id === id_store);
          setSelectedStore(store || null);
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
      }
    };

    fetchStores();
  }, [id_company, id_store]);

  // Calculate which icon to display
  const iconSrc = useMemo(() => {
    if (selectedStore && isStore) {
      return selectedStore.icon || "https://placehold.co/100x100";
    }
    return selectedCompany?.logo || "https://placehold.co/100x100";
  }, [selectedCompany, selectedStore, isStore]);

  // If no role or no selected company, render empty div
  if (!role || !selectedCompany) {
    return <div></div>;
  }

  return (
    <div className="flex flex-row items-center gap-3">
      <motion.div
        className="relative flex overflow-hidden w-12 h-12 rounded-full border-2 border-white shadow-md"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isStore ? "store" : "company"}
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <ImageWithFallback
              src={iconSrc}
              alt="Company or Store Icon"
              className="object-cover w-full h-full"
              width={48}
              height={48}
              onError="https://placehold.co/100x100"
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <div className="flex flex-col items-start gap-1">
        {selectedCompany && (
          <motion.button
            onClick={() => setIsStore(false)}
            className={`text-sm font-medium px-2 py-1 rounded-md transition-colors ${
              !isStore ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
            }`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            animate={{
              fontWeight: !isStore ? 600 : 400,
            }}
            aria-label={`Perusahaan: ${selectedCompany.name}`}
            title={`Perusahaan: ${selectedCompany.name}`}
          >
            {selectedCompany.name}
          </motion.button>
        )}

        {selectedStore && (
          <motion.button
            onClick={() => setIsStore(true)}
            className={`text-sm font-medium px-2 py-1 rounded-md transition-colors ${
              isStore ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
            }`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            animate={{
              fontWeight: isStore ? 600 : 400,
            }}
            aria-label={`Toko: ${selectedStore.name}`}
            title={`Toko: ${selectedStore.name}`}
          >
            {selectedStore.name}
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default IconSelector;
