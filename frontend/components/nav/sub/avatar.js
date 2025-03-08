import React, { useEffect, useState } from "react";
import Image from "next/image";
import { TbChevronDown } from "react-icons/tb";
import { useRouter } from "next/router";
import { getAvatar } from "@/libs/fetching/user";

const Avatar = () => {
  const [avatar, setAvatar] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchAvatar = async () => {
      const avatarUrl = await getAvatar();
      setAvatar(avatarUrl);
    };
    fetchAvatar();
  }, []);

  const handleNavigateToProfile = () => {
    setSelectedLink("profile");
  };

  const handleLogout = () => {
    localStorage.clear(); // Removes all localStorage data
    router.push("/login");
  };

  return (
    <div className="relative flex items-center gap-2">
      <div className="relative w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-md">
        <Image
          src={avatar || "/User-avatar.png"}
          alt="User Avatar"
          layout="fill"
          objectFit="cover"
          className="rounded-full"
        />
      </div>

      <button
        className="flex items-center justify-center p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <TbChevronDown
          className="text-xl text-gray-600 transition-transform duration-200"
          style={{
            transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      <div
        className={`absolute right-0 top-12 w-48 bg-white shadow-lg rounded-lg overflow-hidden z-10 transition-all duration-300 transform ${
          dropdownOpen
            ? "scale-100 opacity-100"
            : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        <ul className="py-2">
          <li>
            <button
              onClick={() => router.push("/")}
              className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              Profile
            </button>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Avatar;
