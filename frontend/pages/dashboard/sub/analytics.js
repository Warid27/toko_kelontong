import React from "react";
import { IoSearchOutline } from "react-icons/io5";
import Image from "next/image";
import { MdKeyboardArrowDown } from "react-icons/md";

export const Analytics = () => {
  return (
    <div className="w-full h-screen pt-16 ">
      <div className="bg-white shadow-lg w-full flex flex-row p-2 justify-between">
        <div className="flex flex-col">
          <p className="text-2xl font-bold">Analytics</p>
          <p>Detailed information about your store</p>
        </div>
        <div className="flex flex-row space-x-4">
          <div className="relative mt-2">
            <input
              type="text"
              placeholder="Search anything here"
              className="pl-10 pr-4 py-2 border border-black rounded-md w-full max-w-xs bg-white"
            />
            <IoSearchOutline className="absolute left-3 top-3 text-black" />
          </div>
          <div className="avatar">
            <div className="w-14 rounded-full">
              <Image
                src="/User-avatar.png"
                alt="avatar"
                width={20}
                height={20}
              />
            </div>
          </div>
          <button className="button btn-ghost btn-sm rounded-lg mt-3">
            <MdKeyboardArrowDown className="text-2xl mt-1" />
          </button>
        </div>
      </div>

      {/* Analytics content */}
      <div className="p-4">
        <h2>Analytics Content</h2>
        {/* Your analytics dashboard content goes here */}
      </div>
    </div>
  );
};

export default Analytics;
