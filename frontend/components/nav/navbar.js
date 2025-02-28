import React, { useEffect, useState } from "react";
import CompanySelector from "@/components/nav/sub/companySelector";

export default function Navbar() {
  const [userRole, setUserRole] = useState(4); // Default role is "kasir"

  useEffect(() => {
    // Retrieve the numeric role from localStorage
    const role = localStorage.getItem("rule");

    setUserRole(role); // Update the userRole state
  }, []); // Run only once on component mount
  return (
    <div>
      <div className="navbar fixed top-0 left-0 right-0 z-10">
        {" "}
        {/* Added fixed, top-0, left-0, right-0, and z-10 */}
        <div className="flex-none">
          {userRole == 1 ? <CompanySelector /> : ""}
        </div>
      </div>
    </div>
  );
}
