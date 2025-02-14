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

const Order = () => {
  const [listOrder, setListOrder] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // const [isModalOpen, setIsModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [productToUpdate, setProductToUpdate] = useState(null); // Untuk menyimpan produk yang akan diupdate
  // const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); // Untuk mengontrol tampilan modal update
  const [loading, setLoading] = useState(false); // Untuk loading saat update status

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [productList, setProductList] = useState([]);
  const [tableList, setTableList] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await client.post("/product/listproduct", {});
        const data = response.data;

        // Validate that the response is an array
        if (!Array.isArray(data)) {
          console.error(
            "Unexpected data format from /product/listproduct:",
            data
          );
          setProductList([]);
        } else {
          setProductList(data);
        }
      } catch (error) {
        console.error("Error fetching size:", error);
        setProductList([]);
      }
    };
    fetchProduct();
  }, []);
  useEffect(() => {
    const fetchTable = async () => {
      try {
        const response = await client.get("/table/listtable");
        const data = response.data;

        // Validate that the response is an array
        if (!Array.isArray(data)) {
          console.error("Unexpected data format from /table/listtable:", data);
          setTableList([]);
        } else {
          setTableList(data);
        }
      } catch (error) {
        console.error("Error fetching table:", error);
        setTableList([]);
      }
    };
    fetchTable();
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
  // const addNewProduct = (newProduct) => {
  //   setListOrder((prevOrder) => [...prevOrder, newProduct]);
  // };

  //   const handleStatus = async (productId, currentStatus) => {
  //     try {
  //       setLoading(true);

  //       const newStatus = currentStatus === 0 ? 1 : 0;

  //       const response = await client.put(`/api/product/${productId}`, {
  //         status: newStatus === 0 ? 0 : 1,
  //       });

  //       console.log("Response from API:", response.data);

  //       setListOrder((prevOrder) =>
  //         prevOrder.map((product) =>
  //           product._id === productId
  //             ? { ...product, status: newStatus }
  //             : product
  //         )
  //       );
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        const id_store = localStorage.getItem("id_store");

        if (!id_store) {
          console.error("id_store is missing in localStorage");
          setIsLoading(false);
          return;
        }

        const response = await client.post(
          "/order/listorder",
          {}, // Pass id_store in the request body
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Set the fetched order into state
        setListOrder(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching order:", error);
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, []);

  // const handleAddProduct = () => {
  //   setIsModalOpen(true);
  // };

  //   const handleUpdateOrder = (product) => {
  //     setListOrderToUpdate(product); // Menyimpan produk yang dipilih
  //     setIsUpdateModalOpen(true);

  //     console.log(product);
  //   };

  //   const deleteProductById = async (id) => {
  //     const result = await Swal.fire({
  //       title: "Are you sure?",
  //       text: "You won't be able to revert this!",
  //       icon: "warning",
  //       showCancelButton: true,
  //       confirmButtonText: "Yes, delete it!",
  //       cancelButtonText: "No, cancel!",
  //     });

  //     if (result.isConfirmed) {
  //       try {
  //         const token = localStorage.getItem("token");
  //         const response = await client.delete(`/api/product/${id}`, {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         });

  //         if (response.status === 200) {
  //           Swal.fire("Berhasil", "Produk berhasil dihapus!", "success");
  //           setListOrder((prevOrder) =>
  //             prevOrder.filter((p) => p._id !== id)
  //           );
  //         }
  //       } catch (error) {
  //         console.error("Gagal menghapus produk:", error.message);
  //         Swal.fire("Gagal", "Produk tidak dapat dihapus!", "error");
  //       }
  //     }
  //   };

  //   const handleChangeAdd = (e) => {
  //     const { name, value } = e.target;
  //     setProductDataAdd((prevState) => ({
  //       ...prevState,
  //       [name]: value,
  //     }));
  //   };

  //   const handleSubmitAdd = async (e) => {
  //     e.preventDefault();

  //     try {
  //       const token = localStorage.getItem("token");

  //       // Ensure all required fields are filled
  //       if (
  //         !productDataAdd.name_product ||
  //         !productDataAdd.stock ||
  //         !productDataAdd.sell_price ||
  //         !productDataAdd.image
  //       ) {
  //         alert("Please fill all required fields.");
  //         return;
  //       }

  //       const id_company = localStorage.getItem("id_company");
  //       const id_store = localStorage.getItem("id_store");

  //       // Send product data to the backend
  //       const response = await client.post(
  //         "/product/addproduct",
  //         {
  //           name_product: productDataAdd.name_product,
  //           stock: productDataAdd.stock,
  //           sell_price: productDataAdd.sell_price,
  //           buy_price: "500", // Hardcoded value
  //           product_code: productDataAdd.product_code,
  //           barcode: productDataAdd.barcode,
  //           deskripsi: productDataAdd.deskripsi,
  //           status: "1", // Hardcoded value
  //           id_store: id_store,
  //           id_company: id_company,
  //           id_extras: null, // Hardcoded value
  //           id_size: null, // Hardcoded value
  //           id_category_product: productDataAdd.id_category_product, // Hardcoded value
  //           image: productDataAdd.image,
  //         },
  //         {
  //           headers: { Authorization: `Bearer ${token}` },
  //         }
  //       );

  //       console.log("Product added:", response.data);
  //       Swal.fire("Berhasil", "Produk berhasil ditambahkan!", "success");

  //       // Reload the page or update state
  //       // onClose();
  //       window.location.reload();
  //     } catch (error) {
  //       console.error("Error adding product:", error);
  //     }
  //   };

  //   const handleImageChange = async (e) => {
  //     const file = e.target.files[0];
  //     if (file) {
  //       const formData = new FormData();
  //       formData.append("file", file);

  //       try {
  //         const response = await client.post("/product/upload", formData, {
  //           headers: {
  //             "Content-Type": "multipart/form-data",
  //           },
  //         });

  //         // Store the image URL in the productData state
  //         const uploadedImageUrl = response.data.image;
  //         setProductDataAdd((prevState) => ({
  //           ...prevState,
  //           image: uploadedImageUrl,
  //         }));

  //         console.log("Image uploaded successfully:", uploadedImageUrl);
  //       } catch (error) {
  //         console.error("Error uploading image:", error);
  //       }
  //     }
  //   };

  //   useEffect(() => {
  //     if (productToUpdate) {
  //       setProductDataUpdate({
  //         id: productToUpdate._id || "",
  //         image: productToUpdate.image || null, // Menyimpan URL gambar lama
  //         name_product: productToUpdate.name_product || "",
  //         name_product: productToUpdate.id_category_product || "",
  //         stock: productToUpdate.stok || "",
  //         barcode: productToUpdate.barcode || "",
  //         deskripsi: productToUpdate.deskripsi || "",
  //         sell_price: productToUpdate.sell_price || "",
  //         product_code: productToUpdate.product_code || "",
  //         id_extras: productToUpdate.id_extras || "",
  //         id_size: productToUpdate.id_size || "",
  //       });
  //     }
  //   }, [productToUpdate]);

  //   const handleChangeUpdate = (e) => {
  //     const { name, value } = e.target;
  //     setProductDataUpdate((prevState) => ({
  //       ...prevState,
  //       [name]: value,
  //     }));
  //   };

  //   const handleImageChangeUpdate = async (e) => {
  //     const file = e.target.files[0];
  //     if (file) {
  //       const formData = new FormData();
  //       const companyName = localStorage.getItem("username");
  //       const id = localStorage.getItem("id");

  //       formData.append("username", companyName);
  //       formData.append("id_user", id);
  //       formData.append("file", file);

  //       try {
  //         const response = await client.post("/upload", formData, {
  //           headers: {
  //             "Content-Type": "multipart/form-data",
  //           },
  //         });

  //         // Ambil URL dari respons API
  //         const uploadedImageUrl = response.data.metadata.fileUrl;

  //         setProductDataUpdate((prevState) => ({
  //           ...prevState,
  //           image: uploadedImageUrl, // Simpan URL, bukan File
  //         }));

  //         console.log("Image uploaded successfully:", uploadedImageUrl);
  //       } catch (error) {
  //         console.error("Error uploading image:", error);
  //       }
  //     }
  //   };

  //   const handleSubmitUpdate = async (e) => {
  //     e.preventDefault();

  //     const formData = new FormData();
  //     for (const key in productDataUpdate) {
  //       formData.append(key, productDataUpdate[key]);
  //     }
  //     const gambarbaru = productDataUpdate.image;
  //     console.log(gambarbaru);

  //     try {
  //       // const productId = "67a9615bf59ec80d10014871";
  //       const token = localStorage.getItem("token");
  //       const response = await client.put(
  //         `/api/product/${productDataUpdate.id}`,
  //         {
  //           name_product: productDataUpdate.name_product,
  //           id_category_product: productDataUpdate.id_category_product,
  //           image: gambarbaru,
  //           stock: productDataUpdate.stock,
  //           sell_price: productDataUpdate.sell_price,
  //           product_code: productDataUpdate.product_code,
  //           barcode: productDataUpdate.barcode,
  //           deskripsi: productDataUpdate.deskripsi,
  //           id_extras: null,
  //           id_size: null,
  //         },

  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );
  //       console.log("Product updated successfully:", response.data);
  //       // onClose();
  //       window.location.reload();
  //     } catch (error) {
  //       console.error("Error updating product:", error);
  //     }
  //   };

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
            <p className="text-2xl font-bold">Daftar Orderan</p>
            <p>Detail daftar orderan</p>
          </div>
        </div>
      </div>

      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          <div className="overflow-x-auto">
            {listOrder.length === 0 ? (
              <h1>Data Orderan tidak ditemukan!</h1>
            ) : (
              <table className="table w-full border border-gray-300">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Pelanggan</th>
                    <th>No Meja</th>
                    <th>Jumlah Pesanan</th>
                    <th>Total Harga</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {listOrder.map((order, index) => (
                    <tr key={order._id}>
                      <td>{index + 1}</td>
                      <td>{order.person_name}</td>
                      <td>
                        {tableList.find((tl) => tl._id == order.id_table_cust)
                          ?.name || "Unknown"}
                      </td>
                      <td>{order.orderDetails.length}</td>
                      <td>
                        {order.orderDetails
                          .map((od) => od.total_price)
                          .reduce((acc, curr) => acc + curr, 0)}
                      </td>
                      {/* <td className="flex space-x-4">
                        <button className="p-3 rounded-lg text-2xl" onClick={() => deleteProductById(product._id)}>
                          <MdDelete />
                        </button>
                        <button className="p-3 rounded-lg text-2xl" onClick={() => handleUpdateProduct(product)}>
                          <FaRegEdit />
                        </button>
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;
