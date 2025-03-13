import React, { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { FaUserEdit, FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import Image from "next/image";
import { MdKeyboardArrowDown } from "react-icons/md";
import client from "@/libs/axios";
import { HiDotsHorizontal } from "react-icons/hi";
import Swal from "sweetalert2";
import { MdDelete } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import { Modal } from "@/components/Modal";
import Select from "react-select";
import { fetchCompanyList } from "@/libs/fetching/company";
import { fetchStoreList } from "@/libs/fetching/store";
import { fetchUserList } from "@/libs/fetching/user";
import ReactPaginate from "react-paginate";
import Header from "@/components/section/header";
import { SubmitButton } from "@/components/form/button";
import { CloseButton } from "@/components/form/button";

const User = () => {
  const [showPassword, setShowPassword] = useState(false); // State for showing password
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [companyList, setCompanyList] = useState([]); // State for list of companies
  const [ruleList, setRuleList] = useState([]); // State for list of companies
  const [storeList, setStoreList] = useState([]); // State for list of companies
  const [openDropdown, setOpenDropdown] = useState(null);
  const [userToUpdate, setUserToUpdate] = useState(null); // Untuk menyimpan Pengguna yang akan diupdate
  const [loading, setLoading] = useState(false); // Untuk loading saat update status
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const [userDataAdd, setUserDataAdd] = useState({
    username: "",
    password: "",
    rule: "",
    id_company: "",
    id_store: "",
  });

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
    const fetching_requirement = async () => {
      const get_user_list = async () => {
        const data_user = await fetchUserList();
        setUsers(data_user);
        setIsLoading(false);
      };
      const get_company_list = async () => {
        const data_company = await fetchCompanyList();
        setCompanyList(data_company);
        setIsLoading(false);
      };
      const get_store_list = async () => {
        const data_store = await fetchStoreList();
        setStoreList(data_store);
        setIsLoading(false);
      };

      get_user_list();
      get_company_list();
      get_store_list();
    };
    fetching_requirement();
  }, []);

  const handleStatusSelect = async (userId, selectedStatus) => {
    try {
      setLoading(true);

      const response = await client.put(`/api/user/${userId}`, {
        status: selectedStatus,
      });

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, status: selectedStatus } : user
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const modalOpen = (param, bool) => {
    const setters = {
      add: setIsModalOpen,
      update: setIsUpdateModalOpen,
    };
    if (setters[param]) {
      setters[param](bool);
    }
  };

  const handleUpdateUser = (user) => {
    setUserToUpdate(user); // Menyimpan Pengguna yang dipilih
    setIsUpdateModalOpen(true);
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
        const token = localStorage.getItem("token");
        const response = await client.delete(`/api/user/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          Swal.fire("Berhasil", "Pengguna berhasil dihapus!", "success");
          setUsers((prevUsers) => prevUsers.filter((p) => p._id !== id));
        }
      } catch (error) {
        console.error("Gagal menghapus Pengguna:", error.message);
        Swal.fire("Gagal", "Pengguna tidak dapat dihapus!", "error");
      }
    }
  };

  const handleChangeAdd = (e) => {
    const { name, value } = e.target;
    setUserDataAdd((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      // Ensure all required fields are filled
      if (!userDataAdd.username || !userDataAdd.password || !userDataAdd.rule) {
        alert("Please fill all required fields.");
        return;
      }

      const response = await client.post(
        "/user/adduser",
        {
          username: userDataAdd.username,
          password: userDataAdd.password,
          status: 1,
          rule: userDataAdd.rule,
          id_company: userDataAdd.id_company,
          id_store: userDataAdd.id_store,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("User added:", response.data);
      Swal.fire("Berhasil", "Pengguna berhasil ditambahkan!", "success");

      // Reload the page or update state
      closeModalAdd();
      window.location.reload();
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

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

    const formData = new FormData();
    for (const key in userDataUpdate) {
      formData.append(key, userDataUpdate[key]);
    }

    try {
      // const userId = "67a9615bf59ec80d10014871";
      const token = localStorage.getItem("token");
      const response = await client.put(
        `/api/user/${userDataUpdate.id}`,
        userDataUpdate,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("User updated successfully:", response.data);
      window.location.reload();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const filteredUserList = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startIndex = currentPage * itemsPerPage;
  const selectedData = filteredUserList.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const roleLabels = {
    1: "Superadmin",
    2: "Admin",
    3: "Manajer",
    4: "Kasir",
    5: "Pelanggan",
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen pt-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
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
          <div>
            {filteredUserList.length === 0 ? (
              <h1>Data Pengguna tidak ditemukan!</h1>
            ) : (
              <>
                <table className="table w-full border border-gray-300">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Username</th>
                      <th>Rule</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedData.map((user, index) => (
                      <tr key={user._id}>
                        <td>{startIndex + index + 1}</td>
                        <td>
                          <b>{user.username}</b>
                        </td>
                        <td>{roleLabels[user.rule] || "-"}</td>
                        <td>
                          <select
                            className="select bg-white"
                            value={user.status}
                            onChange={(e) =>
                              handleStatusSelect(
                                user._id,
                                Number(e.target.value)
                              )
                            }
                          >
                            <option value={0}>Active</option>
                            <option value={1}>Inactive</option>
                            {/* Tambahkan opsi lain jika diperlukan di masa depan */}
                          </select>
                        </td>
                        <td>
                          <button
                            className=" p-3 rounded-lg text-2xl "
                            onClick={() => deleteUserById(user._id)}
                          >
                            <MdDelete />
                          </button>
                          <button
                            className=" p-3 rounded-lg text-2xl "
                            onClick={() => handleUpdateUser(user)}
                          >
                            <FaRegEdit />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <ReactPaginate
                  previousLabel={"← Prev"}
                  nextLabel={"Next →"}
                  pageCount={Math.ceil(users.length / itemsPerPage)}
                  onPageChange={({ selected }) => setCurrentPage(selected)}
                  containerClassName={"flex gap-2 justify-center mt-4"}
                  pageLinkClassName={"border px-3 py-1"}
                  previousLinkClassName={"border px-3 py-1"}
                  nextLinkClassName={"border px-3 py-1"}
                  activeClassName={"bg-blue-500 text-white"}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => modalOpen("add", false)}
        title="Tambah User"
      >
          <form onSubmit={handleSubmitAdd}>
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
              <label className="font-semibold" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  className="border rounded-md p-2 w-full bg-white"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={userDataAdd.password}
                  onChange={handleChangeAdd}
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
            <select
              id="rule"
              className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={userDataAdd.rule}
              onChange={(e) =>
                setUserDataAdd((prevState) => ({
                  ...prevState,
                  rule: e.target.value,
                  id_company: "", // Reset when changing rule
                  id_store: "", // Reset when changing rule
                }))
              }
              required
            >
              <option value="" disabled>
                === Pilih Rule ===
              </option>
              <option key={1} value="1">
                Superadmin
              </option>
              <option key={2} value="2">
                Admin
              </option>
              <option key={3} value="3">
                Manajer
              </option>
              <option key={4} value="4">
                Kasir
              </option>
              <option key={5} value="5">
                Pelanggan
              </option>
            </select>
            {userDataAdd.rule !== "1" && (
              <>
                <p className="font-semibold mt-4 mb-2">Company</p>
                <Select
                  id="company"
                  className="basic-single"
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
                  onChange={(selectedOption) =>
                    setUserDataAdd((prevState) => ({
                      ...prevState,
                      id_company: selectedOption ? selectedOption.value : "",
                    }))
                  }
                  isSearchable
                  required
                  placeholder="Pilih Company..."
                  noOptionsMessage={() => "No Company available"}
                />

                {userDataAdd.rule !== "2" && (
                  <>
                    <p className="font-semibold mt-4 mb-2">Store</p>
                    <Select
                      id="store"
                      className="basic-single"
                      options={storeList.map((c) => ({
                        value: c._id,
                        label: c.name,
                      }))}
                      value={
                        storeList
                          .map((c) => ({ value: c._id, label: c.name }))
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
                      required
                      placeholder="Pilih Store..."
                      noOptionsMessage={() => "No Store available"}
                    />
                  </>
                )}
              </>
            )}

            <div className="flex justify-end mt-5">
            <CloseButton onClick={() => modalOpen("add", false)}/>
            <SubmitButton/>
            </div>
          </form>
        </Modal>

        <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => modalOpen("update", false)}
        title={`Edit User`}
      >
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
              <label className="font-semibold" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  className="border rounded-md p-2 w-full bg-white"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={userDataUpdate.password} // he le
                  onChange={handleChangeUpdate}
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
            <select
              id="rule"
              name="rule"
              className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={userDataUpdate.rule}
              onChange={(e) =>
                setUserDataUpdate((prevState) => ({
                  ...prevState,
                  rule: e.target.value,
                }))
              }
              required
            >
              <option value="" disabled>
                === Pilih Rule ===
              </option>
              <option key={1} value={"1"}>
                Superadmin
              </option>
              <option key={2} value={"2"}>
                Admin
              </option>
              <option key={3} value={"3"}>
                Manajer
              </option>
              <option key={4} value={"4"}>
                Kasir
              </option>
            </select>
            {userDataUpdate.rule !== "1" && (
              <>
                <p className="font-semibold mt-4 mb-2">Company</p>
                <Select
                  id="company"
                  name="id_company"
                  className="basic-single"
                  options={companyList.map((c) => ({
                    value: c._id,
                    label: c.name,
                  }))}
                  value={
                    companyList
                      .map((c) => ({ value: c._id, label: c.name }))
                      .find((opt) => opt.value === userDataUpdate.id_company) ||
                    null
                  }
                  onChange={(selectedOption) =>
                    setUserDataUpdate((prevState) => ({
                      ...prevState,
                      id_company: selectedOption ? selectedOption.value : "",
                    }))
                  }
                  isSearchable
                  required
                  placeholder="Pilih Company..."
                  noOptionsMessage={() => "No Company available"}
                />

                {userDataUpdate.rule !== "2" && (
                  <>
                    <p className="font-semibold mt-4 mb-2">Store</p>
                    <Select
                      id="store"
                      name="id_store"
                      className="basic-single"
                      options={storeList.map((c) => ({
                        value: c._id,
                        label: c.name,
                      }))}
                      value={
                        storeList
                          .map((c) => ({ value: c._id, label: c.name }))
                          .find(
                            (opt) => opt.value === userDataUpdate.id_store
                          ) || null
                      }
                      onChange={(selectedOption) =>
                        setUserDataUpdate((prevState) => ({
                          ...prevState,
                          id_store: selectedOption ? selectedOption.value : "",
                        }))
                      }
                      isSearchable
                      required
                      placeholder="Pilih Store..."
                      noOptionsMessage={() => "No Store available"}
                    />
                  </>
                )}
              </>
            )}

            <div className="flex justify-end mt-5">
            <CloseButton onClick={() => modalOpen("update", false)}/>
            <SubmitButton/>
            </div>
          </form>
        </Modal>
    </div>
  );
};

export default User;
