import React, { useEffect, useState } from "react";
import Image from "next/image";

// Icons
import { MdDelete } from "react-icons/md";
import {
  FaRegEdit,
  FaWpforms,
  FaRegFileExcel,
  FaFileUpload,
  FaFolder,
} from "react-icons/fa";
import { IoBarcodeOutline } from "react-icons/io5";
import { IoIosCloudDone } from "react-icons/io";

// Components
import { SubmitButton, CloseButton } from "@/components/form/button";
import { AddMenu } from "@/components/form/menu";
import Table from "@/components/form/table";
import ImageUpload from "@/components/form/uploadImage";
import { Modal } from "@/components/Modal";
import Header from "@/components/section/header";
import Loading from "@/components/loading";
import BarcodeGenerator from "@/components/BarcodeGenerator";

// Libraries
import { fetchExtrasList } from "@/libs/fetching/extras";
import { fetchCategoryList } from "@/libs/fetching/category";
import { fetchItemCampaignList } from "@/libs/fetching/itemCampaign";
import {
  fetchProductsList,
  fetchProductsAdd,
  AddBatchProducts,
  updateProduct,
  deleteProduct,
} from "@/libs/fetching/product";
import { fetchSizeList } from "@/libs/fetching/size";
import { uploadImageCompress } from "@/libs/fetching/upload-service";
import { useImageCompression } from "@/utils/ImageCompressor";

// Packages
import { toast } from "react-toastify";
import Select from "react-select";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

