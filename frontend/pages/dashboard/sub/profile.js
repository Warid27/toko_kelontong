import React, { useEffect, useState } from "react";

// Icons
import { IoSearchOutline } from "react-icons/io5";
import { FaUserEdit, FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { MdOutlineChangeCircle } from "react-icons/md";

// Package
import Image from "next/image";
import client from "@/libs/axios";
import Swal from "sweetalert2";

// Components
import { fetchUserGet } from "@/libs/fetching/user";
import { fetchCompanyList } from "@/libs/fetching/company";
import { fetchStoreList } from "@/libs/fetching/store";
import { uploadImageCompress } from "@/libs/fetching/upload-service";
import { Modal } from "@/components/Modal";

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
    avatar: "",
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  useEffect(() => {
    const fetching_requirement = async () => {
      const get_store_list = async () => {
        const data_store = await fetchStoreList();
        setStoreList(data_store);
        setIsLoading(false);
      };
      const get_company_list = async () => {
        const data_company = await fetchCompanyList();
        setCompanyList(data_company);
        setIsLoading(false);
      };
      const get_user_get = async () => {
        const data_user = await fetchUserGet();
        setUserToUpdate(data_user);
        setIsLoading(false);
      };
      get_store_list();
      get_company_list();
      get_user_get();
    };
    fetching_requirement();
  }, []);
  useEffect(() => {
    if (userToUpdate) {
      setUserDataUpdate({
        id: userToUpdate._id,
        username: userToUpdate.username,
        avatar: userToUpdate.avatar,
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
  // const handleChangePass = (e) => {
  //   const { name, value } = e.target;
  //   setCurrentPassword((prevState) => ({
  //     ...prevState,
  //     [name]: value,
  //   }));
  // };

  // UPLOADS
  const handleImageChange = async (e, params) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // 🔹 Set correct upload path
      let pathPrefix = "";
      switch (params) {
        case "avatar":
          pathPrefix = "user/avatar";
          break;
        default:
          console.error(`Invalid params value: ${params}`);
          return;
      }

      const response = await uploadImageCompress(file, params, pathPrefix);

      if (response.status == 201) {
        const uploadedImageUrl = response.data.metadata.shortenedUrl;
        // 🔹 Update state based on `params`
        if (params === "avatar") {
          setUserDataUpdate((prevState) => ({
            ...prevState,
            avatar: uploadedImageUrl,
          }));
        }

        console.log(`✅ Image uploaded successfully: ${uploadedImageUrl}`);
      } else {
        console.log(`❌ Upload Failed: ${response.error}`);
      }
    } catch (error) {
      console.error("❌ Compression or upload failed:", error);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    console.log("data", userDataUpdate);
    console.log("password", currentPassword);
    if (!userDataUpdate.username) {
      Swal.fire("Error", "Please fill in all required fields!", "error");
      return;
    }
    if (userDataUpdate.password !== repeatPassword) {
      Swal.fire("Error", "password and repeated password not same!", "error");
      return;
    }
    try {
      const response = await client.post("/login/checkpass", {
        username: userDataUpdate.username,
        password: currentPassword,
      });

      if (response.status === 200) {
        console.log(response);
        await handleSubmitUpdate(e);
        Swal.fire("Success", "Profile updated successfully!", "success");
      } else {
        Swal.fire("Error", "Password cannot be updating!", "error");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      Swal.fire("Error", "Password cannot be updating!", "error");
    }
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
      setCurrentPassword("");
      setRepeatPassword("");
      modalOpen("change", false);
      setUserToUpdate(response.data);
      setIsEditMode(false);
    } catch (error) {
      console.error("Error updating user:", error);
      Swal.fire("Error", "Profile could not be updated!", "error");
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const modalOpen = (param, bool) => {
    const setters = {
      change: setIsModalOpen,
    };
    if (setters[param]) {
      setters[param](bool);
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
        </div>
      </div>
      {/* User Profile */}
      <div className="p-4">
        {/* Profile Header */}
        <div className="flex items-center w-full max-w-4xl justify-between">
          <div className="flex items-center space-x-4">
            <div className="upload-container">
              <label className="upload-label">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, "avatar")}
                  style={{ display: "none" }}
                  disabled={!isEditMode}
                />
                <div
                  className={`relative upload-content flex overflow-hidden w-20 h-20 rounded-full border-2 border-primary ${
                    isEditMode ? "cursor-pointer group" : ""
                  }`}
                >
                  {/* Overlay appears only when isEditMode is true */}
                  <div
                    className={`absolute top-0 left-0 w-full h-full rounded-full bg-slate-500/50 flex items-center justify-center transition-opacity duration-300 ${
                      isEditMode
                        ? "opacity-0 group-hover:opacity-100"
                        : "hidden"
                    }`}
                  >
                    <MdOutlineChangeCircle className="w-3/4 h-3/4 text-black" />
                  </div>

                  {/* Avatar Image */}
                  {userDataUpdate.avatar ? (
                    <Image
                      src={userDataUpdate.avatar}
                      alt="Uploaded"
                      className="uploaded-image object-cover"
                      width={80}
                      height={80}
                    />
                  ) : (
                    <Image
                      src="/User-avatar.png"
                      alt="avatar"
                      width={80} // Fix size to match the container
                      height={80}
                      className="object-cover"
                    />
                  )}
                </div>
              </label>
            </div>
            <h1 className="text-2xl font-bold">
              {userDataUpdate.username || "NAMA USER"}
            </h1>
          </div>
          <button
            onClick={() => modalOpen("change", true)}
            className="addBtn flex items-center space-x-2"
          >
            Change Password
          </button>
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
      {isModalOpen && (
        <Modal
          onClose={() => modalOpen("change", false)}
          title={"Change Password"}
        >
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 border-gray-300 bg-white text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="current password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 border-gray-300 bg-white text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={userDataUpdate.password}
            onChange={handleChangeUpdate}
          />
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 border-gray-300 bg-white text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="repeat password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
          >
            {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
          </button>
          <button
            type="submit"
            onClick={(e) => handleChangePassword(e)}
            className="submitBtn"
          >
            Submit
          </button>
        </Modal>
      )}
    </div>
  );
};

export default Profile;
