import React, { useEffect, useState } from "react";
import { getStoreImage } from "@/libs/fetching/store";
import ImageWithFallback from "@/utils/ImageWithFallback";
import useUserStore from "@/stores/user-store";

const CompanyIcon = () => {
  const { userData } = useUserStore();

  const [companyIcon, setCompanyIcon] = useState(null);

  const idCompany = userData?.id_company;
  const role = userData?.rule;

  // Fetch company icon based on companyId
  const getCompanyIconFunction = async (companyId) => {
    if (!companyId) {
      setCompanyIcon(null);
      return;
    }

    try {
      const icon = await getCompanyImage(companyId, "icon");
      setCompanyIcon(icon);
    } catch (error) {
      console.error("Error fetching company image:", error);
      setCompanyIcon(null);
    }
  };

  useEffect(() => {
    // Use the idCompany prop directly and fetch the icon if it exists
    if (idCompany && idCompany !== "undefined" && idCompany !== "null") {
      getCompanyIconFunction(idCompany);
    } else {
      setCompanyIcon(null);
    }
  }, [idCompany]);

  return role ? (
    companyIcon ? (
      <div className="relative upload-content flex overflow-hidden w-12 h-12 rounded-full border-2 border-white">
        <ImageWithFallback
          src={companyIcon || "https://placehold.co/100x100"}
          alt="Uploaded"
          className="object-cover"
          width={48}
          onError={"https://placehold.co/100x100"}
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

export default CompanyIcon;
