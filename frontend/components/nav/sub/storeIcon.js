import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getStoreImage } from "@/libs/fetching/store";

const StoreIcon = ({ idStore, role }) => {
  const [storeIcon, setStoreIcon] = useState(null);

  // Fetch store icon based on storeId
  const getStoreIconFunction = async (storeId) => {
    if (!storeId) {
      setStoreIcon(null);
      return;
    }

    try {
      const icon = await getStoreImage(storeId, "icon");
      setStoreIcon(icon);
    } catch (error) {
      console.error("Error fetching store image:", error);
      setStoreIcon(null);
    }
  };

  useEffect(() => {
    // Use the idStore prop directly and fetch the icon if it exists
    if (idStore && idStore !== "undefined" && idStore !== "null") {
      getStoreIconFunction(idStore);
    } else {
      setStoreIcon(null);
    }
  }, [idStore]); // Depend on idStore prop changes

  return role ? (
    storeIcon ? (
      <div className="relative upload-content flex overflow-hidden w-12 h-12 rounded-full border-2 border-white">
        <Image
          src={storeIcon}
          alt="Uploaded"
          className="object-cover"
          width={48}
          height={48}
        />
      </div>
    ) : (
      <div></div>
    )
  ) : (
    <div></div>
  );
};

export default StoreIcon;
