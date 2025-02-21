import React, { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { FaUserEdit, FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import Image from "next/image";
import { MdKeyboardArrowDown } from "react-icons/md";
import client from "@/libs/axios";
import Swal from "sweetalert2";

const Profile = () => {
  const [storeList, setStoreList] = useState([]); // State for list of companies
  const [companyList, setCompanyList] = useState([]); // State for list of companies
  const [showPassword, setShowPassword] = useState(false); // State for showing password
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState(null);
  const [userDataUpdate, setUserDataUpdate] = useState({
    id: "",
    username: "",
    password: "",
    rule: "",
    status: "",
    id_company: "",
    id_store: "",
  });

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const response = await client.post("/store/liststore", {});
        const data = response.data;

        // Validate that the response is an array
        if (!Array.isArray(data)) {
          console.error("Unexpected data format from /store/liststore:", data);
          setStoreList([]);
        } else {
          setStoreList(data);
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
        setStoreList([]);
      }
    };
    fetchStore();
  }, []);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await client.post("/company/listcompany", {});
        const data = response.data;

        // Validate that the response is an array
        if (!Array.isArray(data)) {
          console.error(
            "Unexpected data format from /company/listcompany:",
            data
          );
          setCompanyList([]);
        } else {
          setCompanyList(data);
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
        setCompanyList([]);
      }
    };
    fetchCompany();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const id_user = localStorage.getItem("id_user");
        if (!id_user) {
          console.error("user_id is missing in localStorage");
          setIsLoading(false);
          return;
        }
        const response = await client.post(
          "/user/getuser",
          { id: id_user },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUserToUpdate(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (userToUpdate) {
      setUserDataUpdate({
        id: userToUpdate._id,
        username: userToUpdate.username,
        password: "",
        rule: userToUpdate.rule,
        status: userToUpdate.status !== undefined ? userToUpdate.status : 1, // Default to 1
        id_company: userToUpdate.id_company,
        id_store: userToUpdate.id_store,
      });
    }
  }, [userToUpdate]);

  const handleChangeUpdate = (e) => {
    const { name, value } = e.target;
    setUserDataUpdate((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    if (!userDataUpdate.username) {
      Swal.fire("Error", "Please fill in all required fields!", "error");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await client.put(
        `/api/user/${userDataUpdate.id}`,
        userDataUpdate,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("Success", "Profile updated successfully!", "success");
      setUserToUpdate(response.data);
      setIsEditMode(false);
    } catch (error) {
      console.error("Error updating user:", error);
      Swal.fire("Error", "Profile could not be updated!", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen pt-16 flex justify-center items-center">
        <div
          className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"
          aria-label="Loading"
        ></div>
      </div>
    );
  }

  // Map user roles to their corresponding names
  const ruleMapping = {
    1: "Superadmin",
    2: "Admin",
    3: "Manajer",
    4: "Kasir",
    "-": "Belum memiliki rule",
  };

  // Determine the role name based on the user's rule
  const userRule = userDataUpdate.rule;
  const nameRule = ruleMapping[userRule] || "-";

  // Map user roles to their corresponding names
  const statusMapping = {
    0: "Active",
    1: "Inactive",
  };

  // Determine the role name based on the user's status
  const userStatus = userDataUpdate.status;
  const nameStatus = statusMapping[userStatus] || "-";

  return (
    <div className="w-full h-screen pt-16">
      {/* Header */}
      <div className="justify-between w-full bg-white shadow-lg p-4">
        <div className="flex flex-row justify-between">
          <div className="flex flex-col">
            <p className="text-2xl font-bold">Daftar Profile</p>
            <p>Detail Daftar Profile</p>
          </div>
          <div className="relative mt-2 flex flex-row space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search anything here"
                className="pl-10 h-10 pr-4 py-2 border border-gray-300 rounded-md w-full max-w-xs"
              />
              <IoSearchOutline className="absolute left-2 top-2.5 text-xl text-gray-500" />
            </div>
            <div className="avatar">
              <div className="w-10 h-10 rounded-full">
                <Image
                  src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                  alt="avatar"
                  width={40}
                  height={40}
                />
              </div>
            </div>
            <button className="button btn-ghost btn-sm rounded-lg">
              <MdKeyboardArrowDown className="text-2xl mt-1" />
            </button>
          </div>
        </div>
      </div>
      {/* User Profile */}
      <div className="p-4">
        {/* Profile Header */}
        <div className="flex items-center w-full max-w-4xl justify-between">
          <div className="flex items-center space-x-4">
            <Image
              src="/User-avatar.png"
              alt="avatar"
              width={20}
              height={20}
              className="w-20 h-20 rounded-full object-cover"
            />
            <h1 className="text-2xl font-bold">
              {userDataUpdate.username || "NAMA USER"}
            </h1>
          </div>
          <button
            onClick={() => setIsEditMode(true)}
            className={`addBtn flex items-center space-x-2 ${
              isEditMode ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isEditMode}
          >
            <FaUserEdit />
            <span>Edit Profile</span>
          </button>
        </div>
        <form
          className="grid grid-cols-2 gap-6 w-full max-w-4xl mt-10"
          onSubmit={handleSubmitUpdate}
        >
          {/* Username */}
          <div>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="username"
            >
              Username
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 border-gray-300 bg-white text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Username"
              type="text"
              name="username"
              value={userDataUpdate.username || "-"}
              disabled={!isEditMode}
              onChange={handleChangeUpdate}
            />
          </div>
          <div>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 border-gray-300 bg-white text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={userDataUpdate.password}
                disabled={!isEditMode}
                onChange={handleChangeUpdate}
              />
              {isEditMode == true ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                >
                  {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                </button>
              ) : null}
            </div>
          </div>
          <div>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="company"
            >
              Perusahaan
            </label>
            <select
              id="company"
              className="shadow appearance-none border rounded w-full py-2 px-3 border-gray-300 bg-white text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={userDataUpdate.id_company || "-"}
              disabled={true}
              name="id_company"
            >
              <option value="-" disabled>
                Belum memiliki Perusahaan
              </option>

              {companyList.length === 0 ? (
                <option value="default">No company available</option>
              ) : (
                companyList.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="store"
            >
              Toko
            </label>
            <select
              id="store"
              className="shadow appearance-none border rounded w-full py-2 px-3 border-gray-300 bg-white text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={userDataUpdate.id_store || "-"}
              disabled={true}
              name="id_store"
            >
              <option value="-" disabled>
                Belum memiliki Toko
              </option>

              {storeList.length === 0 ? (
                <option value="default">No store available</option>
              ) : (
                storeList.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="rule"
            >
              Rule
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 border-gray-300 bg-white text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="rule"
              type="text"
              name="rule"
              value={nameRule}
              disabled={true}
            />
          </div>

          <div>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="status"
            >
              Status
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 border-gray-300 bg-white text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="status"
              type="text"
              name="status"
              value={nameStatus}
              disabled={true}
            />
          </div>

          {/* Repeat similar blocks for other fields */}
          {/* Edit and Update Buttons */}
          <div></div>
          <div className="flex justify-end space-x-2">
            {isEditMode ? (
              <>
                <button
                  type="button"
                  className="closeBtn"
                  onClick={() => setIsEditMode(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submitBtn">
                  Update
                </button>
              </>
            ) : (
              <div></div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
