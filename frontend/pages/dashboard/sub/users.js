import React, { useEffect, useState } from "react";
import { FaRegEye, FaRegEyeSlash, FaInfoCircle } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Image from "next/image";
import Table from "@/components/form/table";
import { Modal } from "@/components/Modal";
import Select from "react-select";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Header from "@/components/section/header";
import { SubmitButton, CloseButton } from "@/components/form/button";
import ImageUpload from "@/components/form/uploadImage"; // Assuming this exists
import client from "@/libs/axios";
import { fetchCompanyList } from "@/libs/fetching/company";
import { fetchStoreList } from "@/libs/fetching/store";
import {
  fetchUserList,
  addUserData,
  updateUserData,
  deleteUser,
} from "@/libs/fetching/user";
import { uploadImageCompress } from "@/libs/fetching/upload-service"; // Assuming this exists
import Loading from "@/components/loading";

const User = ({ userData }) => {
  const statusUser = userData?.status;
  const ruleUser = userData?.rule;
  const usernameUser = userData?.username;
  const id_company = userData?.id_company;

  const [showPassword, setShowPassword] = useState(false);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [companyList, setCompanyList] = useState([]);
  const [companyID, setCompanyID] = useState(null);
  const [storeList, setStoreList] = useState([]);
  const [userToUpdate, setUserToUpdate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState("Info"); // For update modal tabs

  const [userDataAdd, setUserDataAdd] = useState({
    username: "",
    password: "",
    rule: "",
    id_company: "",
    id_store: "",
    avatar: "", // Added for image upload
  });

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

  const statusOptions = [
    { value: 0, label: "Active" },
    { value: 1, label: "Pending" },
    { value: 2, label: "Inactive" },
  ];

  const ruleList = [
    { value: 1, label: "Superadmin" },
    { value: 2, label: "Admin" },
    { value: 3, label: "Manajer" },
    { value: 4, label: "Kasir" },
    { value: 5, label: "Customer" },
  ];
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [usersData, companiesData] = await Promise.all([
          fetchUserList(),
          fetchCompanyList(),
        ]);

        // Filter users
        const filteredUsers = usersData
          .filter((ud) =>
            id_company !== "" && ruleUser !== 1
              ? ud.id_company === id_company
              : true
          )
          .filter((d) => d.username !== usernameUser);

        setUsers(filteredUsers);
        setCompanyList(companiesData);
      } catch (error) {
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [ruleUser, usernameUser, id_company]);

  useEffect(() => {
    if (!companyID) return; // Prevent unnecessary API calls

    const fetchStore = async () => {
      try {
        const storesData = await fetchStoreList(companyID);
        setStoreList(storesData);
      } catch (error) {
        toast.error("Failed to load store");
      }
    };
    fetchStore();
  }, [companyID]);

  const handleStatusSelect = async (userId, selectedStatus) => {
    try {
      setLoading(true);
      reqBody = { status: selectedStatus };
      const response = await updateUserData(reqBody, userId);

      if (response.status === 200) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, status: selectedStatus } : user
          )
        );
        toast.success("Status updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const getRuleLabel = (value) => {
    const rule = ruleList.find((r) => r.value === value);
    return rule ? rule.label : "-";
  };

  const ExportHeaderTable = [
    { label: "No", key: "no" },
    { label: "Avatar", key: "avatar" },
    { label: "Username", key: "username" },
    { label: "Rule", key: "rule" },
    { label: "Status", key: "status" },
  ];

  const HeaderTable = [
    {
      label: "Avatar",
      key: "avatar",
      render: (value) => (
        <div className="flex justify-center items-center overflow-hidden w-12 h-12 rounded-full mx-auto">
          <Image
            src={value || "/default-avatar.png"} // Fallback image
            alt="Avatar"
            width={192}
            height={192}
            className="object-cover w-full h-full"
          />
        </div>
      ),
    },
    { label: "Username", key: "username" },
    { label: "Rule", key: "rule", render: (value) => getRuleLabel(value) },
    {
      key: "status",
      label: "Status",
      render: (value, row) => (
        <select
          className="bg-white border border-green-300 p-2 rounded-lg shadow-xl focus:ring focus:ring-green-300 cursor-pointer"
          value={value}
          onChange={(e) => handleStatusSelect(row._id, Number(e.target.value))}
          disabled={statusUser === 1}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ),
    },
  ];

  const actions = [
    {
      icon: <MdDelete size={20} />,
      onClick: (row) => deleteUserById(row._id),
      className: "bg-red-500 hover:bg-red-600",
    },
    {
      icon: <FaInfoCircle size={20} />,
      onClick: (row) => handleUpdateUser(row),
      className: "bg-blue-500 hover:bg-blue-600",
    },
  ];

  const filteredUserList = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const modalOpen = (param, bool) => {
    const setters = { add: setIsModalOpen, update: setIsUpdateModalOpen };
    setters[param]?.(bool);
  };

  const handleUpdateUser = (user) => {
    setUserToUpdate(user);
    setOpenMenu("Info");
    modalOpen("update", true);
  };

  const deleteUserById = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    });

    if (result.isConfirmed) {
      try {
        const response = await deleteUser(id);
        if (response.status === 200) {
          toast.success("User deleted successfully");
          setUsers((prevUsers) => prevUsers.filter((p) => p._id != id));
        }
      } catch (error) {
        toast.error("Failed to delete user");
      }
    }
  };

  const handleChangeAdd = (e) => {
    const { name, value } = e.target;
    setUserDataAdd((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    if (!userDataAdd.username || !userDataAdd.password || !userDataAdd.rule) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      // Convert empty strings to null
      const reqBody = Object.fromEntries(
        Object.entries(userDataAdd).filter(
          ([_, value]) => value != "" && value != null
        )
      );

      if (userDataAdd.rule == "1" || userDataAdd.rule == "5") {
        reqBody.id_company = null;
        reqBody.id_store = null;
      }

      reqBody.status = 1;

      const response = await addUserData(reqBody);
      if (response.status === 201) {
        toast.success("User added successfully");
        setUsers((prevUsers) => [...prevUsers, response.data]);
        modalOpen("add", false);
        setUserDataAdd({
          username: "",
          password: "",
          rule: "",
          id_company: "",
          id_store: "",
          avatar: "",
        });
      }
    } catch (error) {
      toast.error("Failed to add user");
    }
  };

  useEffect(() => {
    if (userToUpdate) {
      setUserDataUpdate({
        id: userToUpdate._id || "",
        username: userToUpdate.username || "",
        password: "",
        rule: userToUpdate.rule || "",
        status: userToUpdate.status ?? 1,
        id_company: userToUpdate.id_company || "",
        id_store: userToUpdate.id_store || "",
        avatar: userToUpdate.avatar || "",
      });
    }
  }, [userToUpdate]);

  const handleChangeUpdate = (e) => {
    const { name, value } = e.target;
    setUserDataUpdate((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    try {
      const reqBody = { ...userDataUpdate };

      if (reqBody.rule == "1" || reqBody.rule == "5") {
        reqBody.id_company = null;
        reqBody.id_store = null;
      }

      const response = await updateUserData(reqBody, userDataUpdate.id);

      if (response.status === 200) {
        toast.success("User updated successfully");
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userDataUpdate.id ? response.data : user
          )
        );
        modalOpen("update", false);
      }
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const response = await uploadImageCompress(file, "user", "user/avatar");
      const uploadedImageUrl = response.data.metadata.shortenedUrl;
      setUserDataAdd((prevState) => ({
        ...prevState,
        avatar: uploadedImageUrl,
      }));
    } catch (error) {
      toast.error("Failed to upload avatar");
    }
  };

  if (isLoading === true) {
    return <Loading />;
  }

  return (
    <div className="w-full h-screen pt-16">
      <Header
        title="Daftar User"
        subtitle="Detail Daftar User"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        modalOpen={modalOpen}
        isSearch={true}
        isAdd={true}
      />

      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          {filteredUserList.length === 0 ? (
            <h1>Data Pengguna tidak ditemukan!</h1>
          ) : (
            <Table
              ruleList={ruleList}
              ExportHeaderTable={ExportHeaderTable}
              columns={HeaderTable}
              data={filteredUserList}
              actions={actions}
              statusOptions={statusOptions}
              fileName="DATA PENGGUNA"
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => modalOpen("add", false)}
        title="Tambah User"
        width="medium"
      >
        <form onSubmit={handleSubmitAdd}>
          <p className="font-semibold mt-4">Avatar</p>
          <ImageUpload
            image={userDataAdd.avatar}
            onImageChange={handleImageChange}
            params="add"
          />
          <p className="font-semibold mt-4">Username</p>
          <input
            type="text"
            name="username"
            value={userDataAdd.username}
            onChange={handleChangeAdd}
            className="border rounded-md p-2 w-full bg-white"
            required
          />
          <div className="mt-4">
            <label className="font-semibold">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={userDataAdd.password}
                onChange={handleChangeAdd}
                className="border rounded-md p-2 w-full bg-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
              >
                {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
              </button>
            </div>
          </div>
          <p className="font-semibold mt-4 mb-2">Rule</p>
          <Select
            options={ruleList.filter((rl) =>
              ruleUser != 1 ? rl.value != 1 && rl.value != 5 : rl
            )}
            value={
              ruleList.find((opt) => opt.value === Number(userDataAdd.rule)) ||
              null
            }
            onChange={(selectedOption) =>
              setUserDataAdd((prevState) => ({
                ...prevState,
                rule: selectedOption ? selectedOption.value : "",
                id_company: "",
                id_store: "",
              }))
            }
            isSearchable
            placeholder="Pilih Rule..."
            required
          />
          {userDataAdd.rule &&
            userDataAdd.rule != "1" &&
            userDataAdd.rule != "5" && (
              <>
                <p className="font-semibold mt-4 mb-2">Company</p>
                <Select
                  options={companyList.map((c) => ({
                    value: c._id,
                    label: c.name,
                  }))}
                  value={
                    companyList
                      .map((c) => ({ value: c._id, label: c.name }))
                      .find((opt) => opt.value === userDataAdd.id_company) ||
                    null
                  }
                  onChange={(selectedOption) => {
                    setCompanyID(
                      setUserDataAdd.id_company
                        ? setUserDataAdd.id_company
                        : selectedOption
                        ? selectedOption.value
                        : null
                    );
                    setUserDataAdd((prevState) => ({
                      ...prevState,
                      id_company: selectedOption ? selectedOption.value : "",
                    }));
                  }}
                  isSearchable
                  placeholder="Pilih Company..."
                />
                {userDataAdd.rule != "2" && companyID != null && (
                  <>
                    <p className="font-semibold mt-4 mb-2">Store</p>
                    <Select
                      options={storeList.map((s) => ({
                        value: s._id,
                        label: s.name,
                      }))}
                      value={
                        storeList
                          .map((s) => ({ value: s._id, label: s.name }))
                          .find((opt) => opt.value === userDataAdd.id_store) ||
                        null
                      }
                      onChange={(selectedOption) =>
                        setUserDataAdd((prevState) => ({
                          ...prevState,
                          id_store: selectedOption ? selectedOption.value : "",
                        }))
                      }
                      isSearchable
                      placeholder="Pilih Store..."
                    />
                  </>
                )}
              </>
            )}
          <div className="flex justify-end mt-5">
            <CloseButton onClick={() => modalOpen("add", false)} />
            <SubmitButton />
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => modalOpen("update", false)}
        title={`Edit User - ${openMenu}`}
      >
        {/* Add tabbed navigation */}
        <div className="flex flex-row mb-5">
          <button
            onClick={() => setOpenMenu("Info")}
            className={`p-2 ${
              openMenu === "Info" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Info
          </button>
          <button
            onClick={() => setOpenMenu("Avatar")}
            className={`p-2 ${
              openMenu === "Avatar" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Avatar
          </button>
        </div>

        {openMenu === "Info" ? (
          <form onSubmit={handleSubmitUpdate}>
            <p className="font-semibold mt-4">Username</p>
            <input
              type="text"
              name="username"
              value={userDataUpdate.username}
              onChange={handleChangeUpdate}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <div className="mt-4">
              <label className="font-semibold">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={userDataUpdate.password}
                  onChange={handleChangeUpdate}
                  className="border rounded-md p-2 w-full bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                >
                  {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                </button>
              </div>
            </div>
            <p className="font-semibold mt-4 mb-2">Rule</p>
            <Select
              options={ruleList.filter((rl) =>
                ruleUser != 1 ? rl.value != 1 && rl.value != 5 : rl
              )}
              value={
                ruleList.find(
                  (opt) => opt.value === Number(userDataUpdate.rule)
                ) || null
              }
              onChange={(selectedOption) =>
                setUserDataUpdate((prevState) => ({
                  ...prevState,
                  rule: selectedOption ? selectedOption.value : "",
                }))
              }
              isSearchable
              placeholder="Pilih Rule..."
              required
            />
            {userDataUpdate.rule &&
              userDataUpdate.rule != "1" &&
              userDataUpdate.rule != "5" && (
                <>
                  <p className="font-semibold mt-4 mb-2">Company</p>
                  <Select
                    options={companyList.map((c) => ({
                      value: c._id,
                      label: c.name,
                    }))}
                    value={
                      companyList
                        .map((c) => ({ value: c._id, label: c.name }))
                        .find(
                          (opt) => opt.value === userDataUpdate.id_company
                        ) || null
                    }
                    onChange={(selectedOption) => {
                      setCompanyID(
                        userDataUpdate.id_company
                          ? userDataUpdate.id_company
                          : selectedOption
                          ? selectedOption.value
                          : null
                      );
                      setUserDataUpdate((prevState) => ({
                        ...prevState,
                        id_company: selectedOption ? selectedOption.value : "",
                      }));
                    }}
                    isSearchable
                    placeholder="Pilih Company..."
                  />
                  {userDataUpdate.rule != "2" && companyID != null && (
                    <>
                      <p className="font-semibold mt-4 mb-2">Store</p>
                      <Select
                        options={storeList.map((s) => ({
                          value: s._id,
                          label: s.name,
                        }))}
                        value={
                          storeList
                            .map((s) => ({ value: s._id, label: s.name }))
                            .find(
                              (opt) => opt.value === userDataUpdate.id_store
                            ) || null
                        }
                        onChange={(selectedOption) =>
                          setUserDataUpdate((prevState) => ({
                            ...prevState,
                            id_store: selectedOption
                              ? selectedOption.value
                              : "",
                          }))
                        }
                        isSearchable
                        placeholder="Pilih Store..."
                      />
                    </>
                  )}
                </>
              )}
            <div className="flex justify-end mt-5">
              <CloseButton onClick={() => modalOpen("update", false)} />
              <SubmitButton />
            </div>
          </form>
        ) : (
          <div>
            <p className="font-semibold mt-4">Avatar</p>
            <ImageUpload
              image={userDataUpdate.avatar}
              onImageChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  const response = await uploadImageCompress(
                    file,
                    "user",
                    "user/avatar"
                  );
                  const url = response.data.metadata.shortenedUrl;
                  setUserDataUpdate((prev) => ({ ...prev, avatar: url }));
                }
              }}
              params="update"
            />
            <div className="flex justify-end mt-5">
              <CloseButton onClick={() => modalOpen("update", false)} />
              <SubmitButton onClick={handleSubmitUpdate} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default User;
