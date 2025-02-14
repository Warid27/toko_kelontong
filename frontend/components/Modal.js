import React from "react";
import { IoClose } from "react-icons/io5";

export const Modal = ({ title, children, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between align-middle">
              <p className="text-xl text-black float-left font-bold">{title}</p>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <IoClose className="text-xl text-black" />
              </button>
            </div>
            <div className="mt-2">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
