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
    id_company: "",
    id_store: "",
  });

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
        console.error("Error fetching companies:", error);
        setStoreList([]);
      }
    };
    fetchStore();
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

  const handleStatus = async (userId, currentStatus) => {
    try {
      setLoading(true);

      const newStatus = currentStatus === 0 ? 1 : 0;

      const response = await client.put(`/api/user/${userId}`, {
        status: newStatus === 0 ? 0 : 1,
      });

      console.log("Response from API:", response.data);

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, status: newStatus } : user
        )
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const id_user = localStorage.getItem("id_user");

        if (!id_user) {
          console.error("id_user is missing in localStorage");
          setIsLoading(false);
          return;
        }

        const response = await client.post(
          "/user/listuser",
          { id_user }, // Pass id_user in the request body
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Set the fetched users into state
        setUsers(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleUpdateUser = (user) => {
    setUserToUpdate(user); // Menyimpan Pengguna yang dipilih
    setIsUpdateModalOpen(true);

    console.log(user);
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
        id: userToUpdate._id || "",
        name: userToUpdate.username || "",
        address: userToUpdate.address || "",
        id_company: userToUpdate.id_company || "",
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
        {
          name: userDataUpdate.username,
          address: userDataUpdate.address,
          id_company: userDataUpdate.id_company,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("User updated successfully:", response.data);
      window.location.reload();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

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
              <option disabled selected>
                Best sellers
              </option>
              <option>Ricebowl</option>
              <option>Milkshake</option>
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
          <div className="overflow-x-auto">
            {users.length === 0 ? (
              <h1>Data Pengguna tidak ditemukan!</h1>
            ) : (
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
                  {users.map((user, index) => (
                    <tr key={user._id}>
                      <td>{index + 1}</td>
                      <td>
                        <b>{user.username}</b>
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          className="toggle"
                          checked={user.status === 0}
                          onChange={() => handleStatus(user._id, user.status)}
                        />
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
            <div className="mt-4">
              <p className="font-semibold mb-2">Perusahaan</p>
              <select
                id="company"
                className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={userDataAdd.id_company}
                onChange={(e) =>
                  setUserDataAdd((prevState) => ({
                    ...prevState,
                    id_company: e.target.value,
                  }))
                }
                required
              >
                <option value="" disabled>
                  === Pilih Perusahaan ===
                </option>

                {companyList.length === 0 ? (
                  <option value="default">No companies available</option>
                ) : (
                  companyList.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <p className="font-semibold mt-4 mb-2">Toko</p>
            <select
              id="store"
              className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={userDataAdd.id_store}
              onChange={(e) =>
                setUserDataAdd((prevState) => ({
                  ...prevState,
                  id_store: e.target.value,
                }))
              }
              required
            >
              <option value="" disabled>
                === Pilih Toko ===
              </option>

              {storeList.length === 0 ? (
                <option value="default">No companies available</option>
              ) : (
                storeList.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))
              )}
            </select>
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
            <p className="font-semibold mt-4">Nama Pengguna</p>
            <p className="mb-2 text-sm text-slate-500">
              Include min. 40 characters to make it more interesting
            </p>
            <input
              type="text"
              name="username"
              value={userDataUpdate.username}
              onChange={handleChangeUpdate}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4">Alamat Pengguna</p>
            <p className="mb-2 text-sm text-slate-500">
              Include min. 260 characters to make it easier for buyers to
              understand and find your user
            </p>
            <textarea
              name="address"
              value={userDataUpdate.address}
              onChange={handleChangeUpdate}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4 mb-2">Perusahaan</p>
            <select
              id="company"
              className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={userDataUpdate.id_company}
              onChange={(e) =>
                setUserDataUpdate((prevState) => ({
                  ...prevState,
                  id_company: e.target.value,
                }))
              }
              required
            >
              <option value="" disabled>
                === Pilih User ===
              </option>

              {companyList.length === 0 ? (
                <option value="default">No companies available</option>
              ) : (
                companyList.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.username}
                  </option>
                ))
              )}
            </select>
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
