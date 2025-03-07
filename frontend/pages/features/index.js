import React, { useState } from "react";
import Swal from "sweetalert2"; // Import SweetAlert2
import { useRouter } from "next/router";
import Topbar from "@/components/Topbar";

const Features = () => {
  const router = useRouter();

  return (
    <div>
      <Topbar homePage={true} />

      <p>Features</p>
      <button
        onClick={() => router.push("/")}
        className="mt-4 px-6 py-3 cursor-pointer bg-[#ff6600] text-white font-semibold rounded-full shadow-lg hover:bg-[#e65c00] transition"
      >
        HOME{" "}
      </button>
    </div>
  );
};

export default Features;
