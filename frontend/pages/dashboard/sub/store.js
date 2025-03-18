import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  FaRegEdit,
  FaInfoCircle,
  FaQrcode,
  FaBullhorn,
  FaPalette,
} from "react-icons/fa";
import { PiShoppingCartSimpleBold } from "react-icons/pi";
import { FiLogIn } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Select from "react-select";

// Components
import { SubmitButton, CloseButton } from "@/components/form/button";
import { AddMenu } from "@/components/form/menu";
import Table from "@/components/form/table";
import ImageUpload from "@/components/form/uploadImage";
import { Modal } from "@/components/Modal";
import Header from "@/components/section/header";
import Loading from "@/components/loading";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import MapPicker from "@/components/MapPicker";

// API Functions
import { fetchCompanyList } from "@/libs/fetching/company";
import {
  fetchStoreList,
  updateStore,
  addStore,
  deleteStore,
} from "@/libs/fetching/store";
import { uploadImageCompress } from "@/libs/fetching/upload-service";
import { downloadQR } from "@/utils/downloadQR";

const StoreData = () => {
  const qrRef = useRef();
  const [stores, setStores] = useState([]);
  const [companyList, setCompanyList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [storeToUpdate, setStoreToUpdate] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenu, setOpenMenu] = useState("Info");

  const rule = localStorage.getItem("rule") || null;
  const id_store = localStorage.getItem("id_store") || null;
  const id_company = localStorage.getItem("id_company") || null;

  const [storeDataAdd, setStoreDataAdd] = useState({
    name: "",
    address: "",
    id_company: id_company || "",
    icon: "",
  });

  const [storeDataUpdate, setStoreDataUpdate] = useState({
    id: "",
    name: "",
    address: "",
    id_company: "",
    icon: "",
    banner: "",
    decorationDetails: {
      primary: "#24d164",
      secondary: "#3b82f6",
      tertiary: "#6b7280",
      danger: "#ef4444",
      motive: "",
      footer_motive: "",
    },
  });

  const statusOptions = [
    { value: 0, label: "Active" },
    { value: 1, label: "Inactive" },
    { value: 2, label: "Bankrupt" },
  ];

  const ExportHeaderTable = [
    { label: "No", key: "no" },
    { label: "Store Name", key: "name" },
    { label: "Address", key: "address" },
    { label: "Status", key: "status" },
  ];

  const HeaderTable = [
    { label: "Store Name", key: "name" },
    { label: "Address", key: "address" },
    {
      key: "status",
      label: "Status",
      render: (value, row) => (
        <div className="relative">
          <select
            className="bg-white border border-green-300 p-2 rounded-lg shadow-xl focus:ring focus:ring-green-300 w-full cursor-pointer"
            value={value}
            onChange={(e) =>
              handleStatusSelect(row._id, Number(e.target.value))
            }
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ),
    },
  ];

  const actions = [
    {
      icon: <MdDelete size={20} />,
      onClick: (row) => handleDeleteStore(row._id),
      className: "bg-red-500 hover:bg-red-600",
    },
    {
      icon: <FaInfoCircle size={20} />,
      onClick: (row) => handleUpdateStore(row),
      className: "bg-blue-500 hover:bg-blue-600",
    },
  ];

  // --- Functions
  const modalOpen = (param, bool) => {
    const setters = { add: setIsModalOpen, update: setIsUpdateModalOpen };
    setters[param]?.(bool);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const storeData = await fetchStoreList();
        setStores(storeData);
        if (rule === "1") {
          const companyData = await fetchCompanyList();
          setCompanyList(companyData);
        }
      } catch (error) {
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [rule]);

  useEffect(() => {
    if (storeToUpdate) {
      setStoreDataUpdate({
        id: storeToUpdate._id || "",
        name: storeToUpdate.name || "",
        address: storeToUpdate.address || "",
        id_company: storeToUpdate.id_company || id_company || "",
        icon: storeToUpdate.icon || "",
        banner: storeToUpdate.banner || "",
        decorationDetails: {
          primary: storeToUpdate.decorationDetails?.primary || "#24d164",
          secondary: storeToUpdate.decorationDetails?.secondary || "#3b82f6",
          tertiary: storeToUpdate.decorationDetails?.tertiary || "#6b7280",
          danger: storeToUpdate.decorationDetails?.danger || "#ef4444",
          motive: storeToUpdate.decorationDetails?.motive || "",
          footer_motive: storeToUpdate.decorationDetails?.footer_motive || "",
        },
      });
    }
  }, [storeToUpdate, id_company]);

  const handleStatusSelect = async (storeId, selectedStatus) => {
    try {
      setLoading(true);
      const reqBody = { status: selectedStatus };
      await updateStore(storeId, reqBody);
      setStores((prevStores) =>
        prevStores.map((store) =>
          store._id === storeId ? { ...store, status: selectedStatus } : store
        )
      );
      toast.success("Status updated successfully");
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStore = (store) => {
    setStoreToUpdate(store);
    modalOpen("update", true);
  };

  const handleDeleteStore = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await deleteStore(id);
          if (response.status === 200) {
            toast.success("Store deleted successfully");
            setStores((prevStores) => prevStores.filter((s) => s._id !== id));
          }
        } catch (error) {
          toast.error("Failed to delete store");
        }
      }
    });
  };

  const handleChangeAdd = (e) => {
    const { name, value } = e.target;
    setStoreDataAdd((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    if (
      !storeDataAdd.name ||
      !storeDataAdd.address ||
      !storeDataAdd.id_company
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const reqBody = {
        name: storeDataAdd.name,
        address: storeDataAdd.address,
        id_company: storeDataAdd.id_company,
        status: 1,
        icon: storeDataAdd.icon,
      };
      const response = await addStore(reqBody);
      if (response.status === 201) {
        modalOpen("add", false);
        toast.success("Store added successfully");
        setStores((prev) => [...prev, response.data]);
        setStoreDataAdd({
          name: "",
          address: "",
          id_company: id_company || "",
          icon: "",
        });
      }
    } catch (error) {
      toast.error("Failed to add store");
    }
  };

  const handleChangeUpdate = (e) => {
    const { name, value } = e.target;
    setStoreDataUpdate((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitUpdate = async (e, params) => {
    e.preventDefault();
    if (!storeDataUpdate.name || !storeDataUpdate.address) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const reqBody = {
        name: storeDataUpdate.name,
        address: storeDataUpdate.address,
        id_company: storeDataUpdate.id_company || id_company,
        icon:
          params === "icon" || params === "update"
            ? storeDataUpdate.icon
            : undefined,
        banner: params === "banner" ? storeDataUpdate.banner : undefined,
        decorationDetails:
          params === "decoration"
            ? storeDataUpdate.decorationDetails
            : undefined,
      };
      const response = await updateStore(storeDataUpdate.id, reqBody);
      if (response.status === 200) {
        modalOpen("update", false);
        toast.success("Store updated successfully");
        setStores((prev) =>
          prev.map((store) =>
            store._id === storeDataUpdate.id ? response.data : store
          )
        );
      }
    } catch (error) {
      toast.error("Failed to update store");
    }
  };

  const handleImageChange = async (e, params) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
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
          return;
      }

      const response = await uploadImageCompress(file, params, pathPrefix);
      const uploadedImageUrl = response.data.metadata.shortenedUrl;

      if (response.status === 201) {
        if (params === "add" || params === "update") {
          const stateUpdater =
            params === "add" ? setStoreDataAdd : setStoreDataUpdate;
          stateUpdater((prev) => ({ ...prev, icon: uploadedImageUrl }));
        } else if (params === "banner") {
          setStoreDataUpdate((prev) => ({ ...prev, banner: uploadedImageUrl }));
        } else if (params === "motive" || params === "footer_motive") {
          setStoreDataUpdate((prev) => ({
            ...prev,
            decorationDetails: {
              ...prev.decorationDetails,
              [params]: uploadedImageUrl,
            },
          }));
        }
        toast.success("Image uploaded successfully");
      }
    } catch (error) {
      toast.error("Failed to upload image");
    }
  };

  const handleDecorationDetailsChange = (field, value) => {
    setStoreDataUpdate((prev) => ({
      ...prev,
      decorationDetails: { ...prev.decorationDetails, [field]: value },
    }));
  };

  const statusLabels = {
    0: "active",
    1: "inactive",
  };
  const filteredStoreList = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      statusLabels[store.status]
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <Loading />;

  return (
    <div className="w-full h-screen pt-16 relative">
      <Header
        title="Daftar Toko"
        subtitle="Detail Daftar Toko"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        modalOpen={modalOpen}
        isSearch={true}
        isAdd={true}
      />

      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          {filteredStoreList.length === 0 ? (
            <h1>Data Toko tidak ditemukan!</h1>
          ) : (
            <Table
              fileName="Data Toko"
              ExportHeaderTable={ExportHeaderTable}
              columns={HeaderTable}
              data={filteredStoreList}
              actions={actions}
              statusOptions={statusOptions}
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => modalOpen("add", false)}
        title="Tambah Toko"
        width="large"
      >
        <form onSubmit={handleSubmitAdd}>
          <p className="font-semibold mt-4">Ikon Toko</p>
          <ImageUpload
            image={storeDataAdd.icon}
            onImageChange={handleImageChange}
            params="add"
          />
          <p className="font-semibold mt-4">Nama Toko</p>
          <input
            type="text"
            name="name"
            value={storeDataAdd.name}
            onChange={handleChangeAdd}
            className="border rounded-md p-2 w-full bg-white"
            required
          />
          <p className="font-semibold mt-4">Alamat Toko</p>
          <MapPicker name="address" onChange={handleChangeAdd} />
          {rule === "1" && (
            <>
              <p className="font-semibold mt-4 mb-2">Perusahaan</p>
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
                    .find((opt) => opt.value === storeDataAdd.id_company) ||
                  null
                }
                onChange={(selectedOption) =>
                  setStoreDataAdd((prev) => ({
                    ...prev,
                    id_company: selectedOption ? selectedOption.value : "",
                  }))
                }
                isSearchable
                required
                placeholder="Pilih Perusahaan..."
                noOptionsMessage={() => "No companies available"}
              />
            </>
          )}
          <div className="flex justify-end mt-5">
            <CloseButton onClick={() => modalOpen("add", false)} />
            <SubmitButton />
          </div>
        </form>
      </Modal>

      <Modal
        width="large"
        isOpen={isUpdateModalOpen}
        onClose={() => modalOpen("update", false)}
        title={`Edit Toko - ${openMenu}`}
      >
        <div className="flex flex-row mb-5">
          <AddMenu
            onClick={() => setOpenMenu("Info")}
            content={<FaRegEdit />}
            isActive={openMenu === "Info"}
          />
          <AddMenu
            onClick={() => setOpenMenu("QR Code")}
            content={<FaQrcode />}
            isActive={openMenu === "QR Code"}
          />
          <AddMenu
            onClick={() => setOpenMenu("Banner")}
            content={<FaBullhorn />}
            isActive={openMenu === "Banner"}
          />
          <AddMenu
            onClick={() => setOpenMenu("Dekorasi")}
            content={<FaPalette />}
            isActive={openMenu === "Dekorasi"}
          />
        </div>

        {(() => {
          switch (openMenu) {
            case "Info":
              return (
                <form onSubmit={(e) => handleSubmitUpdate(e, "update")}>
                  <p className="font-semibold mt-4">Ikon Toko</p>
                  <ImageUpload
                    image={storeDataUpdate.icon}
                    onImageChange={handleImageChange}
                    params="update"
                  />
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
                  <MapPicker
                    name="address"
                    value={storeDataUpdate.address}
                    onChange={handleChangeUpdate}
                  />
                  {rule === "1" && (
                    <>
                      <p className="font-semibold mt-4 mb-2">Perusahaan</p>
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
                            .find(
                              (opt) => opt.value === storeDataUpdate.id_company
                            ) || null
                        }
                        onChange={(selectedOption) =>
                          setStoreDataUpdate((prev) => ({
                            ...prev,
                            id_company: selectedOption
                              ? selectedOption.value
                              : "",
                          }))
                        }
                        isSearchable
                        required
                        placeholder="Pilih Perusahaan..."
                        noOptionsMessage={() => "No companies available"}
                      />
                    </>
                  )}
                  <div className="flex justify-end mt-5">
                    <CloseButton onClick={() => modalOpen("update", false)} />
                    <SubmitButton />
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
                      id_store={storeDataUpdate.id || id_store}
                      id_company={storeDataUpdate.id_company || id_company}
                    />
                  </div>
                  <SubmitButton
                    type="button"
                    onClick={() =>
                      downloadQR(qrRef.current, storeDataUpdate.name)
                    }
                    content="Download as JPG"
                  />
                </div>
              );
            case "Banner":
              return (
                <form onSubmit={(e) => handleSubmitUpdate(e, "banner")}>
                  <p className="font-semibold mt-4">Banner Toko</p>
                  <ImageUpload
                    image={storeDataUpdate.banner}
                    onImageChange={handleImageChange}
                    params="banner"
                  />
                  <div className="flex justify-end mt-5">
                    <CloseButton onClick={() => modalOpen("update", false)} />
                    <SubmitButton />
                  </div>
                </form>
              );
            case "Dekorasi":
              return (
                <form onSubmit={(e) => handleSubmitUpdate(e, "decoration")}>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="font-semibold">Primary</p>
                      <input
                        type="color"
                        value={storeDataUpdate.decorationDetails.primary}
                        onChange={(e) =>
                          handleDecorationDetailsChange(
                            "primary",
                            e.target.value
                          )
                        }
                        className="cursor-pointer w-full h-10 border rounded-md"
                      />
                    </div>
                    <div>
                      <p className="font-semibold">Secondary</p>
                      <input
                        type="color"
                        value={storeDataUpdate.decorationDetails.secondary}
                        onChange={(e) =>
                          handleDecorationDetailsChange(
                            "secondary",
                            e.target.value
                          )
                        }
                        className="cursor-pointer w-full h-10 border rounded-md"
                      />
                    </div>
                    <div>
                      <p className="font-semibold">Tertiary</p>
                      <input
                        type="color"
                        value={storeDataUpdate.decorationDetails.tertiary}
                        onChange={(e) =>
                          handleDecorationDetailsChange(
                            "tertiary",
                            e.target.value
                          )
                        }
                        className="cursor-pointer w-full h-10 border rounded-md"
                      />
                    </div>
                    <div>
                      <p className="font-semibold">Danger</p>
                      <input
                        type="color"
                        value={storeDataUpdate.decorationDetails.danger}
                        onChange={(e) =>
                          handleDecorationDetailsChange(
                            "danger",
                            e.target.value
                          )
                        }
                        className="cursor-pointer w-full h-10 border rounded-md"
                      />
                    </div>
                  </div>
                  <div className="flex flex-row justify-center gap-3 mt-4">
                    <div>
                      <p className="font-semibold text-center">Motive</p>
                      <ImageUpload
                        image={storeDataUpdate.decorationDetails.motive}
                        onImageChange={handleImageChange}
                        params="motive"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-center">Footer Motive</p>
                      <ImageUpload
                        image={storeDataUpdate.decorationDetails.footer_motive}
                        onImageChange={handleImageChange}
                        params="footer_motive"
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      "--primary": storeDataUpdate.decorationDetails.primary,
                      "--secondary":
                        storeDataUpdate.decorationDetails.secondary,
                      "--tertiary": storeDataUpdate.decorationDetails.tertiary,
                      "--danger": storeDataUpdate.decorationDetails.danger,
                    }}
                    className="preview bg-white shadow-md rounded-lg border border-gray-200 p-3 mt-4"
                  >
                    <div className="bg-[var(--primary)] px-4 py-2 shadow-md flex justify-between rounded-md">
                      <button className="btn btn-ghost rounded-md btn-xs">
                        Kasir
                      </button>
                      <div className="space-x-1 flex">
                        <button className="btn btn-ghost rounded-md btn-xs flex items-center">
                          <PiShoppingCartSimpleBold />
                        </button>
                        <button className="btn btn-ghost rounded-md btn-xs flex items-center">
                          <FiLogIn />
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-1 justify-between mt-2">
                      <button className="text-white font-medium px-2 py-1 text-xs rounded-md bg-[var(--primary)]">
                        Tambah
                      </button>
                      <button className="text-white font-medium px-2 py-1 text-xs rounded-md bg-[var(--secondary)]">
                        Edit
                      </button>
                      <button className="text-white font-medium px-2 py-1 text-xs rounded-md bg-[var(--tertiary)]">
                        Batal
                      </button>
                      <button className="text-white font-medium px-2 py-1 text-xs rounded-md bg-[var(--danger)]">
                        Hapus
                      </button>
                    </div>
                    {storeDataUpdate.decorationDetails.motive && (
                      <Image
                        src={storeDataUpdate.decorationDetails.motive}
                        width={50}
                        height={50}
                        className="mt-2 rounded-md"
                        alt="Motive"
                      />
                    )}
                    {storeDataUpdate.decorationDetails.footer_motive && (
                      <Image
                        src={storeDataUpdate.decorationDetails.footer_motive}
                        width={400}
                        height={100}
                        className="mt-2 rounded-md w-full"
                        alt="Footer Motive"
                      />
                    )}
                  </div>
                  <div className="flex justify-end mt-5">
                    <CloseButton onClick={() => modalOpen("update", false)} />
                    <SubmitButton />
                  </div>
                </form>
              );
            default:
              return null;
          }
        })()}
      </Modal>
    </div>
  );
};

export default StoreData;
