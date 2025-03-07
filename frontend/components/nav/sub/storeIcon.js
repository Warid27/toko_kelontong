import React, { useEffect, useState } from "react";
import Image from "next/image";

import { getStoreImage } from "@/libs/fetching/store";
import { tokenDecoded } from "@/utils/tokenDecoded";

const StoreIcon = ({ role, store_id = null }) => {
  // ✅ Menerima props sebagai objek
  const [storeIcon, setStoreIcon] = useState(null);

  useEffect(() => {
    const getStoreIconFunction = async () => {
      let id_store = null;

      if (role === 1) {
        id_store = store_id;
      } else {
        const userData = tokenDecoded();
        id_store = userData?.id_store || null; // ✅ Mencegah error jika userData tidak ada
      }

      if (!id_store) {
        setStoreIcon(null);
        return;
      }

      try {
        const storeIcon = await getStoreImage(id_store, "icon"); // ✅ Kirim `id_store` jika dibutuhkan
        setStoreIcon(storeIcon);
      } catch (error) {
        console.error("Error fetching store image:", error);
        setStoreIcon(null);
      }
    };

    getStoreIconFunction();
  }, [role]); // ✅ Tambahkan `role` ke dependensi

  return (
    <div className="relative upload-content flex overflow-hidden w-12 h-12 rounded-full border-2 border-white">
      {/* StoreIcon Image */}
      {storeIcon ? (
        <Image
          src={storeIcon}
          alt="Uploaded"
          className="object-cover"
          width={48} // ✅ Sesuaikan dengan ukuran container
          height={48}
        />
      ) : (
        <Image
          src="/User-storeIcon.png"
          alt="storeIcon"
          width={48}
          height={48}
          className="object-cover"
        />
      )}
    </div>
  );
};

export default StoreIcon;
