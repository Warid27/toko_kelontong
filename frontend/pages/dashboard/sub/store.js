import React, { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import Image from "next/image";
import { MdKeyboardArrowDown } from "react-icons/md";
import client from "@/libs/axios";
import { HiDotsHorizontal } from "react-icons/hi";
import Swal from "sweetalert2";
import { MdDelete } from "react-icons/md";
import { FaRegEdit, FaImage, FaInfoCircle } from "react-icons/fa";
import { Modal } from "@/components/Modal";
import { LiaCloudUploadAltSolid } from "react-icons/lia";
import Select from "react-select";

const StoreData = () => {
  // --- useState
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [companyList, setCompanyList] = useState([]); // State for list of companies
  const [openDropdown, setOpenDropdown] = useState(null);
  const [storeToUpdate, setStoreToUpdate] = useState(null); // Untuk menyimpan Toko yang akan diupdate
  const [loading, setLoading] = useState(false); // Untuk loading saat update status

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);

  const [storeDataAdd, setStoreDataAdd] = useState({
    name: "",
    address: "",
    id_company: "",
    icon: null,
    banner: null,
  });

  const [storeDataUpdate, setStoreDataUpdate] = useState({
    id: "",
    name: "",
    address: "",
    id_company: "",
    icon: null,
    banner: null,
  });

  // --- useEffect
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

  useEffect(() => {
    if (storeToUpdate) {
      setStoreDataUpdate({
        id: storeToUpdate._id || "",
        name: storeToUpdate.name || "",
        address: storeToUpdate.address || "",
        id_company: storeToUpdate.id_company || "",
        icon: storeToUpdate.icon || "",
        banner: storeToUpdate.banner || "",
      });
    }
  }, [storeToUpdate]);

  // --- Function
  const modalOpen = (param, bool) => {
    const setters = {
      add: setIsModalOpen,
      update: setIsUpdateModalOpen,
      banner: setIsBannerModalOpen,
    };
    if (setters[param]) {
      setters[param](bool);
    }
  };

  // UPLOADS
  const handleImageChange = async (e, params) => {
    const file = e.target.files[0];
    if (file) {
      const id_user = localStorage.getItem("id_user");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("id_user", id_user);

      let pathPrefix = "";
      if (params == "add" || params == "update") {
        pathPrefix = "store/icon";
      } else if (params == "banner") {
        pathPrefix = "store/banner";
      } else {
        console.error("Error uploading image:", error);
      }
      formData.append("pathPrefix", pathPrefix); // Append the pathPrefix

      try {
        const response = await client.post("/api/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        const uploadedImageUrl = response.data.metadata.shortenedUrl;
        if (params == "add") {
          setStoreDataAdd((prevState) => ({
            ...prevState,
            icon: uploadedImageUrl,
          }));
        } else if (params == "update") {
          setStoreDataUpdate((prevState) => ({
            ...prevState,
            icon: uploadedImageUrl,
          }));
        } else if (params == "banner") {
          setStoreDataUpdate((prevState) => ({
            ...prevState,
            banner: uploadedImageUrl,
          }));
        } else {
          console.error("Error uploading image:", error);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  // HANDLE

  const handleStatusSelect = async (storeId, selectedStatus) => {
    try {
      setLoading(true);

      const response = await client.put(`/api/store/${storeId}`, {
        status: selectedStatus,
      });

      setStores((prevStores) =>
        prevStores.map((store) =>
          store._id === storeId ? { ...store, status: selectedStatus } : store
        )
      );
    } finally {
      setLoading(false);
    }
  };
  const handleUpdateStore = (store, params) => {
    setStoreToUpdate(store); // Menyimpan Toko yang dipilih
    if (params) {
      modalOpen(params, true);
    } else {
      console.error("PARAMS HANDLE UPDATE NOT DEFINED");
    }
  };

  const handleDeleteStore = async (id) => {
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
          icon: storeDataAdd.icon,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Swal.fire("Berhasil", "Toko berhasil ditambahkan!", "success");

      modalOpen("add", false);
      setStores((prevStores) => [...prevStores, response.data]);
    } catch (error) {
      console.error("Error adding store:", error);
    }
  };

  const handleChangeUpdate = (e) => {
    const { name, value } = e.target;
    setStoreDataUpdate((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmitUpdate = async (e, params) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      // Ensure all required fields are filled
      if (
        !storeDataUpdate.name ||
        !storeDataUpdate.address ||
        !storeDataUpdate.id_company
      ) {
        alert("Please fill all required fields.");
        return;
      }

      // Make the API call to update the store
      const response = await client.put(
        `/api/store/${storeDataUpdate.id}`,
        {
          name: storeDataUpdate.name,
          address: storeDataUpdate.address,
          id_company: storeDataUpdate.id_company,
          icon: storeDataUpdate.icon,
          banner: storeDataUpdate.banner,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Show success message
      Swal.fire("Berhasil", "Toko berhasil diperbarui!", "success");

      modalOpen(params, false);
      // Update the stores state with the updated store
      setStores((prevStores) =>
        prevStores.map((store) =>
          store._id === storeDataUpdate.id ? response.data : store
        )
      );
    } catch (error) {
      console.error("Error updating store:", error);

      // Show error message to the user
      Swal.fire("Error", "Failed to update store. Please try again.", "error");
    }
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
            <button className="addBtn" onClick={() => modalOpen("add", true)}>
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
                        <select
                          className="select bg-white"
                          value={store.status}
                          onChange={(e) =>
                            handleStatusSelect(
                              store._id,
                              Number(e.target.value)
                            )
                          }
                        >
                          <option value={0}>Active</option>
                          <option value={1}>Inactive</option>
                          <option value={2}>Bankrupt</option>
                          {/* Tambahkan opsi lain jika diperlukan di masa depan */}
                        </select>
                      </td>
                      <td>
                        <button
                          className=" p-3 rounded-lg text-2xl "
                          onClick={() => handleDeleteStore(store._id)}
                        >
                          <MdDelete />
                        </button>
                        <button
                          className=" p-3 rounded-lg text-2xl "
                          onClick={() => handleUpdateStore(store, "update")}
                        >
                          <FaInfoCircle />
                        </button>
                        <button
                          className=" p-3 rounded-lg text-2xl "
                          onClick={() => handleUpdateStore(store, "banner")}
                        >
                          <FaImage />
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
        <Modal onClose={() => modalOpen("add", false)} title={"Tambah Toko"}>
          <form onSubmit={handleSubmitAdd}>
            <p className="font-semibold mt-4">Ikon Toko</p>
            <div className="upload-container">
              <label className="upload-label">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, "add")}
                  style={{ display: "none" }}
                />
                <div className="upload-content">
                  {storeDataAdd.icon ? (
                    <Image
                      src={storeDataAdd.icon}
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
                  .find((opt) => opt.value === storeDataAdd.id_company) || null
              }
              onChange={(selectedOption) =>
                setStoreDataAdd((prevState) => ({
                  ...prevState,
                  id_company: selectedOption ? selectedOption.value : "",
                }))
              }
              isSearchable
              required
              placeholder="Pilih Company..."
              noOptionsMessage={() => "No Company available"}
            />
            <div className="flex justify-end mt-5">
              <button
                type="button"
                className="closeBtn"
                onClick={() => modalOpen("add", false)}
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
        <Modal onClose={() => modalOpen("update", false)} title={"Edit Toko"}>
          <form onSubmit={(e) => handleSubmitUpdate(e, "update")}>
            <p className="font-semibold mt-4">Icon Toko</p>
            <div className="upload-container">
              <label className="upload-label">
                <input
                  type="hidden"
                  name="_id"
                  value={storeDataUpdate._id}
                  onChange={handleChangeUpdate}
                  className="border rounded-md p-2 w-full bg-white"
                  required
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, "update")}
                  style={{ display: "none" }}
                />
                <div className="upload-content">
                  {storeDataUpdate.icon ? (
                    <Image
                      src={storeDataUpdate.icon}
                      alt="Uploaded Image"
                      width={80}
                      height={80}
                      className="uploaded-image"
                    />
                  ) : (
                    <div className="bg-[#F8FAFC] w-28 rounded-lg p-3 flex flex-col items-center justify-center">
                      <LiaCloudUploadAltSolid className="text-5xl text-[#FDDC05]" />
                      <p className="text-sm text-[#FDDC05]">New Image</p>
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
            <p className="font-semibold mt-4 mb-2">Company</p>
            <Select
              id="company"
              className="basic-single"
              options={companyList.map((c) => ({
                value: c._id,
                label: c.name,
              }))} // HE LE
              value={
                companyList
                  .map((c) => ({ value: c._id, label: c.name }))
                  .find((opt) => opt.value === storeDataUpdate.id_company) ||
                null
              }
              onChange={(selectedOption) =>
                setStoreDataUpdate((prevState) => ({
                  ...prevState,
                  id_company: selectedOption ? selectedOption.value : "",
                }))
              }
              isSearchable
              required
              placeholder="Pilih Company..."
              noOptionsMessage={() => "No Company available"}
            />
            <div className="flex justify-end mt-5">
              <button
                type="button"
                className="closeBtn"
                onClick={() => modalOpen("update", false)}
              >
                Batal
              </button>
              <button type="submit" className="submitBtn">
                Edit
              </button>
            </div>
          </form>
        </Modal>
      )}

      {isBannerModalOpen && (
        <Modal onClose={() => modalOpen("banner", false)} title={"Banner Toko"}>
          <form onSubmit={(e) => handleSubmitUpdate(e, "banner")}>
            <div className="upload-container">
              <label className="upload-label">
                <input
                  type="hidden"
                  name="_id"
                  value={storeDataUpdate._id}
                  onChange={handleChangeUpdate}
                  className="border rounded-md p-2 w-full bg-white"
                  required
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, "banner")}
                  style={{ display: "none" }}
                />
                <div className="upload-content">
                  {storeDataUpdate.banner ? (
                    <Image
                      src={storeDataUpdate.banner}
                      alt="Uploaded Image"
                      width={500}
                      height={10}
                      className="uploaded-image"
                    />
                  ) : (
                    <div className="bg-[#F8FAFC] w-28 rounded-lg p-3 flex flex-col items-center justify-center">
                      <LiaCloudUploadAltSolid className="text-5xl text-[#FDDC05]" />
                      <p className="text-sm text-[#FDDC05]">New Image</p>
                    </div>
                  )}
                </div>
              </label>
            </div>
            <div className="flex justify-end mt-5">
              <button
                type="button"
                className="closeBtn"
                onClick={() => modalOpen("banner", false)}
              >
                Batal
              </button>
              <button type="submit" className="submitBtn">
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
