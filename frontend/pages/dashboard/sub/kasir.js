import React, { useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import Image from "next/image";
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti";
import { IoMdArrowRoundBack, IoIosArrowDropdown } from "react-icons/io";
import { VscTrash } from "react-icons/vsc";
import { FaMinus, FaPlus } from "react-icons/fa6";
// import axios from "axios";
import client from "@/libs/axios";
import Swal from "sweetalert2"; // Import sweetalert2
import { IoClose } from "react-icons/io5";
import Card from "@/components/Card";
import { Modal } from "@/components/Modal";

const Kasir = () => {
  const [products, setProducts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [table_custList, setTable_custList] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  //   const [orderList, setOrderList] = useState([]);
  //   const orderListRef = useRef(orderList); // Create a ref to track the latest state
  const [kasirItems, setKasirItems] = useState([]);
  const [kasirItemsUpdate, setKasirItemsUpdate] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedExtra, setSelectedExtra] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  // Function
  const [expandedPayments, setexpandedPayments] = useState({});
  const [selectedMethod, setSelectedMethod] = useState(null);
  // State untuk modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenInfo, setIsModalOpenInfo] = useState(false);
  const tax = 12/100
  // Update the ref whenever the state changes
  //   useEffect(() => {
  //     orderListRef.current = orderList;
  //   }, [orderList]);

  // FETCH
  useEffect(() => {
    const fetchTable_cust = async () => {
      try {
        const response = await client.get("/table/listtable");
        const data = response.data;

        // Validate that the response is an array
        if (!Array.isArray(data)) {
          console.error("Unexpected data format from /table/listtable:", data);
          setTable_custList([]);
        } else {
          setTable_custList(data);
        }
      } catch (error) {
        console.error("Error fetching table_cust:", error);
        setTable_custList([]);
      }
    };
    fetchTable_cust();
  }, []);
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await client.post(
          "/product/listproduct",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = response.data;

        // Validate that the response is an array
        if (!Array.isArray(data)) {
          console.error(
            "Unexpected data format from /product/listproduct:",
            data
          );
          setProducts([]);
        } else {
          setProducts(data);
        }
      } catch (error) {
        console.error("Error fetching table_cust:", error);
        setProducts([]);
      }
    };
    fetchProduct();
  }, []);

  useEffect(() => {
    const storedCartItems = JSON.parse(Cookies.get("kasirItems") || "[]");
    setKasirItems(storedCartItems);
  }, []);
  
  const handleCartUpdate = () => {
    setKasirItemsUpdate((prev) => !prev);
  };

  const handleButtonClick = async (e) => {
    await handleSales(e);
  };

  const handleCardClick = async (product) => {
    try {
      const response = await client.post("product/getproduct", {
        id: product._id,
      });
      setSelectedProduct(response.data); // Set the selected product with fetched data
      setIsModalOpen(false)
      setIsModalOpenInfo(true); // Open the modal
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };

  // Add Sales
  const handleSales = async (e) => {
    e.preventDefault();
    try {
      // Validate orderList

      // Prepare data for the API request
      const prepareSalesData = () => {
        const totalNumberItem = kasirItems.length;

        const salesDetail = kasirItems.map((item) => ({
          id_product: item.product.id,
          name: item.product.name,
          product_code: item.product.product_code,
          item_price: Number(item.product.price),
          item_quantity: item.quantity,
          item_discount: 0,
        }));

        const salesCode = `INV/${Date.now()}/${crypto.randomUUID()}`;
        const tax = 0.12
        const totalQty = kasirItems.reduce(
          (total, item) => total + item.quantity,
          0
        );
        const totalPrice = kasirItems.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
        const totalPriceWithTax = kasirItems.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        ) * (1 + tax); // Pajak ditambahkan setelah semua harga dihitung
        
        return {
          no: salesCode,
          id_user: "67a034f9962111a02fcc5ad2", // Consider making this dynamic
          id_store: "679b448102f7087c0369c23c", // Consider making this dynamic
          id_order: "679b448102f7087c0369c23c",
          id_sales_campaign: "67adf9ffcf892c7756288622", // Consider making this dynamic
          id_payment_type: selectedMethod._id,
          tax: tax,
          status: 1, // 1 = active, 2 = pending
          total_price: totalPriceWithTax,
          total_quantity: totalQty,
          total_discount: 0,
          total_number_item: totalNumberItem,
          salesDetails: salesDetail,
        };
      };

      const token = localStorage.getItem("token");
      const salesData = prepareSalesData();

      // Make the API call
      const response = await client.post("sales/addsales", salesData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 201) {
        Swal.fire("Sukses!", "Berhasil Order.", "success");
        await clearKasir(); // Clear kasir only after successful API call
        window.location.reload(); // Refresh the page
      }
    } catch (error) {
      // Handle errors gracefully
      let errorMessage = "An unexpected error occurred.";
      if (error.response) {
        errorMessage = `Error: ${JSON.stringify(error.response.data)}`;
      } else if (error.message) {
        errorMessage = error.message;
      }

      console.error(errorMessage);
      Swal.fire("Error!", errorMessage, "error");
    }
  };

  // nama pelanggan
  const [customerName, setCustomerName] = useState({
    nama: "",
  });

  const customerhandleChange = (e) => {
    setCustomerName({
      ...customerName,
      nama: e.target.value,
    });
  };

  const [tableNumber, setTableNumber] = useState({
    nomor: "",
  });

  const tableHandleChange = (e) => {
    setTableNumber({
      ...tableNumber,
      nomor: e.target.value,
    });
  };
  const [payment, SetPayment] = useState({
    bayar: "",
  });

  const handleQuantityChange = (index, newQuantity) => {
    if (newQuantity < 1) return; // Minimal quantity 1
    const updatedItems = [...kasirItems];
    updatedItems[index].quantity = newQuantity;
    updatedItems[index].totalPrice =
      updatedItems[index].product.price * newQuantity;
    setKasirItems(updatedItems);
    Cookies.set("kasirItems", JSON.stringify(updatedItems)); // Simpan perubahan ke cookie
  };
  const handleDeleteInfo = (index) => {
    const updatedItems = kasirItems.filter((_, i) => i !== index);
    setKasirItems(updatedItems);
    Cookies.set("kasirItems", JSON.stringify(updatedItems)); // Simpan perubahan ke cookie
    console.log("LATEST COOKIES:", Cookies.get("kasirItems"));
  };
  const handleDelete = async (index) => {
    const result = await Swal.fire({
      title: "Apakah anda yakin?",
      text: "Item ini akan dihapus dari keranjang!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      handleDeleteInfo(index);

      Swal.fire(
        "Terhapus!",
        "Item berhasil dihapus dari keranjang.",
        "success"
      );
    }
  };

  // Fungsi untuk membuka modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Fungsi untuk menutup modal
  const closeModal = () => {
    setIsModalOpen(false);
  };
  const openModaInfo = () => {
    setIsModalOpenInfo(true);
  };

  // Fungsi untuk menutup modal
  const closeModalInfo = () => {
    setIsModalOpenInfo(false);
  };

  const handleBack = () => {
    window.history.back();
  };

  // Clear Cookies kasirItems
  const clearKasir = () => {
    try {
      setKasirItems([]); // Reset the kasir state
      Cookies.set("kasirItems", JSON.stringify([]), { expires: 7 }); // Update cookies
      console.log("Kasir items cleared and cookies updated.");
    } catch (error) {
      console.error("Error clearing kasir items:", error.message);
      Swal.fire("Error!", "Failed to clear kasir items.", "error");
    }
  };

  const addNewItems = (newItem) => {
    setKasirItems((prevOrder) => [...prevOrder, newItem]);
  };

  return (
    <div className="bg-[#F7F7F7] w-full mt-10">
      <div className="p-4 mx-auto max-w-4xl">
        <div className="flex items-center mb-4">
          <h1 className="text-2xl font-semibold">SALES</h1>
        </div>
        <div className="h-[1.5px] bg-gray-300 w-full mb-6"></div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="relative w-full">
            <label
              htmlFor="customerName"
              className="absolute top-2 left-4 text-sm text-black-500 bg-white px-1 font-semibold"
            >
              Nama Pelanggan
            </label>
            <input
              id="customerName"
              type="text"
              value={customerName.nama}
              onChange={customerhandleChange}
              className="bg-white shadow-md border p-4 h-20 rounded-lg w-full text-black placeholder-black"
            />
          </div>
          <div className="relative w-full">
            <label className="absolute top-2 left-4 text-sm text-black-500 bg-white px-1 font-semibold">
              Nomor Meja
            </label>
            <select
              id="nomer"
              name="id_table_cust"
              className="bg-white shadow appearance-none border rounded w-full p-4 h-20 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={tableNumber.nomor}
              onChange={tableHandleChange}
              required
            >
              <option value="" disabled>
                === Pilih Table ===
              </option>

              {table_custList.length === 0 ? (
                <option value="default">No Table available</option>
              ) : (
                table_custList.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold mb-1">Pesanan</h2>
            <button
              onClick={openModal}
              className="py-2 px-4 rounded-lg font-bold"
              style={{ backgroundColor: "#FDDC05", color: "black" }}
            >
              + Tambah Pesanan
            </button>
          </div>

          {/* <p className="text-sm text-gray-500 mb-4">
            Anda memiliki {kasirItems.length} item di dalam keranjang
          </p> */}
          {kasirItems.length === 0 ? (
            <p>Keranjang Anda kosong.</p>
          ) : (
            <ul className="space-y-4">
              {kasirItems.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center border p-4 rounded-lg bg-white shadow-md"
                >
                  <Image
                    src={item.product.image || "https://placehold.co/100x100"}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg mr-4"
                    width={64}
                    height={64}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {item.product.name}
                    </h3>
                    {/* Hanya tampilkan size atau extra yang dipilih secara horizontal dengan koma natural */}
                    <div className="flex">
                      {item.selectedSize?.name && (
                        <p className="text-sm">
                          {item.selectedSize.name}
                          {item.selectedExtra?.name && ","}
                        </p>
                      )}
                      {item.selectedExtra?.name && (
                        <p className="text-sm ml-1">
                          {item.selectedExtra.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <p className="font-semibold mr-4">
                      Rp.
                      {new Intl.NumberFormat("id-ID").format(
                        item.product.price
                      )}
                    </p>{" "}
                    {/* Harga satuan */}
                    <div className="flex items-center">
                      <input
                        type="number"
                        value={item.quantity}
                        min="1"
                        readOnly
                        className="text-center bg-transparent text-lg w-8 outline-none border-none"
                      />

                      <div className="flex flex-col items-center ml-2 -space-y-2.5">
                        <button
                          onClick={() =>
                            handleQuantityChange(index, item.quantity + 1)
                          }
                          className="text-lg bg-transparent p--4 leading-none"
                        >
                          <TiArrowSortedUp />
                        </button>
                        <button
                          onClick={() =>
                            handleQuantityChange(index, item.quantity - 1)
                          }
                          className="text-lg bg-transparent p--4 leading-none"
                        >
                          <TiArrowSortedDown />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(index)}
                      className="ml-4"
                    >
                      <VscTrash className="w-6 h-6" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 text-right">
          <p className="text-lg font-bold mb-4">
            Sub Total: Rp.
            {new Intl.NumberFormat("id-ID").format(
              kasirItems.reduce(
                (total, item) => total + item.quantity * item.product.price,
                0
              )
            )}
          </p>
          <p className="text-lg font-bold mb-4">Diskon: -</p>
          <p className="text-lg font-bold mb-4">
            Pajak: {tax * 100}%
          </p>
          <p className="text-lg font-bold mb-4">
            Total: Rp.
            {new Intl.NumberFormat("id-ID").format(
              kasirItems.reduce(
                (total, item) => total + item.quantity * item.product.price,
                0
              ) * (1 + tax) // Tambahkan pajak ke total
            )}
          </p>

          <div className="flex justify-end">
            <button
              onClick={handleButtonClick}
              className="py-2 px-4 rounded-lg w-1/2 font-bold"
              style={{ backgroundColor: "#FDDC05", color: "black" }}
            >
              Bayar
            </button>
          </div>
        </div>

      </div>

      {isModalOpen && (
        <Modal onClose={closeModal} title={"Tambah Pesanan"}>
          <br/>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product._id} onClick={() => handleCardClick(product)}>
                  <Card
                    lebar={50}
                    tinggi={50}
                    image={product.image || "https://placehold.co/100x100"}
                    nama={product.name_product}
                    harga={`Rp ${new Intl.NumberFormat("id-ID").format(
                      product.sell_price
                    )}`}
                  />
                </div>
              ))}
            </div>
        
        </Modal>
      )}

      {isModalOpenInfo && (
              <Modal onClose={closeModalInfo}>
                <div>
                  <Image
                    src={selectedProduct?.image || "https://placehold.co/100x100"}
                    alt={selectedProduct?.name_product}
                    width={100}
                    height={100}
                    className="w-[500px] h-[550px] mb-4"
                  />
                  <p className="text-xl font-bold">{selectedProduct?.name_product}</p>
                  <p>{selectedProduct?.deskripsi}</p>

                  <p className="font-semibold mt-4 mb-2">Extras</p>
                  <div className="flex flex-wrap space-x-2">
                    {selectedProduct?.id_extras?.extrasDetails.map((extra) => (
                      <button
                        key={extra._id}
                        className={`p-2 rounded-md ${
                          selectedExtra === extra._id
                            ? "bg-[#FDDC05] text-black font-semibold"
                            : "bg-white border-[#FDDC05] border-2"
                        }`}
                        onClick={() => setSelectedExtra(extra._id)}
                      >
                        {extra.name}
                      </button>
                    ))}
                  </div>

                  <p className="font-semibold mt-4 mb-2">Size</p>
                  <div className="flex flex-wrap space-x-2">
                    {selectedProduct?.id_size?.sizeDetails.map((size) => (
                      <button
                        key={size._id}
                        className={`p-2 rounded-md ${
                          selectedSize === size._id
                            ? "bg-[#FDDC05] text-black font-semibold"
                            : "bg-white border-[#FDDC05] border-2"
                        }`}
                        onClick={() => setSelectedSize(size._id)}
                      >
                        {size.name}
                      </button>
                    ))}
                  </div>

                  {/* Kontrol jumlah produk */}
                  <div className="flex items-center place-content-center mt-4">
                    <button
                      onClick={() => setQuantity(Math.max(0, quantity - 1))}
                      className="py-2 px-3 border border-black rounded-md"
                    >
                      <FaMinus />
                    </button>
                    <span className="mx-4">{quantity}</span>{" "}
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="py-2 px-3 border border-black rounded-md"
                    >
                      <FaPlus />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      const kasirItems = JSON.parse(Cookies.get("kasirItems") || "[]");

                      // console.log("COOKIES BEFORE:", cartItems);

                      // Cek apakah item dengan extras & size yang sama sudah ada
                      const existingIndex = kasirItems.findIndex(
                        (item) =>
                          // console.log(item.product._id),
                          item.product.id === selectedProduct._id &&
                          item.selectedExtra?._id === selectedExtra &&
                          item.selectedSize?._id === selectedSize
                      );

                      if (existingIndex !== -1) {
                        // Jika produk dengan extras dan size yang sama sudah ada, tambahkan jumlahnya
                        kasirItems[existingIndex].quantity += quantity;
                      } else {
                        // Jika belum ada, tambahkan sebagai item baru
                        const newItem = {
                          product: {
                            // ...prevProduct  ini bikin ngebug sialannnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
                            id: selectedProduct._id,
                            name: selectedProduct.name_product,
                            image: selectedProduct.image,
                            price: selectedProduct.sell_price,
                          },
                          quantity,
                          selectedExtra: selectedExtra
                            ? {
                                _id: selectedExtra,
                                name: selectedProduct?.id_extras?.extrasDetails.find(
                                  (extra) => extra._id === selectedExtra
                                )?.name,
                              }
                            : null,
                          selectedSize: selectedSize
                            ? {
                                _id: selectedSize,
                                name: selectedProduct?.id_size?.sizeDetails.find(
                                  (size) => size._id === selectedSize
                                )?.name,
                              }
                            : null,
                        };
                        // console.log("YUDAAA", newItem.selectedExtra);
                        // kasirItems.push(newItem);
                        // console.log("item barunya", newItem);
                        addNewItems(newItem)
                      }
                      // Cookies.set("kasirItems", JSON.stringify(kasirItems), {
                      //   expires: 7,
                      // });
                      // console.log("Menambahkan ke keranjang:", cartItems);
                      console.log("COOKIESSSS:", Cookies.get("kasirItems"));
                      closeModalInfo();
                      handleCartUpdate();
                    }}
                    className={`mt-4 w-full p-2 rounded-md ${
                      quantity === 0 ? "bg-gray-400" : "bg-green-500 text-white"
                    }`}
                    disabled={quantity === 0}
                  >
                    Tambah ke Keranjang
                  </button>
                </div>
              </Modal>
            )}
    </div>
  );
};

export default Kasir;
