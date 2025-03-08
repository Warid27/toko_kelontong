import React, { useEffect, useState, useRef } from "react";
import { IoSearchOutline } from "react-icons/io5";
import Image from "next/image";
import { MdKeyboardArrowDown } from "react-icons/md";

import Swal from "sweetalert2";
import { MdDelete } from "react-icons/md";
import {
  FaRegEdit,
  FaImage,
  FaInfoCircle,
  FaQrcode,
  FaWpforms,
  FaBullhorn,
  FaPalette,
} from "react-icons/fa";
import { PiShoppingCartSimpleBold } from "react-icons/pi";
import { LiaCloudUploadAltSolid } from "react-icons/lia";
import { FiLogIn } from "react-icons/fi";

// components
import { Modal } from "@/components/Modal";
import { fetchCompanyList } from "@/libs/fetching/company";
import {
  fetchStoreList,
  updateStore,
  addStore,
  deleteStore,
} from "@/libs/fetching/store";
import { uploadImageCompress } from "@/libs/fetching/upload-service";
import QRCodeGenerator from "@/components/QRCodeGenerator";
// package
import Select from "react-select";
import ReactPaginate from "react-paginate";
import domtoimage from "dom-to-image";

const StoreData = () => {
  const qrRef = useRef();
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
  const [openMenu, setOpenMenu] = useState("Info");

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
    decorationDetails: {
      primary: "",
      secondary: "",
      tertiary: "",
      danger: "",
      motive: "",
      footer_motive: "",
    },
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
        decorationDetails: storeToUpdate.decorationDetails || "",
      });
    }
  }, [storeToUpdate]);

  // --- Function
  const modalOpen = (param, bool) => {
    const setters = {
      add: setIsModalOpen,
      update: setIsUpdateModalOpen,
    };
    if (setters[param]) {
      setters[param](bool);
    }
  };

  // UPLOADS
  const handleImageChange = async (e, params) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // 🔹 Set correct upload path
      let pathPrefix = "";
      switch (params) {
        case "add":
        case "update":
          pathPrefix = "store/icon";
          break;
        case "banner":
          pathPrefix = "store/banner";
          break;
        case "motive":
        case "footer_motive":
          pathPrefix = "store/motive";
          break;
        default:
          console.error(`Invalid params value: ${params}`);
          return;
      }

      const response = await uploadImageCompress(file, params, pathPrefix);
      const uploadedImageUrl = response.data.metadata.shortenedUrl;

      // 🔹 Update state based on `params`
      if (params === "add" || params === "update") {
        const stateUpdater =
          params === "add" ? setStoreDataAdd : setStoreDataUpdate;
        stateUpdater((prevState) => ({ ...prevState, icon: uploadedImageUrl }));
      } else if (["banner"].includes(params)) {
        setStoreDataUpdate((prevState) => ({
          ...prevState,
          [params]: uploadedImageUrl,
        }));
      } else if (params === "motive" || params === "footer_motive") {
        setStoreDataUpdate((prevState) => ({
          ...prevState,
          decorationDetails: {
            ...prevState.decorationDetails,
            [params]: uploadedImageUrl,
          },
        }));
      }

      console.log(`✅ Image uploaded successfully: ${uploadedImageUrl}`);
    } catch (error) {
      console.error("❌ Compression or upload failed:", error);
    }
  };

  // HANDLE
  const handleDecorationDetailsChange = (field, value) => {
    setStoreDataUpdate((prev) => ({
      ...prev,
      decorationDetails: {
        ...prev.decorationDetails, // Spread existing properties
        [field]: value, // Update the specified field
      },
    }));
  };

  const handleStatusSelect = async (storeId, selectedStatus) => {
    try {
      setLoading(true);
      const reqBody = {
        status: selectedStatus,
      };
      const response = await updateStore(storeId, reqBody);
      if (response.status == 200) {
        setStores((prevStores) =>
          prevStores.map((store) =>
            store._id === storeId ? { ...store, status: selectedStatus } : store
          )
        );
      }
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
        const response = await deleteStore(id);

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

      const reqBody = {
        name: storeDataAdd.name,
        address: storeDataAdd.address,
        status: 1,
        id_company: id_company,
        icon: storeDataAdd.icon,
      };
      const response = await addStore(reqBody);

      if (response.status == 200) {
        Swal.fire("Berhasil", "Toko berhasil ditambahkan!", "success");

        modalOpen("add", false);
        setStores((prevStores) => [...prevStores, response.data]);
      } else {
        Swal.fire("Gagal", response.error, "error");
      }
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

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    try {
      // Ensure all required fields are filled
      if (!storeDataUpdate.name || !storeDataUpdate.address) {
        alert("Please fill all required fields.");
        return;
      }
      const reqBody = {
        name: storeDataUpdate.name,
        address: storeDataUpdate.address,
        id_company: storeDataUpdate.id_company || id_company,
        icon: storeDataUpdate.icon,
        header: storeDataUpdate.header,
        banner: storeDataUpdate.banner,
        decorationDetails: storeDataUpdate.decorationDetails,
      };

      const response = await updateStore(storeDataUpdate.id, reqBody);

      if (response.status == 200) {
        // Show success message
        Swal.fire("Berhasil", "Toko berhasil diperbarui!", "success");
        modalOpen("update", false);
        // Update the stores state with the updated store
        setStores((prevStores) =>
          prevStores.map((store) =>
            store._id === storeDataUpdate.id ? response.data : store
          )
        );
      } else {
        Swal.fire("Gagal", response.error, "error");
      }
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
  const imagePositions = [
    { left: "-24px", top: "0px" },
    { right: "-24px", top: "80px" },
    { left: "-24px", top: "160px" },
    { right: "-24px", top: "240px" },
  ];

  const handleDownloadQR = async (name) => {
    if (!qrRef.current) return;

    try {
      const dataUrl = await domtoimage.toJpeg(qrRef.current, {
        quality: 1, // Ensures high-quality JPG
        bgcolor: "#ffffff", // Ensures white background
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `qr-code-${name}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download QR Code:", error);
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
        <div className="flex flex-row justify-end mt-8">
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
                    <div className="border-2 border-slate-500 w-28 rounded-lg p-3 flex flex-col items-center justify-center">
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

      {isUpdateModalOpen && (
        <Modal
          onClose={() => modalOpen("update", false)}
          title={`Edit Toko - ${openMenu}`}
        >
          <div className="flex flex-row mb-5">
            <button
              className={`${
                openMenu == "Info" ? "addBtn mr-2" : "closeBtn"
              } w-10 h-10 flex items-center justify-center`}
              onClick={() => setOpenMenu("Info")}
            >
              <FaRegEdit />
            </button>
            {/* <button
              className={`${
                openMenu == "Header" ? "addBtn mr-2" : "closeBtn"
              } w-10 h-10 flex items-center justify-center`}
              onClick={() => setOpenMenu("Header")}
            >
              <FaImage />
            </button> */}
            <button
              className={`${
                openMenu == "QR Code" ? "addBtn mr-2" : "closeBtn"
              } w-10 h-10 flex items-center justify-center`}
              onClick={async () => {
                await createQR(storeDataUpdate._id, storeDataUpdate.id_company);

                setOpenMenu("QR Code");
              }}
            >
              <FaQrcode />
            </button>
            <button
              className={`${
                openMenu == "Banner" ? "addBtn mr-2" : "closeBtn"
              } w-10 h-10 flex items-center justify-center`}
              onClick={() => setOpenMenu("Banner")}
            >
              <FaBullhorn />
            </button>
            <button
              className={`${
                openMenu == "Dekorasi" ? "addBtn mr-2" : "closeBtn"
              } w-10 h-10 flex items-center justify-center`}
              onClick={() => setOpenMenu("Dekorasi")}
            >
              <FaPalette />
            </button>
          </div>
          {(() => {
            switch (openMenu) {
              case "Info":
                return (
                  <form onSubmit={(e) => handleSubmitUpdate(e)}>
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
                            <div className="border-2 border-slate-500 w-28 rounded-lg p-3 flex flex-col items-center justify-center">
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
                    <input
                      type="text"
                      name="name"
                      value={storeDataUpdate.name}
                      onChange={handleChangeUpdate}
                      className="border rounded-md p-2 w-full bg-white"
                      required
                    />
                    <p className="font-semibold mt-4">Alamat Toko</p>
                    <textarea
                      name="address"
                      value={storeDataUpdate.address}
                      onChange={handleChangeUpdate}
                      className="border rounded-md p-2 w-full bg-white"
                      required
                    />
                    {rule && rule != 1 && (
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

              case "QR Code":
                return (
                  <div className="flex flex-col items-center justify-center">
                    <h1 className="text-2xl font-bold mb-4 text-center">
                      QR Code untuk Toko {storeDataUpdate.name}
                    </h1>
                    <div ref={qrRef}>
                      <QRCodeGenerator
                        id_store={storeCreateQR || id_store}
                        id_company={companyCreateQR || id_company}
                      />
                    </div>
                    <button
                      onClick={() => handleDownloadQR(storeDataUpdate.name)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                      Download as JPG
                    </button>
                  </div>
                );
              case "Banner":
                return (
                  <form onSubmit={(e) => handleSubmitUpdate(e)}>
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
                            <div className="border-2 border-slate-500 w-28 rounded-lg p-3 flex flex-col items-center justify-center">
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
              case "Dekorasi":
                return (
                  <form onSubmit={(e) => handleSubmitUpdate(e)}>
                    <div className="flex flex-col gap-4">
                      {/* Color Selection Row */}
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <p className="font-semibold">Primary</p>
                          <input
                            type="color"
                            value={
                              storeDataUpdate.decorationDetails?.primary ||
                              "#24d164"
                            }
                            onChange={(e) =>
                              handleDecorationDetailsChange(
                                "primary",
                                e.target.value
                              )
                            }
                            className="cursor-pointer w-full h-10 border rounded-md"
                            required
                          />
                        </div>
                        <div>
                          <p className="font-semibold">Secondary</p>
                          <input
                            type="color"
                            value={
                              storeDataUpdate.decorationDetails?.secondary ||
                              "#3b82f6"
                            }
                            onChange={(e) =>
                              handleDecorationDetailsChange(
                                "secondary",
                                e.target.value
                              )
                            }
                            className="cursor-pointer w-full h-10 border rounded-md"
                            required
                          />
                        </div>
                        <div>
                          <p className="font-semibold">Tertiary</p>
                          <input
                            type="color"
                            value={
                              storeDataUpdate.decorationDetails?.tertiary ||
                              "#6b7280"
                            }
                            onChange={(e) =>
                              handleDecorationDetailsChange(
                                "tertiary",
                                e.target.value
                              )
                            }
                            className="cursor-pointer w-full h-10 border rounded-md"
                            required
                          />
                        </div>
                        <div>
                          <p className="font-semibold">Danger</p>
                          <input
                            type="color"
                            value={
                              storeDataUpdate.decorationDetails?.danger ||
                              "#ef4444"
                            }
                            onChange={(e) =>
                              handleDecorationDetailsChange(
                                "danger",
                                e.target.value
                              )
                            }
                            className="cursor-pointer w-full h-10 border rounded-md"
                            required
                          />
                        </div>
                      </div>

                      {/* Motive Upload Section */}
                      <div className="flex flex-row justify-center gap-3">
                        <div>
                          <p className="font-semibold text-center">MOTIVE</p>
                          <div className="flex justify-center">
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageChange(e, "motive")}
                                style={{ display: "none" }}
                              />
                              <div className="border-2 border-slate-500 h-32 rounded-lg p-3 flex flex-col items-center justify-center">
                                {storeDataUpdate.decorationDetails?.motive ? (
                                  <Image
                                    src={
                                      storeDataUpdate.decorationDetails?.motive
                                    }
                                    alt="Uploaded"
                                    className="uploaded-image rounded-md h-full"
                                    width={80}
                                    height={80}
                                  />
                                ) : (
                                  <Image
                                    src={
                                      "http://localhost:8080/uploads/store/motive/default-motive.png"
                                    }
                                    alt="Uploaded"
                                    className="uploaded-image rounded-md h-full w-full"
                                    width={80}
                                    height={80}
                                  />
                                )}
                              </div>
                            </label>
                          </div>
                          <p className="text-center">300 x 400 px</p>
                        </div>
                        <div>
                          <p className="font-semibold text-center">
                            FOOTER MOTIVE
                          </p>
                          <div className="flex justify-center">
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  handleImageChange(e, "footer_motive")
                                }
                                alt="FOOTER MOTIVE"
                                style={{ display: "none" }}
                              />
                              <div className="border-2 border-slate-500 h-32 rounded-lg p-3 flex flex-col items-center justify-center">
                                {storeDataUpdate.decorationDetails
                                  ?.footer_motive ? (
                                  <Image
                                    src={
                                      storeDataUpdate.decorationDetails
                                        ?.footer_motive
                                    }
                                    alt="Uploaded"
                                    className="uploaded-image rounded-md h-full w-full"
                                    width={80}
                                    height={80}
                                  />
                                ) : (
                                  <Image
                                    src={
                                      "http://localhost:8080/uploads/store/motive/default-footer-motive.png"
                                    }
                                    alt="Uploaded"
                                    className="uploaded-image rounded-md h-full w-full"
                                    width={80}
                                    height={80}
                                  />
                                )}
                              </div>
                            </label>
                          </div>
                          <p className="text-center">1440 x 720 px</p>
                        </div>
                      </div>
                      {/* === PREVIEW === */}
                      <div
                        style={{
                          "--primary":
                            storeDataUpdate.decorationDetails?.primary ||
                            "#24d164",
                          "--secondary":
                            storeDataUpdate.decorationDetails?.secondary ||
                            "#3b82f6",
                          "--tertiary":
                            storeDataUpdate.decorationDetails?.tertiary ||
                            "#6b7280",
                          "--danger":
                            storeDataUpdate.decorationDetails?.danger ||
                            "#ef4444",
                        }}
                        className="preview bg-white shadow-md rounded-lg border border-gray-200 p-3 w-full h-[500px] space-y-2"
                      >
                        {/* Top Bar - Compact */}
                        <div className="bg-[var(--primary)] px-4 py-2 shadow-md flex flex-row justify-between rounded-md border border-gray-300 text-xs">
                          <button className="btn btn-ghost rounded-md btn-xs">
                            Kasir
                          </button>
                          <div className="space-x-1 flex">
                            <button className="btn btn-ghost rounded-md btn-xs flex items-center">
                              <PiShoppingCartSimpleBold className="text-sm" />
                            </button>
                            <button className="btn btn-ghost rounded-md btn-xs flex items-center">
                              <FiLogIn className="text-sm" />
                            </button>
                          </div>
                        </div>

                        {/* Button Preview - Compact */}
                        <div className="relative flex gap-1 justify-between overflow-hidden h-[425px] flex-col">
                          {/* Image Positioned Outside */}
                          {storeDataUpdate.decorationDetails?.motive &&
                            imagePositions.map((pos, index) => (
                              <Image
                                key={index}
                                src={
                                  storeDataUpdate.decorationDetails.motive ||
                                  "http://localhost:8080/uploads/store/motive/default-motive.png"
                                }
                                width={50}
                                height={50}
                                className="absolute rounded-md"
                                style={pos}
                                alt="MOTIVE"
                              />
                            ))}

                          {/* Buttons (Ensure padding-left to prevent overlap) */}
                          <div className="flex justify-center gap-1 pl-6 h-8">
                            <button
                              onClick={() => {}}
                              type="button"
                              className="text-white font-medium px-2 py-1 text-xs rounded-md shadow-sm bg-[var(--primary)] hover:brightness-90"
                            >
                              Tambah
                            </button>
                            <button
                              onClick={() => {}}
                              type="button"
                              className="text-white font-medium px-2 py-1 text-xs rounded-md shadow-sm bg-[var(--secondary)] hover:brightness-90"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {}}
                              type="button"
                              className="text-white font-medium px-2 py-1 text-xs rounded-md shadow-sm bg-[var(--tertiary)] hover:brightness-90"
                            >
                              Batal
                            </button>
                            <button
                              onClick={() => {}}
                              type="button"
                              className="text-white font-medium px-2 py-1 text-xs rounded-md shadow-sm bg-[var(--danger)] hover:brightness-90"
                            >
                              Hapus
                            </button>
                          </div>
                          <div className="flex justify-center max-h-[20vh] min-h-[20vh] overflow-hidden relative w-full">
                            <Image
                              src={
                                storeDataUpdate.decorationDetails
                                  .footer_motive ||
                                "http://localhost:8080/uploads/store/motive/default-footer-motive.png"
                              }
                              width={400}
                              height={100}
                              className="absolute rounded-md w-full"
                              alt="FOOTER MOTIVE"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="flex justify-end mt-5 gap-2">
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
                    </div>
                  </form>
                );
              default:
                return null;
            }
          })()}
        </Modal>
      )}
    </div>
  );
};

export default StoreData;
