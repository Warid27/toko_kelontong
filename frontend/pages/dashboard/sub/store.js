import React, { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import Image from "next/image";
import { MdKeyboardArrowDown } from "react-icons/md";
import client from "@/libs/axios";
import { HiDotsHorizontal } from "react-icons/hi";
import Swal from "sweetalert2";
import { MdDelete } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import { Modal } from "@/components/Modal";
import { LiaCloudUploadAltSolid } from "react-icons/lia";

const StoreData = () => {
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [companyList, setCompanyList] = useState([]); // State for list of companies
  const [openDropdown, setOpenDropdown] = useState(null);
  const [storeToUpdate, setStoreToUpdate] = useState(null); // Untuk menyimpan Toko yang akan diupdate
  const [loading, setLoading] = useState(false); // Untuk loading saat update status

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const [storeDataAdd, setStoreDataAdd] = useState({
    name: "",
    address: "",
    id_company: "",
  });

  const [storeDataUpdate, setStoreDataUpdate] = useState({
    id: "",
    name: "",
    address: "",
    id_company: "",
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

  const handleStatus = async (storeId, currentStatus) => {
    try {
      setLoading(true);

      const newStatus = currentStatus === 0 ? 1 : 0;

      const response = await client.put(`/api/store/${storeId}`, {
        status: newStatus === 0 ? 0 : 1,
      });

      setStores((prevStores) =>
        prevStores.map((store) =>
          store._id === storeId ? { ...store, status: newStatus } : store
        )
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const token = localStorage.getItem("token");
        const id_store = localStorage.getItem("id_store");

        if (!id_store) {
          console.error("id_store is missing in localStorage");
          setIsLoading(false);
          return;
        }

        const response = await client.post(
          "/store/liststore",
          { id_store }, // Pass id_store in the request body
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Set the fetched stores into state
        setStores(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching stores:", error);
        setIsLoading(false);
      }
    };

    fetchStores();
  }, []);

  // UPLOADS

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await client.post("/store/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // Store the image URL in the productData state
        const uploadedImageUrl = response.data.image;
        setStoreDataAdd((prevState) => ({
          ...prevState,
          image: uploadedImageUrl,
        }));

        console.log("Image uploaded successfully:", uploadedImageUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };
  // HANDLE
  const handleUpdateStore = (store) => {
    setStoreToUpdate(store); // Menyimpan Toko yang dipilih
    setIsUpdateModalOpen(true);

    console.log(store);
  };

  const deleteStoreById = async (id) => {
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
        const response = await client.delete(`/api/store/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          Swal.fire("Berhasil", "Toko berhasil dihapus!", "success");
          setStores((prevStores) => prevStores.filter((p) => p._id !== id));
        }
      } catch (error) {
        console.error("Gagal menghapus Toko:", error.message);
        Swal.fire("Gagal", "Toko tidak dapat dihapus!", "error");
      }
    }
  };

  const handleChangeAdd = (e) => {
    const { name, value } = e.target;
    setStoreDataAdd((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      // Ensure all required fields are filled
      if (
        !storeDataAdd.name ||
        !storeDataAdd.address ||
        !storeDataAdd.id_company
      ) {
        alert("Please fill all required fields.");
        return;
      }

      const response = await client.post(
        "/store/addstore",
        {
          name: storeDataAdd.name,
          address: storeDataAdd.address,
          status: 1,
          id_company: storeDataAdd.id_company,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Store added:", response.data);
      Swal.fire("Berhasil", "Toko berhasil ditambahkan!", "success");

      // Reload the page or update state
      closeModalAdd();
      window.location.reload();
    } catch (error) {
      console.error("Error adding store:", error);
    }
  };

  useEffect(() => {
    if (storeToUpdate) {
      setStoreDataUpdate({
        id: storeToUpdate._id || "",
        name: storeToUpdate.name || "",
        address: storeToUpdate.address || "",
        id_company: storeToUpdate.id_company || "",
      });
    }
  }, [storeToUpdate]);

  const handleChangeUpdate = (e) => {
    const { name, value } = e.target;
    setStoreDataUpdate((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    for (const key in storeDataUpdate) {
      formData.append(key, storeDataUpdate[key]);
    }

    try {
      // const storeId = "67a9615bf59ec80d10014871";
      const token = localStorage.getItem("token");
      const response = await client.put(
        `/api/store/${storeDataUpdate.id}`,
        {
          name: storeDataUpdate.name,
          address: storeDataUpdate.address,
          id_company: storeDataUpdate.id_company,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Store updated successfully:", response.data);
      window.location.reload();
    } catch (error) {
      console.error("Error updating store:", error);
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
            <p className="text-2xl font-bold">Daftar Toko</p>
            <p>Detail Daftar Toko</p>
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
              + Tambah Toko
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          <div className="overflow-x-auto">
            {stores.length === 0 ? (
              <h1>Data Toko tidak ditemukan!</h1>
            ) : (
              <table className="table w-full border border-gray-300">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Toko</th>
                    <th>Alamat</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map((store, index) => (
                    <tr key={store._id}>
                      <td>{index + 1}</td>
                      <td>
                        <b>{store.name}</b>
                      </td>
                      <td>{store.address}</td>
                      <td>
                        <input
                          type="checkbox"
                          className="toggle"
                          checked={store.status === 0}
                          onChange={() => handleStatus(store._id, store.status)}
                        />
                      </td>
                      <td className="flex space-x-4">
                        {" "}
                        {/* Beri jarak antar tombol */}
                        <button
                          className=" p-3 rounded-lg text-2xl "
                          onClick={() => deleteStoreById(store._id)}
                        >
                          <MdDelete />
                        </button>
                        <button
                          className=" p-3 rounded-lg text-2xl "
                          onClick={() => handleUpdateStore(store)}
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
        <Modal onClose={closeModalAdd} title={"Tambah Toko"}>
          <form onSubmit={handleSubmitAdd}>
            <p className="font-semibold mt-4">Ikon Toko</p>
            <div className="upload-container">
              <label className="upload-label">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
                <div className="upload-content">
                  {storeDataAdd.image ? (
                    <Image
                      src={storeDataAdd.image}
                      alt="Uploaded"
                      className="uploaded-image"
                      width={80}
                      height={80}
                    />
                  ) : (
                    <div className="bg-[#F8FAFC] w-28 rounded-lg p-3 flex flex-col items-center justify-center">
                      <div className="icon-container flex flex-col items-center">
                        <LiaCloudUploadAltSolid className="text-5xl text-[#FDDC05]" />
                        <p className="text-sm text-[#FDDC05]">New Image</p>
                      </div>
                    </div>
                  )}
                </div>
              </label>
            </div>
            <p className="font-semibold mt-4">Nama Toko</p>
            <p className="mb-2 text-sm text-slate-500">
              Include min. 40 characters to make it more interesting
            </p>
            <input
              type="text"
              name="name"
              value={storeDataAdd.name}
              onChange={handleChangeAdd}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4">Alamat Toko</p>
            <p className="mb-2 text-sm text-slate-500">
              Include min. 260 characters to make it easier for buyers to
              understand and find your store
            </p>
            <textarea
              name="address"
              value={storeDataAdd.address}
              onChange={handleChangeAdd}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4 mb-2">Perusahaan</p>
            <select
              id="company"
              className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={storeDataAdd.id_company}
              onChange={(e) =>
                setStoreDataAdd((prevState) => ({
                  ...prevState,
                  id_company: e.target.value,
                }))
              }
              required
            >
              <option value="" disabled>
                === Pilih Store ===
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
        <Modal onClose={closeModalUpdate} title={"Edit Toko"}>
          <form onSubmit={handleSubmitUpdate}>
            <p className="font-semibold mt-4">Nama Toko</p>
            <p className="mb-2 text-sm text-slate-500">
              Include min. 40 characters to make it more interesting
            </p>
            <input
              type="text"
              name="name"
              value={storeDataUpdate.name}
              onChange={handleChangeUpdate}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4">Alamat Toko</p>
            <p className="mb-2 text-sm text-slate-500">
              Include min. 260 characters to make it easier for buyers to
              understand and find your store
            </p>
            <textarea
              name="address"
              value={storeDataUpdate.address}
              onChange={handleChangeUpdate}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4 mb-2">Perusahaan</p>
            <select
              id="company"
              className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={storeDataUpdate.id_company}
              onChange={(e) =>
                setStoreDataUpdate((prevState) => ({
                  ...prevState,
                  id_company: e.target.value,
                }))
              }
              required
            >
              <option value="" disabled>
                === Pilih Store ===
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

export default StoreData;
