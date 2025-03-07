import React, { useEffect, useState } from "react";
import CompanySelector from "@/components/nav/sub/companySelector";
import Avatar from "@/components/nav/sub/avatar";
import { tokenDecoded } from "@/utils/tokenDecoded";
import StoreIcon from "@/components/nav/sub/storeIcon";

export default function Navbar() {
  const [userRole, setUserRole] = useState(4);

  useEffect(() => {
    const userData = tokenDecoded();
    const role = userData.rule;

    setUserRole(role); // Update the userRole state
  }, []);
  return (
    <div>
      <div className="navbar fixed top-0 left-0 right-0 z-10">
        {/* Added fixed, top-0, left-0, right-0, and z-10 */}
        <div className="flex justify-between w-full">
          <div>
            {userRole == 1 ? (
              <CompanySelector />
            ) : (
              <StoreIcon role={userRole} store_id={null} />//rid warid
            )}
          </div>

          <Avatar />
        </div>
      </div>
    </div>
  );
}
