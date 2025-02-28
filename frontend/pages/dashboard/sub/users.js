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

  const openModalAdd = () => {
    setIsModalOpen(true);
  };

  const closeModalAdd = () => {
    setIsModalOpen(false);
  };
  const openModalUpdate = () => {
    setIsUpdateModalOpen(true);
  };

  const closeModalUpdate = () => {
    setIsUpdateModalOpen(false);
  };

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

  const startIndex = currentPage * itemsPerPage;
  const selectedData = users.slice(startIndex, startIndex + itemsPerPage);

  // const closeModal = () => {
  //   setIsModalOpen(false);
  // };

  if (isLoading) {
    return (
      <div className="w-full h-screen pt-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  return (
    <div className="w-full h-screen pt-16">
      <div className="justify-between w-full bg-white shadow-lg p-4">
        <div className="flex flex-row justify-between">
          <div className="flex flex-col">
            <p className="text-2xl font-bold">Daftar Pengguna</p>
            <p>Detail Daftar Pengguna</p>
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
        <div className="flex flex-row justify-between mt-8">
          <div>
            <select className="select w-full max-w-xs bg-white border-gray-300">
              <option value="">Best sellers</option>
              <option value="">Ricebowl</option>
              <option value="">Milkshake</option>
            </select>
          </div>
          <div>
            <button
              className="button bg-[#FDDC05] text-white p-2 rounded-lg font-bold"
              onClick={openModalAdd}
            >
              + Tambah Pengguna
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          <div>
            {users.length === 0 ? (
              <h1>Data Pengguna tidak ditemukan!</h1>
            ) : (
              <>
              <table className="table w-full border border-gray-300">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Username</th>
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
                      <td>
                        <select
                          className="select bg-white"
                          value={user.status}
                          onChange={(e) =>
                            handleStatusSelect(user._id, Number(e.target.value))
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

      {isModalOpen && (
        <Modal onClose={closeModalAdd} title={"Tambah Pengguna"}>
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
                }))
              }
              required
            >
              <option value="" disabled>
                === Pilih Rule ===
              </option>
              <option key={1} value={1}>
                Superadmin
              </option>
              <option key={2} value={2}>
                Admin
              </option>
              <option key={3} value={3}>
                Manajer
              </option>
              <option key={4} value={4}>
                Kasir
              </option>
            </select>
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
                  .find((opt) => opt.value === userDataAdd.id_company) || null
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
                  .find((opt) => opt.value === userDataAdd.id_store) || null
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
            <div className="flex justify-end mt-5">
              <button
                type="button"
                className="bg-gray-500 text-white p-2 rounded-lg mr-2"
                onClick={closeModalAdd}
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded-lg"
              >
                Tambah
              </button>
            </div>
          </form>
        </Modal>
      )}

      {isUpdateModalOpen && (
        <Modal onClose={closeModalUpdate} title={"Edit Pengguna"}>
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
                setUserDataAdd((prevState) => ({
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

            <p className="font-semibold mt-4 mb-2">Store</p>
            <Select
              id="store"
              name="id_password"
              className="basic-single"
              options={storeList.map((c) => ({
                value: c._id,
                label: c.name,
              }))}
              value={
                storeList
                  .map((c) => ({ value: c._id, label: c.name }))
                  .find((opt) => opt.value === userDataUpdate.id_store) || null
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
            <div className="flex justify-end mt-5">
              <button
                type="button"
                className="bg-gray-500 text-white p-2 rounded-lg mr-2"
                onClick={closeModalUpdate}
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded-lg"
              >
                Edit
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default User;
