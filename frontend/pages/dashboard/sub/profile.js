import React, { useEffect, useState } from "react";

// Icons
import { FaUserEdit, FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { MdOutlineChangeCircle } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";

// Package
import ImageWithFallback from "@/utils/ImageWithFallback";
import { motion } from "framer-motion";
import Loading from "@/components/loading";
import { toast } from "react-toastify";

// Components
import { updateProfile } from "@/libs/fetching/user";
import { getCompanyData } from "@/libs/fetching/company";
import { getStoreData } from "@/libs/fetching/store";
import { uploadImageCompress } from "@/libs/fetching/upload-service";
import { Modal } from "@/components/Modal";
import useUserStore from "@/stores/user-store";
import { ActivateAccount } from "@/components/form/payment/activateAccount";
import Header from "@/components/section/header";

const Profile = () => {
  const { userData } = useUserStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState(null);
  const [userDataUpdate, setUserDataUpdate] = useState({
    id: "",
    username: "",
    password: "",
    rule: "",
    status: "",
    companyName: "",
    storeName: "",
    avatar: "",
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalActivate, setIsModalActivate] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.05, boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.2)" },
    tap: { scale: 0.95 },
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!userData) return;

      try {
        setUserToUpdate(userData);

        // Fetch company and store data only if IDs exist
        const company = userData.id_company
          ? await getCompanyData(userData.id_company)
          : null;
        const store = userData.id_store
          ? await getStoreData(userData.id_store)
          : null;

        // Update user data
        setUserDataUpdate({
          ...userData,
          id: userData.id,
          password: "",
          status: userData.status ?? 1,
          companyName: userData.rule === 1 ? null : company?.name,
          storeName: userData.rule <= 2 ? null : store?.name,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userData]);

  const handleChangeUpdate = (e) => {
    const { name, value } = e.target;
    setUserDataUpdate((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleImageChange = async (e, params) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      let pathPrefix = "";
      switch (params) {
        case "avatar":
          pathPrefix = "user/avatar";
          break;
        default:
          console.error(`Invalid params value: ${params}`);
          return;
      }
      const response = await uploadImageCompress(
        file,
        params,
        pathPrefix,
        userDataUpdate.id
      );

      if (response.status == 201) {
        const uploadedImageUrl = response.data.metadata.fileUrl;
        if (params === "avatar") {
          setUserDataUpdate((prevState) => ({
            ...prevState,
            avatar: uploadedImageUrl,
          }));
        }
        toast.success("Your profile picture has been updated");
      } else {
        toast.error("Upload Failed", response.error, "error");
      }
    } catch (error) {
      toast.error("Compression or upload failed:", error);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (
      !userDataUpdate.username ||
      userDataUpdate.password === "" ||
      repeatPassword === ""
    ) {
      toast.error("Please fill in all required fields!");
      return;
    }

    if (userDataUpdate.password !== repeatPassword) {
      toast.error("Password and repeated password do not match!");
      return;
    }

    const reqBody = {
      username: userDataUpdate.username,
      password: currentPassword,
    };
    try {
      const response = await checkPass(reqBody);

      if (response.status === 200) {
        await handleSubmitUpdate(e);
        toast.success("Your password has been changed successfully");
      } else {
        toast.error("Current password is incorrect!");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Server Error: Password cannot be updated!");
    }
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    if (!userDataUpdate.username) {
      toast.error("Please fill in all required fields!");
      return;
    }

    try {
      const response = await updateProfile(userDataUpdate, userDataUpdate.id);

      toast.success("Profile updated successfully!");

      setCurrentPassword("");
      setRepeatPassword("");
      modalOpen("change", false);
      setUserToUpdate(response.data);
      setIsEditMode(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Profile could not be updated!");
    }
  };

  const modalOpen = (param, bool) => {
    const setters = {
      change: setIsModalOpen,
      activate: setIsModalActivate,
    };
    if (setters[param]) {
      setters[param](bool);
    }
  };

  // Map user roles to their corresponding names
  const ruleMapping = {
    1: "Superadmin",
    2: "Admin",
    3: "Manajer",
    4: "Kasir",
    Guest: "Guest",
  };

  // Determine the role name based on the user's rule
  const userRule = userDataUpdate.rule;
  const userStatus = userDataUpdate.status;

  // Map user roles to their corresponding names
  const statusMapping = {
    0: "Active",
    1: "Pending",
    2: "Inactive",
  };

  // Determine the role name based on the user's status
  const nameRule = ruleMapping[userRule] || "Guest";
  const nameStatus = statusMapping[userStatus] || "-";

  // Role color mapping
  const roleColorMapping = {
    Superadmin:
      "bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-md rounded-md border border-indigo-700",
    Admin:
      "bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium shadow-md rounded-md border border-blue-600",
    Manajer:
      "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-medium shadow-md rounded-md border border-violet-600",
    Kasir:
      "bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-md rounded-md border border-emerald-600",
    Guest:
      "bg-gradient-to-r from-gray-600 to-zinc-600 text-white font-medium shadow-md rounded-md border border-gray-700",
  };

  // Status color mapping
  const statusColorMapping = {
    Active:
      "bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium shadow-md rounded-md border border-green-600",
    Inactive:
      "bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium shadow-md rounded-md border border-red-600",
  };

  if (isLoading === true) {
    return <Loading />;
  }

  return (
    <motion.div
      className="w-full min-h-screen bg-gray-50 pt-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Header
        title="Profile Dashboard"
        subtitle="Manage your personal information"
        isSearch={false}
        isAdd={false}
      />

      {/* Main Content */}
      <motion.div
        className="mx-auto p-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Profile Card */}
        <motion.div
          className="bg-white rounded-xl shadow-lg overflow-hidden mb-6"
          variants={itemVariants}
        >
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6">
            <div className="flex flex-col md:flex-row items-center md:justify-between">
              <div className="flex flex-col md:flex-row items-center mb-4 md:mb-0">
                <motion.div
                  className="upload-container relative mb-4 md:mb-0 md:mr-6"
                  whileHover={{ scale: isEditMode ? 1.05 : 1 }}
                  whileTap={{ scale: isEditMode ? 0.95 : 1 }}
                >
                  <label className="upload-label">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, "avatar")}
                      style={{ display: "none" }}
                      disabled={!isEditMode}
                    />
                    <div
                      className={`relative upload-content flex overflow-hidden w-24 h-24 rounded-full border-2 ${
                        isEditMode
                          ? "border-emerald-500 cursor-pointer group"
                          : "border-gray-200"
                      }`}
                    >
                      {/* Overlay appears only when isEditMode is true */}
                      <motion.div
                        className={`absolute top-0 left-0 w-full h-full rounded-full bg-emerald-500/70 flex items-center justify-center ${
                          isEditMode ? "group-hover:opacity-100" : "hidden"
                        }`}
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                      >
                        <MdOutlineChangeCircle className="w-12 h-12 text-white" />
                      </motion.div>

                      {/* Avatar Image */}
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 100 }}
                        className="w-full h-full flex overflow-hidden"
                      >
                        {userDataUpdate.avatar ? (
                          <ImageWithFallback
                            onError={"https://placehold.co/100x100"}
                            src={userDataUpdate.avatar}
                            alt="Profile"
                            className="uploaded-image object-cover"
                            width={96}
                            height={96}
                          />
                        ) : (
                          <ImageWithFallback
                            onError={"https://placehold.co/100x100"}
                            src="/User-avatar.png"
                            alt="avatar"
                            width={96}
                            height={96}
                            className="object-cover"
                          />
                        )}
                      </motion.div>
                    </div>
                  </label>
                </motion.div>
                <div className="text-center md:text-left">
                  <motion.h1
                    className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {userDataUpdate.username || "NAMA USER"}
                  </motion.h1>
                  <motion.div
                    className="flex flex-wrap justify-center md:justify-start gap-2 mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${roleColorMapping[nameRule]}`}
                    >
                      {nameRule}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${statusColorMapping[nameStatus]}`}
                    >
                      {nameStatus}
                    </span>
                  </motion.div>
                </div>
              </div>
              <div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.button
                    onClick={() => modalOpen("change", true)}
                    className="flex items-center justify-center space-x-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-2 px-4 rounded-lg shadow-md"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    disabled={isEditMode}
                  >
                    <RiLockPasswordLine className="text-lg" />
                    <span>Change Password</span>
                  </motion.button>
                  <motion.button
                    onClick={() => setIsEditMode(true)}
                    className={`flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-2 px-4 rounded-lg shadow-md ${
                      isEditMode ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    variants={buttonVariants}
                    whileHover={!isEditMode ? "hover" : "idle"}
                    whileTap={!isEditMode ? "tap" : "idle"}
                    disabled={isEditMode}
                  >
                    <FaUserEdit className="text-lg" />
                    <span>Edit Profile</span>
                  </motion.button>
                </div>
                {userStatus == 1 && userRule == 2 && (
                  <motion.button
                    onClick={() => modalOpen("activate", true)}
                    className="mt-3 w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 px-4 rounded-lg shadow-md"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    disabled={isEditMode}
                  >
                    <RiLockPasswordLine className="text-lg" />
                    <span>Activate Account</span>
                  </motion.button>
                )}
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <motion.form
            className="p-6"
            onSubmit={handleSubmitUpdate}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <motion.div variants={itemVariants}>
                <label
                  className="block text-gray-700 text-sm font-semibold mb-2"
                  htmlFor="username"
                >
                  Username
                </label>
                <div className="relative">
                  <input
                    className={`shadow-sm appearance-none border rounded-lg w-full py-3 px-4 border-gray-300 bg-white text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                      isEditMode ? "border-emerald-300 bg-emerald-50" : ""
                    }`}
                    placeholder="Username"
                    type="text"
                    name="username"
                    value={userDataUpdate.username || "-"}
                    disabled={!isEditMode}
                    onChange={handleChangeUpdate}
                  />
                  {isEditMode && (
                    <motion.div
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-emerald-500"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <FaUserEdit />
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Company */}
              <motion.div variants={itemVariants}>
                <label
                  className="block text-gray-700 text-sm font-semibold mb-2"
                  htmlFor="company"
                >
                  Perusahaan
                </label>
                <div className="relative">
                  <input
                    className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 border-gray-300 bg-white text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="company"
                    type="text"
                    name="company"
                    value={userDataUpdate.companyName || "-"}
                    disabled={true}
                  />
                </div>
              </motion.div>

              {/* Store */}
              <motion.div variants={itemVariants}>
                <label
                  className="block text-gray-700 text-sm font-semibold mb-2"
                  htmlFor="store"
                >
                  Toko
                </label>
                <div className="relative">
                  <input
                    className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 border-gray-300 bg-white text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="store"
                    type="text"
                    name="store"
                    value={userDataUpdate.storeName || "-"}
                    disabled={true}
                  />
                </div>
              </motion.div>

              {/* Rule */}
              <motion.div variants={itemVariants}>
                <label
                  className="block text-gray-700 text-sm font-semibold mb-2"
                  htmlFor="rule"
                >
                  Rule
                </label>
                <input
                  className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 border-gray-300 bg-white text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="rule"
                  type="text"
                  name="rule"
                  value={nameRule}
                  disabled={true}
                />
              </motion.div>

              {/* Status */}
              <motion.div variants={itemVariants}>
                <label
                  className="block text-gray-700 text-sm font-semibold mb-2"
                  htmlFor="status"
                >
                  Status
                </label>
                <input
                  className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 border-gray-300 bg-white text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="status"
                  type="text"
                  name="status"
                  value={nameStatus}
                  disabled={true}
                />
              </motion.div>
            </div>

            {/* Action Buttons */}
            {isEditMode && (
              <motion.div
                className="flex justify-end space-x-4 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.button
                  type="button"
                  className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-all duration-200"
                  onClick={() => setIsEditMode(false)}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  Update Profile
                </motion.button>
              </motion.div>
            )}
          </motion.form>
        </motion.div>
      </motion.div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => modalOpen("change", false)}
        title="Change Password"
        width="medium"
      >
        <div className="space-y-4">
          <motion.div className="relative" variants={itemVariants}>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 border-gray-300 bg-white text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your current password"
                type={showPassword ? "text" : "password"}
                name="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
              >
                {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
              </button>
            </div>
          </motion.div>

          <motion.div className="relative" variants={itemVariants}>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              New Password
            </label>
            <input
              className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 border-gray-300 bg-white text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter new password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={userDataUpdate.password}
              onChange={handleChangeUpdate}
            />
          </motion.div>

          <motion.div className="relative" variants={itemVariants}>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Confirm New Password
            </label>
            <input
              className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 border-gray-300 bg-white text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Confirm new password"
              type={showPassword ? "text" : "password"}
              name="repeatPassword"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
            />
          </motion.div>

          <motion.div className="mt-8" variants={itemVariants}>
            <motion.button
              type="button"
              onClick={(e) => handleChangePassword(e)}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Update Password
            </motion.button>
          </motion.div>
        </div>

        <motion.div
          className="mt-4 text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p>
            Password must be at least 8 characters and include uppercase,
            lowercase, numbers, and special characters.
          </p>
        </motion.div>
      </Modal>

      <Modal
        isOpen={isModalActivate}
        onClose={() => modalOpen("activate", false)}
        title="Activate Account"
        width="large"
      >
        <ActivateAccount onSubmit={() => modalOpen("activate", false)} />
      </Modal>
    </motion.div>
  );
};

export default Profile;
