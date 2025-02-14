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

const Menu = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // const [isModalOpen, setIsModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [productToUpdate, setProductToUpdate] = useState(null); // Untuk menyimpan produk yang akan diupdate
  // const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); // Untuk mengontrol tampilan modal update
  const [loading, setLoading] = useState(false); // Untuk loading saat update status

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [extrasList, setExtrasList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [sizeList, setSizeList] = useState([]);

  useEffect(() => {
    const fetchExtras = async () => {
      try {
        const response = await client.post("/extras/listextras", {});
        const data = response.data;

        // Validate that the response is an array
        if (!Array.isArray(data)) {
          console.error(
            "Unexpected data format from /extras/listextras:",
            data
          );
          setExtrasList([]);
        } else {
          setExtrasList(data);
        }
      } catch (error) {
        console.error("Error fetching extras:", error);
        setExtrasList([]);
      }
    };
    fetchExtras();
  }, []);
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await client.post("/category/listcategories", {});
        const data = response.data;

        // Validate that the response is an array
        if (!Array.isArray(data)) {
          console.error(
            "Unexpected data format from /category/listcategories:",
            data
          );
          setCategoryList([]);
        } else {
          setCategoryList(data);
        }
      } catch (error) {
        console.error("Error fetching category:", error);
        setCategoryList([]);
      }
    };
    fetchCategory();
  }, []);
  useEffect(() => {
    const fetchSize = async () => {
      try {
        const response = await client.get("/size/listsize");
        const data = response.data;

        // Validate that the response is an array
        if (!Array.isArray(data)) {
          console.error("Unexpected data format from /size/listsize:", data);
          setSizeList([]);
        } else {
          setSizeList(data);
        }
      } catch (error) {
        console.error("Error fetching size:", error);
        setSizeList([]);
      }
    };
    fetchSize();
  }, []);

  const [productDataAdd, setProductDataAdd] = useState({
    image: null,
    name_product: "",
    id_category_product: "",
    stock: "",
    barcode: "",
    deskripsi: "",
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
    stock: "",
    barcode: "",
    deskripsi: "",
    sell_price: "",
    product_code: "",
    id_extras: "",
    id_size: "",
  });

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
  // const addNewProduct = (newProduct) => {
  //   setProducts((prevProducts) => [...prevProducts, newProduct]);
  // };

  const handleStatus = async (productId, currentStatus) => {
    try {
      setLoading(true);

      const newStatus = currentStatus === 0 ? 1 : 0;

      const response = await client.put(`/api/product/${productId}`, {
        status: newStatus === 0 ? 0 : 1,
      });

      console.log("Response from API:", response.data);

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === productId
            ? { ...product, status: newStatus }
            : product
        )
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const id_store = localStorage.getItem("id_store");

        if (!id_store) {
          console.error("id_store is missing in localStorage");
          setIsLoading(false);
          return;
        }

        const response = await client.post(
          "/product/listproduct",
          { id_store }, // Pass id_store in the request body
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Set the fetched products into state
        setProducts(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // const handleAddProduct = () => {
  //   setIsModalOpen(true);
  // };

  const handleUpdateProduct = (product) => {
    setProductToUpdate(product); // Menyimpan produk yang dipilih
    setIsUpdateModalOpen(true);

    console.log(product);
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
        const token = localStorage.getItem("token");
        const response = await client.delete(`/api/product/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          Swal.fire("Berhasil", "Produk berhasil dihapus!", "success");
          setProducts((prevProducts) =>
            prevProducts.filter((p) => p._id !== id)
          );
        }
      } catch (error) {
        console.error("Gagal menghapus produk:", error.message);
        Swal.fire("Gagal", "Produk tidak dapat dihapus!", "error");
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
      const token = localStorage.getItem("token");

      // Ensure all required fields are filled
      if (
        !productDataAdd.name_product ||
        !productDataAdd.stock ||
        !productDataAdd.sell_price ||
        !productDataAdd.image
      ) {
        alert("Please fill all required fields.");
        return;
      }

      const id_company = localStorage.getItem("id_company");
      const id_store = localStorage.getItem("id_store");

      // Send product data to the backend
      const response = await client.post(
        "/product/addproduct",
        {
          name_product: productDataAdd.name_product,
          stock: productDataAdd.stock,
          sell_price: productDataAdd.sell_price,
          buy_price: "500", // Hardcoded value
          product_code: productDataAdd.product_code,
          barcode: productDataAdd.barcode,
          deskripsi: productDataAdd.deskripsi,
          status: "1", // Hardcoded value
          id_store: id_store,
          id_company: id_company,
          id_extras: null, // Hardcoded value
          id_size: null, // Hardcoded value
          id_category_product: productDataAdd.id_category_product, // Hardcoded value
          image: productDataAdd.image,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Product added:", response.data);
      Swal.fire("Berhasil", "Produk berhasil ditambahkan!", "success");

      // Reload the page or update state
      // onClose();
      window.location.reload();
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await client.post("/product/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // Store the image URL in the productData state
        const uploadedImageUrl = response.data.image;
        setProductDataAdd((prevState) => ({
          ...prevState,
          image: uploadedImageUrl,
        }));

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
        name_product: productToUpdate.id_category_product || "",
        stock: productToUpdate.stok || "",
        barcode: productToUpdate.barcode || "",
        deskripsi: productToUpdate.deskripsi || "",
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

  const handleImageChangeUpdate = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      const companyName = localStorage.getItem("username");
      const id = localStorage.getItem("id");

      formData.append("username", companyName);
      formData.append("id_user", id);
      formData.append("file", file);

      try {
        const response = await client.post("/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // Ambil URL dari respons API
        const uploadedImageUrl = response.data.metadata.fileUrl;

        setProductDataUpdate((prevState) => ({
          ...prevState,
          image: uploadedImageUrl, // Simpan URL, bukan File
        }));

        console.log("Image uploaded successfully:", uploadedImageUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    for (const key in productDataUpdate) {
      formData.append(key, productDataUpdate[key]);
    }
    const gambarbaru = productDataUpdate.image;
    console.log(gambarbaru);

    try {
      // const productId = "67a9615bf59ec80d10014871";
      const token = localStorage.getItem("token");
      const response = await client.put(
        `/api/product/${productDataUpdate.id}`,
        {
          name_product: productDataUpdate.name_product,
          id_category_product: productDataUpdate.id_category_product,
          image: gambarbaru,
          stock: productDataUpdate.stock,
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
      console.log("Product updated successfully:", response.data);
      // onClose();
      window.location.reload();
    } catch (error) {
      console.error("Error updating product:", error);
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
            <p className="text-2xl font-bold">Daftar Product</p>
            <p>Detail daftar product</p>
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
              + Tambah Product
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          <div className="overflow-x-auto">
            {products.length === 0 ? (
              <h1>Data produk tidak ditemukan!</h1>
            ) : (
              <table className="table w-full border border-gray-300">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Product</th>
                    <th>Foto</th>
                    <th>Deskripsi</th>
                    <th>Harga</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
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
                      <td>Rp {product.sell_price || "-"}</td>
                      <td>
                        <input
                          type="checkbox"
                          className="toggle"
                          checked={product.status === 0}
                          onChange={() =>
                            handleStatus(product._id, product.status)
                          }
                        />
                      </td>
                      <td className="flex space-x-4">
                        {" "}
                        {/* Beri jarak antar tombol */}
                        <button
                          className=" p-3 rounded-lg text-2xl "
                          onClick={() => deleteProductById(product._id)}
                        >
                          <MdDelete />
                        </button>
                        <button
                          className=" p-3 rounded-lg text-2xl "
                          onClick={() => handleUpdateProduct(product)}
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
        <Modal onClose={closeModalAdd} title={"Tambah Menu"}>
          <form onSubmit={handleSubmitAdd}>
            <p className="font-semibold">Gambar Menu</p>
            <p className="mb-2 text-sm text-slate-500">
              Image format .jpg .jpeg .png and minimum size 300 x 300px
            </p>
            <div className="upload-container">
              <label className="upload-label">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
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
                        <p className="text-sm text-[#FDDC05]">New Image</p>
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
            <p className="font-semibold mt-4 mb-2">Stock</p>
            <input
              type="number"
              name="stock"
              min={0}
              value={productDataAdd.stock}
              onChange={handleChangeAdd}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4 mb-2">Barcode</p>
            <input
              type="text"
              name="barcode"
              value={productDataAdd.barcode}
              onChange={handleChangeAdd}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4 mb-2">Harga</p>
            <input
              type="number"
              name="sell_price"
              value={productDataAdd.sell_price}
              onChange={handleChangeAdd}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4 mb-2">Product Code</p>
            <input
              type="text"
              name="product_code"
              value={productDataAdd.product_code}
              onChange={handleChangeAdd}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4 mb-2">Category</p>
            <select
              id="company"
              className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={productDataAdd.id_category_product}
              onChange={(e) =>
                setProductDataAdd((prevState) => ({
                  ...prevState,
                  id_category_product: e.target.value,
                }))
              }
              required
            >
              <option value="" disabled>
                === Pilih Category ===
              </option>

              {categoryList.length === 0 ? (
                <option value="default" disabled>
                  No category available
                </option>
              ) : (
                categoryList.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name_category}
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
        <Modal onClose={closeModalUpdate} title={"Edit Menu"}>
          <form onSubmit={handleSubmitUpdate}>
            <p className="font-semibold">Gambar Produk</p>
            <p className="mb-2 text-sm text-slate-500">
              Format .jpg .jpeg .png dan minimal ukuran 300 x 300px
            </p>
            <div className="upload-container">
              <label className="upload-label">
                <input
                  type="hidden"
                  name="_id"
                  value={productDataUpdate._id}
                  onChange={handleChangeUpdate}
                  className="border rounded-md p-2 w-full bg-white"
                  required
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChangeUpdate}
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
            <p className="font-semibold mt-4 mb-2">Stock</p>
            <input
              type="text"
              name="stock"
              value={productDataUpdate.stock}
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
            <p className="font-semibold mt-4 mb-2">Harga</p>
            <input
              type="text"
              name="sell_price"
              value={productDataUpdate.sell_price}
              onChange={handleChangeUpdate}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
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
            <p className="font-semibold mt-4 mb-2">Category</p>
            <select
              id="company"
              className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={productDataUpdate.id_category_product}
              onChange={(e) =>
                setProductDataUpdate((prevState) => ({
                  ...prevState,
                  id_category_product: e.target.value,
                }))
              }
              required
            >
              <option value="" disabled>
                === Pilih Category ===
              </option>

              {categoryList.length === 0 ? (
                <option value="default" disabled>
                  No category available
                </option>
              ) : (
                categoryList.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name_category}
                  </option>
                ))
              )}
            </select>
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
              {/* <button
              type="button"
              className="mr-2 bg-gray-400 text-white p-2 rounded-lg"
              onClick={onClose}
            >
              Batal
            </button> */}
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded-lg"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </Modal>
      )}
      {/* {isModalOpen && (
        <ModalAddProduct onClose={closeModal} onAddProduct={addNewProduct} />
      )}
      {isUpdateModalOpen && (
        <ModalEditProduct
          id={productToUpdate._id}
          initialData={productToUpdate}
          onClose={() => setIsUpdateModalOpen(false)}
        />
      )} */}
    </div>
  );
};

export default Menu;
