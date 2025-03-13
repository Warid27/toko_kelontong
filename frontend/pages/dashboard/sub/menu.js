import React, { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import Image from "next/image";
import { MdKeyboardArrowDown } from "react-icons/md";
import client from "@/libs/axios";
import { HiDotsHorizontal } from "react-icons/hi";
import Swal from "sweetalert2";
import { MdDelete } from "react-icons/md";
import { motion } from "framer-motion";
import {
  FaRegEdit,
  FaRegFileExcel,
  FaWpforms,
  FaFileUpload,
} from "react-icons/fa";
import { IoIosCloudDone } from "react-icons/io";
import { Modal } from "@/components/Modal";
import { LiaCloudUploadAltSolid } from "react-icons/lia";
import Select from "react-select";
import { fetchExtrasList } from "@/libs/fetching/extras";
import { fetchCategoryList } from "@/libs/fetching/category";
import { fetchItemCampaignList } from "@/libs/fetching/itemCampaign";
import {
  fetchProductsList,
  AddBatchProducts,
  fetchProductsAdd,
} from "@/libs/fetching/product";
import { fetchSizeList } from "@/libs/fetching/size";
import ReactPaginate from "react-paginate";
import BarcodeGenerator from "@/components/BarcodeGenerator";
import { IoBarcodeOutline } from "react-icons/io5";

const Menu = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [productToUpdate, setProductToUpdate] = useState(null); // Untuk menyimpan produk yang akan diupdate
  // const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); // Untuk mengontrol tampilan modal update
  const [loading, setLoading] = useState(false); // Untuk loading saat update status
  // const [barcodeValue, setBarcodeValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isExampleModalOpen, setIsExampleModalOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [extrasList, setExtrasList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [itemCampaignList, setItemCampaignList] = useState([]);
  const [sizeList, setSizeList] = useState([]);
  const [openMenu, setOpenMenu] = useState("form");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const [barcode, setBarcode] = useState("");

  const token = localStorage.getItem("token");

  const id_store =
    localStorage.getItem("id_store") == "undefined"
      ? null
      : localStorage.getItem("id_store");
  const id_company =
    localStorage.getItem("id_company") == "undefined"
      ? null
      : localStorage.getItem("id_company");
  const id_user = localStorage.getItem("id_user");

  const [file, setFile] = useState(null);
  const [folder, setFolder] = useState(null);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href =
      "https://api-storage.cli.pics:443/toko-kelontong/file/example.rar";
    link.download = "Example.rar";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  function generateRandomBarcode() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  function handleGenerateBarcode() {
    setProductDataAdd({ barcode: generateRandomBarcode() });
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFolderChange = async (e) => {
    const selectedFolder = e.target.files;
    if (selectedFolder.length > 0) {
      setFolder(selectedFolder);
    }
  };

  const handleProductBatch = async () => {
    if (!file || !folder) return console.log("Pilih file dan folder gambar!");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("id_store", id_store);
    formData.append("id_company", id_company);

    // Append images to FormData
    Array.from(folder).forEach((img) => {
      formData.append("images", img);
    });

    try {
      const response = await client.post("/product/file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const data = response.data;
        const responseProduct = await AddBatchProducts(data);

        if (responseProduct.status === 201) {
          modalOpen("add", false);
          Swal.fire("Berhasil", "Produk berhasil ditambahkan!", "success");

          // **Ambil hanya objek produk dari respons API**
          const newProducts = responseProduct.data.products.map(
            (item) => item.product
          );

          // **Update state produk dengan produk baru dari batch**
          setProducts((prevProducts) => [...prevProducts, ...newProducts]);
        }
      }
    } catch (err) {
      console.log("ERROR", err);
    }
  };

  useEffect(() => {
    const fetching_requirement = async () => {
      const get_extras_list = async () => {
        const data_extras = await fetchExtrasList();
        setExtrasList(data_extras);
      };
      const get_category_list = async () => {
        const data_category = await fetchCategoryList();
        setCategoryList(data_category);
      };
      const get_itemCampaign_list = async () => {
        const data_itemCampaign = await fetchItemCampaignList();
        setItemCampaignList(data_itemCampaign);
      };
      const get_size_list = async () => {
        const data_size = await fetchSizeList();
        setSizeList(data_size);
      };
      const get_product_list = async () => {
        const data_product = await fetchProductsList(
          id_store,
          id_company,
          null,
          {}
        );
        setProducts(data_product);
      };
      get_extras_list();
      get_category_list();
      get_itemCampaign_list();
      get_size_list();
      get_product_list();
    };
    fetching_requirement();
    setIsLoading(false);
  }, []);

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

  // --- Function
  const modalOpen = (param, bool) => {
    const setters = {
      add: setIsModalOpen,
      update: setIsUpdateModalOpen,
      example: setIsExampleModalOpen,
      barcode: setIsBarcodeModalOpen,
    };
    if (setters[param]) {
      setters[param](bool);
    }
  };

  const handleStatusSelect = async (productId, selectedStatus) => {
    try {
      setLoading(true);

      const response = await client.put(
        `/api/product/${productId}`,
        {
          status: selectedStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === productId
            ? { ...product, status: selectedStatus }
            : product
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = (product, params) => {
    setProductToUpdate(product); // Menyimpan produk yang dipilih
    modalOpen(params, true);
  };

  const deleteProductById = async (id) => {
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
        // Retrieve the token from localStorage (or use a hardcoded token for testing)
        // Make the DELETE request
        const response = await client.delete(`/api/product/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Check if the response status is successful
        if (response.status === 200) {
          Swal.fire("Berhasil", "Produk berhasil dihapus!", "success");

          // Update the product list by filtering out the deleted product
          setProducts((prevProducts) =>
            prevProducts.filter((p) => p._id !== id)
          );
        }
      } catch (error) {
        // Handle errors gracefully
        let errorMessage = "An unexpected error occurred.";

        // Check if the error contains a response from the backend
        if (error.response) {
          // Extract the error message from the backend response
          errorMessage = error.response.data.message || errorMessage;
        } else if (error.message) {
          // Use the generic error message if no response is available
          errorMessage = error.message;
        }

        // Display the error message using Swal.fire
        Swal.fire("Gagal", errorMessage, "error");
      }
    }
  };

  const handleChangeAdd = (e) => {
    const { name, value } = e.target;
    setProductDataAdd((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();

    try {
      // Ensure all required fields are filled
      if (
        !productDataAdd.name_product ||
        !productDataAdd.sell_price ||
        !productDataAdd.buy_price
      ) {
        alert("Please fill all required fields.");
        return;
      }
      if (productDataAdd.sell_price <= 0 || productDataAdd.buy_price <= 0) {
        Swal.fire("Gagal", "Harga tidak boleh lebih rendah dari 1!");
        return;
      }
      const reqBody = {
        name_product: productDataAdd.name_product,
        sell_price: productDataAdd.sell_price,
        buy_price: productDataAdd.buy_price,
        product_code: productDataAdd.product_code,
        barcode: productDataAdd.barcode,
        deskripsi: productDataAdd.deskripsi,
        id_store: id_store,
        id_company: id_company,
        id_extras: null,
        id_size: null,
        id_category_product: productDataAdd.id_category_product,
        id_item_campaign: productDataAdd.id_item_campaign,
        image: productDataAdd.image,
      };
      // Send product data to the backend
      const response = await fetchProductsAdd(reqBody);

      if (response.status == 201) {
        // Auto Reload
        modalOpen("add", false);
        Swal.fire("Berhasil", "Produk berhasil ditambahkan!", "success");
        setProducts((prevProducts) => [...prevProducts, response.data]);
      }
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleImageChange = async (e, params) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("id_user", id_user);

      const pathPrefix = "product";
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
          setProductDataAdd((prevState) => ({
            ...prevState,
            image: uploadedImageUrl,
          }));
        } else if (params == "update") {
          setProductDataUpdate((prevState) => ({
            ...prevState,
            image: uploadedImageUrl,
          }));
        } else {
          console.error("Error uploading image:", error);
        }

        console.log("GAMBARNYA LEEEEEEEEEEE", uploadedImageUrl);
        console.log("Image uploaded successfully:", uploadedImageUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  useEffect(() => {
    if (productToUpdate) {
      setProductDataUpdate({
        id: productToUpdate._id || "",
        image: productToUpdate.image || null, // Menyimpan URL gambar lama
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
    setProductDataUpdate((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    for (const key in productDataUpdate) {
      formData.append(key, productDataUpdate[key]);
    }
    const gambarbaru = productDataUpdate.image;
    console.log("PREDOK", productDataUpdate);
    try {
      const response = await client.put(
        `/api/product/${productDataUpdate.id}`,
        {
          name_product: productDataUpdate.name_product,
          id_category_product: productDataUpdate.id_category_product,
          id_item_campaign: productDataUpdate.id_item_campaign || null,
          image: gambarbaru,
          buy_price: productDataUpdate.buy_price,
          sell_price: productDataUpdate.sell_price,
          product_code: productDataUpdate.product_code,
          barcode: productDataUpdate.barcode,
          deskripsi: productDataUpdate.deskripsi,
          id_extras: null,
          id_size: null,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Auto Reload
      modalOpen("update", false);
      Swal.fire("Berhasil", "Produk berhasil diupdate!", "success");
      setProducts((prevProducts) =>
        prevProducts.map((products) =>
          products._id === productDataUpdate.id ? response.data : products
        )
      );
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const statusLabels = {
    0: "active",
    1: "inactive",
  };

  const filteredProductList = products.filter(
    (product) =>
      product.name_product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      statusLabels[product.status]
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const startIndex = currentPage * itemsPerPage;
  const selectedData = filteredProductList.slice(
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
            <p className="text-2xl font-bold">Daftar Product</p>
            <p>Detail daftar product</p>
            <div className="relative mt-4">
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 pr-4 py-2 border border-gray-300 rounded-md w-full max-w-xs bg-white"
              />
              <IoSearchOutline className="absolute left-2 top-2.5 text-xl text-gray-500" />
            </div>
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
          {id_company && id_store && (
            <div>
              <button className="addBtn" onClick={() => modalOpen("add", true)}>
                + Tambah Product
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          <div>
            {filteredProductList.length === 0 ? (
              <h1>Data produk tidak ditemukan!</h1>
            ) : (
              <>
                <table className="table w-full border border-gray-300">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Nama Product</th>
                      <th>Foto</th>
                      <th>Deskripsi</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedData.map((product, index) => (
                      <tr key={product._id}>
                        <td>{index + 1}</td>
                        <td>{product.name_product}</td>
                        <td>
                          <div className="avatar">
                            <div className="mask mask-squircle h-12 w-12">
                              <Image
                                src={
                                  `${product.image}` ||
                                  "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                                }
                                alt={product.name_product}
                                width={48}
                                height={48}
                              />
                            </div>
                          </div>
                        </td>
                        <td>{product.deskripsi}</td>
                        <td>
                          <select
                            className="select bg-white"
                            value={product.status}
                            onChange={(e) =>
                              handleStatusSelect(
                                product._id,
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
                            onClick={() => deleteProductById(product._id)}
                          >
                            <MdDelete />
                          </button>
                          <button
                            className=" p-3 rounded-lg text-2xl "
                            onClick={() =>
                              handleUpdateProduct(product, "update")
                            }
                          >
                            <FaRegEdit />
                          </button>
                          <button
                            className=" p-3 rounded-lg text-2xl "
                            onClick={() => {
                              setBarcode(product.barcode);
                              modalOpen("barcode", true);
                            }}
                          >
                            <IoBarcodeOutline />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <ReactPaginate
                  previousLabel={"← Prev"}
                  nextLabel={"Next →"}
                  pageCount={Math.ceil(products.length / itemsPerPage)}
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
        onClose={() => {
          modalOpen("example", false);
          modalOpen("add", true);
        }}
        isOpen={isExampleModalOpen}
        title={"Format Menambahkan Produk"}
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
          className="rounded-lg shadow-lg border border-gray-300 
                     hover:shadow-blue-500/50 transition-shadow duration-300"
        />
      </motion.div>
      <motion.div 
        className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 
                   text-blue-900 p-5 rounded-lg shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h1 className="text-xl font-bold mb-3">📊 Cara Mengupload Produk Menggunakan Excel:</h1>
        <ul className="list-decimal list-inside space-y-2 text-md">
          <li>
            Samakan dengan format gambar di atas atau langsung unduh template yang tersedia.
          </li>
          <li>Tambahkan file Excel sesuai dengan format yang sudah ditentukan.</li>
          <li>
            Pastikan setiap gambar berada dalam folder yang sama dan namanya sesuai dengan kolom{" "}
            <span className="font-mono bg-gray-300 px-1 rounded">image</span> di Excel.
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
          className="px-6 py-3 bg-white/10 backdrop-blur-lg border border-white/20
                     hover:bg-white/20 transition text-black font-semibold rounded-lg 
                     shadow-lg hover:shadow-blue-500/50 flex items-center gap-2"
        >
          📥 Download Template
        </button>
      </motion.div>
      </Modal>

      {isBarcodeModalOpen && (
        <Modal
          onClose={() => {
            modalOpen("barcode", false);
          }}
          title={"Barcode Product"}
        >
          <div className="flex justify-center items-center">
            <BarcodeGenerator barcode={barcode} />
          </div>
        </Modal>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => modalOpen("add", false)}
        title={"Tambah Produk"}
      >
        <div className="flex flex-row mb-5">
          <button
            className={`${
              openMenu == "form" ? "addBtn mr-2" : "closeBtn"
            } w-10 h-10 flex items-center justify-center`}
            onClick={() => setOpenMenu("form")}
          >
            <FaWpforms />
          </button>
          <button
            className={`${
              openMenu == "excel" ? "addBtn" : "closeBtn"
            } w-10 h-10 flex items-center justify-center`}
            onClick={() => setOpenMenu("excel")}
          >
            <FaRegFileExcel />
          </button>
        </div>
        {(() => {
          switch (openMenu) {
            case "form":
              return (
                <form onSubmit={handleSubmitAdd}>
                  <p className="font-semibold">Gambar Produk</p>
                  <p className="mb-2 text-sm text-slate-500">
                    Image format .jpg .jpeg .png and minimum size 300 x 300px
                  </p>
                  <div className="upload-container">
                    <label className="upload-label">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, "add")}
                        style={{ display: "none" }}
                      />
                      <div className="upload-content">
                        {productDataAdd.image ? (
                          <Image
                            src={productDataAdd.image}
                            alt="Uploaded"
                            className="uploaded-image"
                            width={80}
                            height={80}
                          />
                        ) : (
                          <div className="bg-[#F8FAFC] w-28 rounded-lg p-3 flex flex-col items-center justify-center">
                            <div className="icon-container flex flex-col items-center">
                              <LiaCloudUploadAltSolid className="text-5xl text-[#FDDC05]" />
                              <p className="text-sm text-[#FDDC05]">
                                New Image
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                  <p className="font-semibold mt-4">Nama Menu</p>
                  <p className="mb-2 text-sm text-slate-500">
                    Include min. 40 characters to make it more interesting
                  </p>
                  <input
                    type="text"
                    name="name_product"
                    value={productDataAdd.name_product}
                    onChange={handleChangeAdd}
                    className="border rounded-md p-2 w-full bg-white"
                    required
                  />
                  <p className="font-semibold mt-4">Deskripsi Menu</p>
                  <p className="mb-2 text-sm text-slate-500">
                    Include min. 260 characters to make it easier for buyers to
                    understand and find your product
                  </p>
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
                        .map((c) => ({
                          value: c._id,
                          label: c.name_category,
                        }))
                        .find(
                          (opt) =>
                            opt.value === productDataAdd.id_category_product
                        ) || null
                    }
                    onChange={(selectedOption) =>
                      setProductDataAdd((prevState) => ({
                        ...prevState,
                        id_category_product: selectedOption
                          ? selectedOption.value
                          : "",
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
                        .map((c) => ({
                          value: c._id,
                          label: c.item_campaign_name,
                        }))
                        .find(
                          (opt) => opt.value === productDataAdd.id_item_campaign
                        ) || null
                    }
                    onChange={(selectedOption) => {
                      setProductDataAdd((prevState) => ({
                        ...prevState,
                        id_item_campaign: selectedOption
                          ? selectedOption.value
                          : "",
                      }));
                    }}
                    isSearchable
                    placeholder="Pilih diskon..."
                    noOptionsMessage={() => "No diskon available"}
                  />

                  <div className="flex justify-end mt-5">
                    <button
                      type="button"
                      className="bg-gray-500 text-white p-2 rounded-lg mr-2"
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
              );
            case "excel":
              return (
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

                  {/* Upload Excel File */}
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
                            <p className="text-sm text-[#FDDC05]">
                              File Uploaded
                            </p>
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

                  {/* Upload Folder */}
                  <div className="upload-container mt-4">
                    <label className="upload-label">
                      <input
                        type="file"
                        webkitdirectory="" // Allows selecting a folder
                        directory=""
                        multiple
                        onChange={handleFolderChange}
                        style={{ display: "none" }}
                      />
                      {folder ? (
                        <p>{folder.length} file gambar dipilih</p>
                      ) : (
                        <p>Pilih folder gambar</p>
                      )}
                    </label>
                  </div>

                  {/* Upload Button */}
                  <button onClick={handleProductBatch} className="addBtn">
                    Upload
                  </button>
                </div>
              );
            default:
              return null;
          }
        })()}
      </Modal>

      {isUpdateModalOpen && (
        <Modal onClose={() => modalOpen("update", false)} title={"Edit Menu"}>
          <form onSubmit={handleSubmitUpdate}>
            <p className="font-semibold">Gambar Produk</p>
            <p className="mb-2 text-sm text-slate-500">
              Format .jpg .jpeg .png dan minimal ukuran 300 x 300px
            </p>
            <div className="upload-container">
              <label className="upload-label">
                <input
                  type="hidden"
                  name="id"
                  value={productDataUpdate._id}
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
                  {productDataUpdate.image ? (
                    <Image
                      src={productDataUpdate.image}
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
                  value={productDataUpdate.sell_price}
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
              onChange={(selectedOption) =>
                setProductDataUpdate((prevState) => ({
                  ...prevState,
                  id_category_product: selectedOption
                    ? selectedOption.value
                    : "",
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
              onChange={(selectedOption) =>
                setProductDataUpdate((prevState) => ({
                  ...prevState,
                  id_item_campaign: selectedOption ? selectedOption.value : "",
                }))
              }
              isSearchable
              placeholder="Pilih diskon..."
              noOptionsMessage={() => "No diskon available"}
            />
            {/* <p className="font-semibold mt-4 mb-2">Extras</p>
            <select
              id="company"
              className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={productDataUpdate.id_extras}
              onChange={(e) =>
                setProductDataUpdate((prevState) => ({
                  ...prevState,
                  id_extras: e.target.value,
                }))
              }
              required
            >
              <option value="" disabled>
                === Pilih Extras ===
              </option>

              {extrasList.length === 0 ? (
                <option value="default" disabled>No extras available</option>
              ) : (
                extrasList.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))
              )}
            </select> */}
            {/* <p className="font-semibold mt-4 mb-2">Size</p>
            <select
              id="company"
              className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={productDataUpdate.id_size}
              onChange={(e) =>
                setProductDataUpdate((prevState) => ({
                  ...prevState,
                  id_size: e.target.value,
                }))
              }
              required
            >
              <option value="" disabled>
                === Pilih Size ===
              </option>

              {sizeList.length === 0 ? (
                <option value="default" disabled>No size available</option>
              ) : (
                sizeList.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))
              )}
            </select> */}
            <div className="flex justify-end mt-4">
              <button
                type="button"
                className="closeBtn"
                onClick={() => modalOpen("update", false)}
              >
                Batal
              </button>
              <button type="submit" className="submitBtn">
                Simpan
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Menu;
