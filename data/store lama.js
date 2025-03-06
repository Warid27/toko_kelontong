import React, { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import Image from "next/image";
import { MdKeyboardArrowDown } from "react-icons/md";
import client from "@/libs/axios";
import { HiDotsHorizontal } from "react-icons/hi";
import Swal from "sweetalert2";
import { MdDelete } from "react-icons/md";
import {
  FaRegEdit,
  FaImage,
  FaInfoCircle,
  FaQrcode,
  FaWpforms,
  FaBullhorn,
} from "react-icons/fa";
import { Modal } from "@/components/Modal";
import { LiaCloudUploadAltSolid } from "react-icons/lia";
import Select from "react-select";
import { fetchCompanyList } from "@/libs/fetching/company";
import { fetchStoreList } from "@/libs/fetching/store";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import ReactPaginate from "react-paginate";

const StoreData = () => {
  // --- useState
  const [stores, setStores] = useState([]);
  const [storeCreateQR, setStoreCreateQR] = useState("");
  const [companyCreateQR, setCompanyCreateQR] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [companyList, setCompanyList] = useState([]); // State for list of companies
  const [openDropdown, setOpenDropdown] = useState(null);
  const [storeToUpdate, setStoreToUpdate] = useState(null);
  const [loading, setLoading] = useState(false); // Untuk loading saat update status

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isHeaderModalOpen, setIsHeaderModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState("info");

  const rule =
    localStorage.getItem("rule") == "undefined"
      ? null
      : localStorage.getItem("rule");
  const id_store =
    localStorage.getItem("id_store") == "undefined"
      ? null
      : localStorage.getItem("id_store");
  const id_company =
    localStorage.getItem("id_company") == "undefined"
      ? null
      : localStorage.getItem("id_company");
  const token = localStorage.getItem("token");

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState("");

  const [storeDataAdd, setStoreDataAdd] = useState({
    name: "",
    address: "",
    id_company: "",
    icon: null,
    header: null,
    banner: null,
  });

  const [storeDataUpdate, setStoreDataUpdate] = useState({
    id: "",
    name: "",
    address: "",
    id_company: "",
    icon: null,
    header: null,
    banner: null,
  });

  useEffect(() => {
    const fetching_requirement = async () => {
      if (id_company) {
        const get_store_list = async () => {
          const data_store = await fetchStoreList();
          setStores(data_store);
          setIsLoading(false);
        };
        get_store_list();
      }
      if (rule && rule == 1) {
        const get_company_list = async () => {
          const data_company = await fetchCompanyList();
          setCompanyList(data_company);
          setIsLoading(false);
        };
        get_company_list();
      }
    };
    fetching_requirement();
  }, []);

  useEffect(() => {
    if (storeToUpdate) {
      setStoreDataUpdate({
        id: storeToUpdate._id || "",
        name: storeToUpdate.name || "",
        address: storeToUpdate.address || "",
        id_company: storeToUpdate.id_company || "",
        icon: storeToUpdate.icon || "",
        header: storeToUpdate.header || "",
        banner: storeToUpdate.banner || "",
      });
    }
  }, [storeToUpdate]);

  // --- Function
  const modalOpen = (param, bool) => {
    const setters = {
      add: setIsModalOpen,
      update: setIsUpdateModalOpen,
      header: setIsHeaderModalOpen,
      QR: setIsQRModalOpen,
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
      } else if (params == "header") {
        pathPrefix = "store/header";
      } else if (params == "banner") {
        pathPrefix = "store/banner";
      } else {
        console.error("Error uploading image:", error);
      }
      formData.append("pathPrefix", pathPrefix); // Append the pathPrefix

      try {
        const response = await client.post("/api/upload", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
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
        } else if (params == "header") {
          setStoreDataUpdate((prevState) => ({
            ...prevState,
            header: uploadedImageUrl,
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
      const response = await client.put(
        `/api/store/${storeId}`,
        {
          status: selectedStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
      // Ensure all required fields are filled
      if (!storeDataAdd.name || !storeDataAdd.address) {
        alert("Please fill all required fields.");
        return;
      }
      const response = await client.post(
        "/store/addstore",
        {
          name: storeDataAdd.name,
          address: storeDataAdd.address,
          status: 1,
          id_company: id_company,
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
  const createQR = async (id_store, id_company) => {
    setStoreCreateQR(id_store);
    setCompanyCreateQR(id_company);
    // modalOpen("QR", true);
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
      // Ensure all required fields are filled
      if (!storeDataUpdate.name || !storeDataUpdate.address) {
        alert("Please fill all required fields.");
        return;
      }

      // Make the API call to update the store
      const response = await client.put(
        `/api/store/${storeDataUpdate.id}`,
        {
          name: storeDataUpdate.name,
          address: storeDataUpdate.address,
          id_company: storeDataUpdate.id_company || id_company,
          icon: storeDataUpdate.icon,
          header: storeDataUpdate.header,
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

  const statusLabels = {
    0: "active",
    1: "inactive",
    2: "bankrupt",
  };

  const filteredStoreList = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      statusLabels[store.status]
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const startIndex = currentPage * itemsPerPage;
  const selectedData = filteredStoreList.slice(
    startIndex,
    startIndex + itemsPerPage
  );
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
                placeholder="Cari store..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 pr-4 py-2 border border-gray-300 rounded-md w-full max-w-xs bg-white"
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
          {id_company && (
            <div>
              <button className="addBtn" onClick={() => modalOpen("add", true)}>
                + Tambah Toko
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          <div>
            {filteredStoreList.length === 0 ? (
              <h1>Data Toko tidak ditemukan!</h1>
            ) : (
              <>
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
                    {selectedData.map((store, index) => (
                      <tr key={store._id}>
                        <td>{startIndex + index + 1}</td>
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
                          {/* <button
                            className=" p-3 rounded-lg text-2xl "
                            onClick={() => handleUpdateStore(store, "header")}
                          >
                            <FaImage />
                          </button>
                          <button
                            className=" p-3 rounded-lg text-2xl "
                            onClick={() =>
                              createQR(store._id, store.id_company)
                            }
                          >
                            <FaQrcode />
                          </button> */}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <ReactPaginate
                  previousLabel={"← Prev"}
                  nextLabel={"Next →"}
                  pageCount={Math.ceil(stores.length / itemsPerPage)}
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

      {/* {isUpdateModalOpen && (
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
      )} */}

      {isUpdateModalOpen && (
        <Modal onClose={() => modalOpen("update", false)} title={"Edit Toko"}>
          <div className="flex flex-row mb-5">
            <button
              className={`${
                openMenu == "info" ? "addBtn mr-2" : "closeBtn"
              } w-10 h-10 flex items-center justify-center`}
              onClick={() => setOpenMenu("info")}
            >
              <FaRegEdit />
            </button>
            <button
              className={`${
                openMenu == "header" ? "addBtn mr-2" : "closeBtn"
              } w-10 h-10 flex items-center justify-center`}
              onClick={() => setOpenMenu("header")}
            >
              <FaImage />
            </button>
            <button
              className={`${
                openMenu == "qr-code" ? "addBtn mr-2" : "closeBtn"
              } w-10 h-10 flex items-center justify-center`}
              onClick={async () => {
                await createQR(storeDataUpdate._id, storeDataUpdate.id_company);

                setOpenMenu("qr-code");
              }}
            >
              <FaQrcode />
            </button>
            <button
              className={`${
                openMenu == "banner" ? "addBtn mr-2" : "closeBtn"
              } w-10 h-10 flex items-center justify-center`}
              onClick={() => setOpenMenu("banner")}
            >
              <FaBullhorn />
            </button>
          </div>
          {(() => {
            switch (openMenu) {
              case "info":
                return (
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
                              <p className="text-sm text-[#FDDC05]">
                                New Image
                              </p>
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
                      Include min. 260 characters to make it easier for buyers
                      to understand and find your store
                    </p>
                    <textarea
                      name="address"
                      value={storeDataUpdate.address}
                      onChange={handleChangeUpdate}
                      className="border rounded-md p-2 w-full bg-white"
                      required
                    />
                    {rule && rule == 1 && (
                      <>
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
                              .find(
                                (opt) =>
                                  opt.value === storeDataUpdate.id_company
                              ) || null
                          }
                          onChange={(selectedOption) =>
                            setStoreDataUpdate((prevState) => ({
                              ...prevState,
                              id_company: selectedOption
                                ? selectedOption.value
                                : "",
                            }))
                          }
                          isSearchable
                          required
                          placeholder="Pilih Company..."
                          noOptionsMessage={() => "No Company available"}
                        />
                      </>
                    )}
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
                );
              case "header":
                return (
                  <form onSubmit={(e) => handleSubmitUpdate(e, "header")}>
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
                          onChange={(e) => handleImageChange(e, "header")}
                          style={{ display: "none" }}
                        />
                        <div className="upload-content">
                          {storeDataUpdate.header ? (
                            <Image
                              src={storeDataUpdate.header}
                              alt="Uploaded Image"
                              width={500}
                              height={10}
                              className="uploaded-image"
                            />
                          ) : (
                            <div className="bg-[#F8FAFC] w-28 rounded-lg p-3 flex flex-col items-center justify-center">
                              <LiaCloudUploadAltSolid className="text-5xl text-[#FDDC05]" />
                              <p className="text-sm text-[#FDDC05]">
                                New Image
                              </p>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
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
                );
              case "qr-code":
                return (
                  <div className="flex flex-col items-center justify-center">
                    <h1 className="text-2xl font-bold mb-4">
                      QR Code untuk Toko
                    </h1>
                    <QRCodeGenerator
                      id_store={storeCreateQR || id_store}
                      id_company={companyCreateQR || id_company}
                    />
                  </div>
                );
              case "banner":
                return (
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
                              <p className="text-sm text-[#FDDC05]">
                                New Image
                              </p>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
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
                );
              default:
                return null;
            }
          })()}
        </Modal>
      )}

      {isHeaderModalOpen && (
        <Modal onClose={() => modalOpen("header", false)} title={"Header Toko"}>
          <form onSubmit={(e) => handleSubmitUpdate(e, "header")}>
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
                  onChange={(e) => handleImageChange(e, "header")}
                  style={{ display: "none" }}
                />
                <div className="upload-content">
                  {storeDataUpdate.header ? (
                    <Image
                      src={storeDataUpdate.header}
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
                onClick={() => modalOpen("header", false)}
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
      {/* {isQRModalOpen && (
        <Modal onClose={() => modalOpen("QR", false)} title={"QR Toko"}>
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold mb-4">QR Code untuk Toko</h1>
            <QRCodeGenerator
              id_store={storeCreateQR || id_store}
              id_company={companyCreateQR || id_company}
            />
          </div>
        </Modal>
      )} */}
    </div>
  );
};

export default StoreData;