const ProductMenu = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isExampleModalOpen, setIsExampleModalOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [productToUpdate, setProductToUpdate] = useState(null);
  const [openMenu, setOpenMenu] = useState("form");
  const [searchQuery, setSearchQuery] = useState("");
  const [barcode, setBarcode] = useState("");

  const [extrasList, setExtrasList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [itemCampaignList, setItemCampaignList] = useState([]);
  const [sizeList, setSizeList] = useState([]);

  const [file, setFile] = useState(null);
  const [folder, setFolder] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    compressFiles,
    compressing,
    progress,
    totalImages,
    compressedImages,
  } = useImageCompression({
    maxSizeMB: 0.8,
    maxWidthOrHeight: 1200,
  });

  const token = localStorage.getItem("token");
  const id_store =
    localStorage.getItem("id_store") === "undefined"
      ? null
      : localStorage.getItem("id_store");
  const id_company =
    localStorage.getItem("id_company") === "undefined"
      ? null
      : localStorage.getItem("id_company");
  const id_user = localStorage.getItem("id_user");

  const [productDataAdd, setProductDataAdd] = useState({
    image: null,
    name_product: "",
    id_category_product: "",
    id_item_campaign: "",
    barcode: "",
    deskripsi: "",
    buy_price: "",
    sell_price: "",
    product_code: "",
    id_extras: "",
    id_size: "",
  });

  const [productDataUpdate, setProductDataUpdate] = useState({
    id: "",
    image: null,
    name_product: "",
    id_category_product: "",
    id_item_campaign: "",
    barcode: "",
    deskripsi: "",
    buy_price: "",
    sell_price: "",
    product_code: "",
    id_extras: "",
    id_size: "",
  });

  const statusOptions = [
    { value: 0, label: "Active" },
    { value: 1, label: "Inactive" },
  ];

  const ExportHeaderTable = [
    { label: "No", key: "no" },
    { label: "Nama Produk", key: "name_product" },
    { label: "Deskripsi", key: "deskripsi" },
    { label: "Status", key: "status" },
  ];

  const HeaderTable = [
    { label: "Nama Produk", key: "name_product" },
    {
      key: "image",
      label: "Foto",
      render: (value) => (
        <div className="avatar">
          <div className="mask mask-squircle h-12 w-12">
            <Image
              src={
                value ||
                "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
              }
              alt="Product"
              width={48}
              height={48}
            />
          </div>
        </div>
      ),
    },
    { label: "Deskripsi", key: "deskripsi" },
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
      onClick: (row) => deleteProductById(row._id),
      className: "bg-red-500 hover:bg-red-600",
    },
    {
      icon: <FaRegEdit size={20} />,
      onClick: (row) => handleUpdateProduct(row, "update"),
      className: "bg-blue-500 hover:bg-blue-600",
    },
    {
      icon: <IoBarcodeOutline size={20} />,
      onClick: (row) => {
        setBarcode(row.barcode);
        modalOpen("barcode", true);
      },
      className: "bg-gray-500 hover:bg-gray-600",
    },
  ];

  // --- Functions
  const modalOpen = (param, bool) => {
    const setters = {
      add: setIsModalOpen,
      update: setIsUpdateModalOpen,
      example: setIsExampleModalOpen,
      barcode: setIsBarcodeModalOpen,
    };
    if (setters[param]) setters[param](bool);
  };

  useEffect(() => {
    const fetching_requirement = async () => {
      const get_extras_list = async () => {
        const data = await fetchExtrasList();
        setExtrasList(data);
      };
      const get_category_list = async () => {
        const data = await fetchCategoryList();
        setCategoryList(data);
      };
      const get_itemCampaign_list = async () => {
        const data = await fetchItemCampaignList();
        setItemCampaignList(data);
      };
      const get_size_list = async () => {
        const data = await fetchSizeList();
        setSizeList(data);
      };
      const get_product_list = async () => {
        const data = await fetchProductsList(id_store, id_company, null, {});
        setProducts(data);
      };
      await Promise.all([
        get_extras_list(),
        get_category_list(),
        get_itemCampaign_list(),
        get_size_list(),
        get_product_list(),
      ]);
      setIsLoading(false);
    };
    fetching_requirement();
  }, []);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href =
      "https://api-storage.cli.pics:443/toko-kelontong/file/example.rar";
    link.download = "Example.rar";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStatusSelect = async (productId, selectedStatus) => {
    try {
      setLoading(true);
      const response = await updateProduct(productId, {
        status: selectedStatus,
      });
      if (response.status === 200) {
        setProducts((prev) =>
          prev.map((p) =>
            p._id === productId ? { ...p, status: selectedStatus } : p
          )
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = (product, params) => {
    setProductToUpdate(product);
    modalOpen(params, true);
  };

  const deleteProductById = async (id) => {
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
          const response = await deleteProduct(id);
          if (response.status === 200) {
            toast.success("Produk berhasil dihapus!");
            setProducts((prev) => prev.filter((p) => p._id !== id));
          }
        } catch (error) {
          toast.error(
            "Gagal menghapus produk: " +
              (error.response?.data?.message || error.message)
          );
        }
      }
    });
  };

  const handleChangeAdd = (e) => {
    const { name, value } = e.target;
    setProductDataAdd((prev) => ({ ...prev, [name]: value }));
  };

  const generateRandomBarcode = () =>
    Math.random().toString(36).substring(2, 10).toUpperCase();

  const handleGenerateBarcode = (e) => {
    e.preventDefault();
    setProductDataAdd((prev) => ({
      ...prev,
      barcode: generateRandomBarcode(),
    }));
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      if (
        !productDataAdd.name_product ||
        !productDataAdd.sell_price ||
        !productDataAdd.buy_price
      ) {
        toast.error("Please fill all required fields.");
        return;
      }
      if (
        Number(productDataAdd.sell_price) <= 0 ||
        Number(productDataAdd.buy_price) <= 0
      ) {
        toast.error("Harga tidak boleh lebih rendah dari 1!");
        return;
      }
      const reqBody = {
        name_product: productDataAdd.name_product,
        sell_price: Number(productDataAdd.sell_price),
        buy_price: Number(productDataAdd.buy_price),
        product_code: productDataAdd.product_code,
        barcode: productDataAdd.barcode,
        deskripsi: productDataAdd.deskripsi,
        id_store,
        id_company,
        id_extras: null,
        id_size: null,
        id_category_product: productDataAdd.id_category_product,
        id_item_campaign: productDataAdd.id_item_campaign || null,
        image: productDataAdd.image,
      };
      const response = await fetchProductsAdd(reqBody);
      if (response.status === 201) {
        modalOpen("add", false);
        toast.success("Produk berhasil ditambahkan!");
        setProductDataAdd({
          image: null,
          name_product: "",
          id_category_product: "",
          id_item_campaign: "",
          barcode: "",
          deskripsi: "",
          buy_price: "",
          sell_price: "",
          product_code: "",
          id_extras: "",
          id_size: "",
        });
        setProducts((prev) => [...prev, response.data.data]);
      }
    } catch (error) {
      toast.error("Error adding product: " + error.message);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  const handleFolderChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);

      // Start compression process
      const compressedFiles = await compressFiles(files);
      setFolder(compressedFiles);
    }
  };

  const handleProductBatch = async () => {
    if (!file || !folder || folder.length === 0) {
      alert("Please select both an Excel file and image folder");
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      // Add compressed images to formData
      folder.forEach((image) => {
        formData.append("images", image);
      });

      formData.append("id_store", "your-store-id");
      formData.append("id_company", "your-company-id");

      // Send to backend
      const response = await AddBatchProducts(formData);

      if (response.success) {
        toast.success(`Upload successful! Processed ${result.count} items.`);
      } else {
        toast.error(`Upload failed: ${result.message}`);
      }

      setIsUploading(false);
    } catch (error) {
      console.error("Error uploading:", error);
      toast.error("Upload failed. Please try again.");
      setIsUploading(false);
    }
  };

  const handleImageChange = async (e, params) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const response = await uploadImageCompress(file, params, "product");
      const uploadedImageUrl = response.data.metadata.shortenedUrl;
      if (response.status === 201) {
        if (params === "add") {
          setProductDataAdd((prev) => ({ ...prev, image: uploadedImageUrl }));
        } else if (params === "update") {
          setProductDataUpdate((prev) => ({
            ...prev,
            image: uploadedImageUrl,
          }));
        }
      } else {
        toast.error(`Upload Failed: ${response.error}`);
      }
    } catch (error) {
      toast.error("Compression or upload failed: " + error.message);
    }
  };

  useEffect(() => {
    if (productToUpdate) {
      setProductDataUpdate({
        id: productToUpdate._id || "",
        image: productToUpdate.image || null,
        name_product: productToUpdate.name_product || "",
        id_category_product: productToUpdate.id_category_product || "",
        id_item_campaign: productToUpdate.id_item_campaign || "",
        barcode: productToUpdate.barcode || "",
        deskripsi: productToUpdate.deskripsi || "",
        buy_price: productToUpdate.buy_price || "",
        sell_price: productToUpdate.sell_price || "",
        product_code: productToUpdate.product_code || "",
        id_extras: productToUpdate.id_extras || "",
        id_size: productToUpdate.id_size || "",
      });
    }
  }, [productToUpdate]);

  const handleChangeUpdate = (e) => {
    const { name, value } = e.target;
    setProductDataUpdate((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const reqBody = {
        name_product: productDataUpdate.name_product,
        id_category_product: productDataUpdate.id_category_product,
        id_item_campaign: productDataUpdate.id_item_campaign || null,
        image: productDataUpdate.image,
        buy_price: Number(productDataUpdate.buy_price),
        sell_price: Number(productDataUpdate.sell_price),
        product_code: productDataUpdate.product_code,
        barcode: productDataUpdate.barcode,
        deskripsi: productDataUpdate.deskripsi,
        id_extras: null,
        id_size: null,
      };
      const response = await updateProduct(productDataUpdate.id, reqBody);
      if (response.status === 200) {
        modalOpen("update", false);
        toast.success("Produk berhasil diupdate!");
        setProducts((prev) =>
          prev.map((p) => (p._id === productDataUpdate.id ? response.data : p))
        );
      }
    } catch (error) {
      toast.error("Error updating product: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProductList = products.filter((product) =>
    product.name_product.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dataForExport = filteredProductList.map((item, index) => ({
    no: index + 1,
    name_product: item.name_product,
    deskripsi: item.deskripsi,
    status: item.status === 0 ? "Active" : "Inactive",
  }));

  if (isLoading) return <Loading />;

  return (
    <div className="w-full h-screen pt-16 relative">
      <Header
        title="Daftar Produk"
        subtitle="Detail Daftar Produk"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        modalOpen={modalOpen}
        isSearch={true}
        isAdd={id_company && id_store}
      />

      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          {filteredProductList.length === 0 ? (
            <h1>Data produk tidak ditemukan!</h1>
          ) : (
            <Table
              fileName="Data Produk"
              ExportHeaderTable={ExportHeaderTable}
              columns={HeaderTable}
              data={filteredProductList}
              actions={actions}
              statusOptions={statusOptions}
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => modalOpen("add", false)}
        title="Tambah Produk"
        width="large"
      >
        <div className="flex flex-row mb-5">
          <AddMenu
            onClick={() => setOpenMenu("form")}
            content={<FaWpforms />}
            isActive={openMenu === "form"}
          />
          <AddMenu
            onClick={() => setOpenMenu("excel")}
            content={<FaRegFileExcel />}
            isActive={openMenu === "excel"}
          />
        </div>
        {openMenu === "form" ? (
          <form onSubmit={handleSubmitAdd}>
            <p className="font-semibold">Gambar Produk</p>
            <p className="mb-2 text-sm text-slate-500">
              Image format .jpg .jpeg .png and minimum size 300 x 300px
            </p>
            <ImageUpload
              image={productDataAdd.image}
              onImageChange={(e) => handleImageChange(e, "add")}
              params="add"
            />
            <p className="font-semibold mt-4">Nama Menu</p>
            <input
              type="text"
              name="name_product"
              value={productDataAdd.name_product}
              onChange={handleChangeAdd}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4">Deskripsi Menu</p>
            <textarea
              name="deskripsi"
              value={productDataAdd.deskripsi}
              onChange={handleChangeAdd}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4 mb-2">Barcode</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                name="barcode"
                value={productDataAdd.barcode}
                onChange={handleChangeAdd}
                className="border rounded-md p-2 w-full bg-white"
                required
              />
              <button
                onClick={handleGenerateBarcode}
                className="px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Generate Barcode
              </button>
            </div>
            <div className="flex gap-2 w-full justify-between">
              <div className="w-full">
                <p className="font-semibold mt-4 mb-2">Harga Beli</p>
                <input
                  type="number"
                  name="buy_price"
                  value={productDataAdd.buy_price}
                  onChange={handleChangeAdd}
                  className="border rounded-md p-2 w-full bg-white"
                  required
                />
              </div>
              <div className="w-full">
                <p className="font-semibold mt-4 mb-2">Harga Jual</p>
                <input
                  type="number"
                  name="sell_price"
                  value={productDataAdd.sell_price}
                  onChange={handleChangeAdd}
                  className="border rounded-md p-2 w-full bg-white"
                  required
                />
              </div>
            </div>
            <p className="font-semibold mt-4 mb-2">Product Code</p>
            <input
              type="text"
              name="product_code"
              value={productDataAdd.product_code}
              onChange={handleChangeAdd}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4 mb-2">Category Product</p>
            <Select
              id="categoryProduct"
              className="basic-single"
              options={categoryList.map((c) => ({
                value: c._id,
                label: c.name_category,
              }))}
              value={
                categoryList
                  .map((c) => ({ value: c._id, label: c.name_category }))
                  .find(
                    (opt) => opt.value === productDataAdd.id_category_product
                  ) || null
              }
              onChange={(opt) =>
                setProductDataAdd((prev) => ({
                  ...prev,
                  id_category_product: opt ? opt.value : "",
                }))
              }
              isSearchable
              required
              placeholder="Pilih Category..."
              noOptionsMessage={() => "No Category available"}
            />
            <p className="font-semibold mt-4 mb-2">Diskon</p>
            <Select
              id="itemCampaign"
              className="basic-single"
              options={itemCampaignList.map((c) => ({
                value: c._id,
                label: c.item_campaign_name,
              }))}
              value={
                itemCampaignList
                  .map((c) => ({ value: c._id, label: c.item_campaign_name }))
                  .find(
                    (opt) => opt.value === productDataAdd.id_item_campaign
                  ) || null
              }
              onChange={(opt) =>
                setProductDataAdd((prev) => ({
                  ...prev,
                  id_item_campaign: opt ? opt.value : "",
                }))
              }
              isSearchable
              placeholder="Pilih diskon..."
              noOptionsMessage={() => "No diskon available"}
            />
            <div className="flex justify-end mt-5">
              <CloseButton onClick={() => modalOpen("add", false)} />
              <SubmitButton />
            </div>
          </form>
        ) : (
          <div>
            <button
              onClick={() => {
                modalOpen("add", false);
                modalOpen("example", true);
              }}
            >
              example
            </button>
            <h1 className="text-lg font-semibold text-gray-800 text-center mb-2">
              Upload Excel & Folder Gambar
            </h1>

            {/* Excel file upload */}
            <div className="upload-container">
              <label className="upload-label">
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                {file && <p>File dipilih: {file.name}</p>}
                <div className="upload-content">
                  {file ? (
                    <div className="bg-[#F8FAFC] w-28 rounded-lg p-3 flex flex-col items-center justify-center">
                      <IoIosCloudDone className="text-5xl text-[#FDDC05]" />
                      <p className="text-sm text-[#FDDC05]">File Uploaded</p>
                    </div>
                  ) : (
                    <div className="bg-[#F8FAFC] w-28 rounded-lg p-3 flex flex-col items-center justify-center">
                      <FaFileUpload className="text-5xl text-[#FDDC05]" />
                      <p className="text-sm text-[#FDDC05]">New File</p>
                    </div>
                  )}
                </div>
              </label>
            </div>

            {/* Image folder upload with compression */}
            <div className="upload-container mt-4">
              <label className="upload-label">
                <input
                  type="file"
                  webkitdirectory=""
                  directory=""
                  multiple
                  onChange={handleFolderChange}
                  style={{ display: "none" }}
                  disabled={compressing}
                />

                {compressing ? (
                  <div className="compression-status">
                    <div className="progress-bar w-full bg-gray-200 rounded-full h-2.5 mb-2">
                      <div
                        className="bg-[#FDDC05] h-2.5 rounded-full"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p>
                      Compressing images: {compressedImages} of {totalImages} (
                      {progress}%)
                    </p>
                  </div>
                ) : folder ? (
                  <p>{folder.length} file gambar dipilih (optimized to WebP)</p>
                ) : (
                  <div className="flex items-center justify-center flex-col">
                    <FaFolder className="text-4xl text-[#FDDC05] mb-2" />
                    <p>Pilih folder gambar</p>
                  </div>
                )}
              </label>
            </div>

            {/* Upload button */}
            <button
              onClick={handleProductBatch}
              className={`addBtn mt-4 ${
                isUploading || compressing
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={isUploading || compressing || !file || !folder}
            >
              {isUploading
                ? "Uploading..."
                : compressing
                ? "Compressing..."
                : "Upload"}
            </button>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => modalOpen("update", false)}
        title="Edit Produk"
        width="large"
      >
        <form onSubmit={handleSubmitUpdate}>
          <p className="font-semibold">Gambar Produk</p>
          <p className="mb-2 text-sm text-slate-500">
            Format .jpg .jpeg .png dan minimal ukuran 300 x 300px
          </p>
          <ImageUpload
            image={productDataUpdate.image}
            onImageChange={(e) => handleImageChange(e, "update")}
            params="update"
          />
          <p className="font-semibold mt-4">Nama Produk</p>
          <input
            type="text"
            name="name_product"
            value={productDataUpdate.name_product}
            onChange={handleChangeUpdate}
            className="border rounded-md p-2 w-full bg-white"
            required
          />
          <p className="font-semibold mt-4 mb-2">Barcode</p>
          <input
            type="text"
            name="barcode"
            value={productDataUpdate.barcode}
            onChange={handleChangeUpdate}
            className="border rounded-md p-2 w-full bg-white"
            required
          />
          <div className="flex gap-2 w-full justify-between">
            <div className="w-full">
              <p className="font-semibold mt-4 mb-2">Harga Beli</p>
              <input
                type="number"
                name="buy_price"
                value={productDataUpdate.buy_price}
                onChange={handleChangeUpdate}
                className="border rounded-md p-2 w-full bg-white"
                required
              />
            </div>
            <div className="w-full">
              <p className="font-semibold mt-4 mb-2">Harga Jual</p>
              <input
                type="number"
                name="sell_price"
                value={productDataUpdate.sell_price}
                onChange={handleChangeUpdate}
                className="border rounded-md p-2 w-full bg-white"
                required
              />
            </div>
          </div>
          <p className="font-semibold mt-4 mb-2">Product Code</p>
          <input
            type="text"
            name="product_code"
            value={productDataUpdate.product_code}
            onChange={handleChangeUpdate}
            className="border rounded-md p-2 w-full bg-white"
            required
          />
          <p className="font-semibold mt-4">Deskripsi Produk</p>
          <textarea
            name="deskripsi"
            value={productDataUpdate.deskripsi}
            onChange={handleChangeUpdate}
            className="border rounded-md p-2 w-full bg-white"
            required
          />
          <p className="font-semibold mt-4 mb-2">Category Product</p>
          <Select
            id="categoryProduct"
            className="basic-single"
            options={categoryList.map((c) => ({
              value: c._id,
              label: c.name_category,
            }))}
            value={
              categoryList
                .map((c) => ({ value: c._id, label: c.name_category }))
                .find(
                  (opt) => opt.value === productDataUpdate.id_category_product
                ) || null
            }
            onChange={(opt) =>
              setProductDataUpdate((prev) => ({
                ...prev,
                id_category_product: opt ? opt.value : "",
              }))
            }
            isSearchable
            placeholder="Pilih Category..."
            noOptionsMessage={() => "No Category available"}
          />
          <p className="font-semibold mt-4 mb-2">Diskon</p>
          <Select
            id="itemCampaign"
            className="basic-single"
            options={itemCampaignList.map((c) => ({
              value: c._id,
              label: c.item_campaign_name,
            }))}
            value={
              itemCampaignList
                .map((c) => ({ value: c._id, label: c.item_campaign_name }))
                .find(
                  (opt) => opt.value === productDataUpdate.id_item_campaign
                ) || null
            }
            onChange={(opt) =>
              setProductDataUpdate((prev) => ({
                ...prev,
                id_item_campaign: opt ? opt.value : "",
              }))
            }
            isSearchable
            placeholder="Pilih diskon..."
            noOptionsMessage={() => "No diskon available"}
          />
          <div className="flex justify-end mt-4">
            <CloseButton onClick={() => modalOpen("update", false)} />
            <SubmitButton />
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isExampleModalOpen}
        onClose={() => {
          modalOpen("example", false);
          modalOpen("add", true);
        }}
        title="Format Menambahkan Produk"
      >
        <motion.div
          className="flex justify-center p-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Image
            src="http://localhost:8080/api/image/39f317fa"
            width={500}
            height={200}
            alt="Format Excel"
            className="rounded-lg shadow-lg border border-gray-300 hover:shadow-blue-500/50 transition-shadow duration-300"
          />
        </motion.div>
        <motion.div
          className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 text-blue-900 p-5 rounded-lg shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h1 className="text-xl font-bold mb-3">
            📊 Cara Mengupload Produk Menggunakan Excel:
          </h1>
          <ul className="list-decimal list-inside space-y-2 text-md">
            <li>
              Samakan dengan format gambar di atas atau langsung unduh template
              yang tersedia.
            </li>
            <li>
              Tambahkan file Excel sesuai dengan format yang sudah ditentukan.
            </li>
            <li>
              Pastikan setiap gambar berada dalam folder yang sama dan namanya
              sesuai dengan kolom{" "}
              <span className="font-mono bg-gray-300 px-1 rounded">image</span>{" "}
              di Excel.
            </li>
          </ul>
        </motion.div>
        <motion.div
          className="flex justify-center my-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 transition text-black font-semibold rounded-lg shadow-lg hover:shadow-blue-500/50 flex items-center gap-2"
          >
            📥 Download Template
          </button>
        </motion.div>
      </Modal>

      <Modal
        isOpen={isBarcodeModalOpen}
        onClose={() => modalOpen("barcode", false)}
        title="Barcode Produk"
      >
        <div className="flex justify-center items-center">
          <BarcodeGenerator barcode={barcode} />
        </div>
      </Modal>
    </div>
  );
};

export default ProductMenu;
