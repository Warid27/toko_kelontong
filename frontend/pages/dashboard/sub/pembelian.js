import React, { useEffect, useState, useRef } from "react";
import moment from "moment";
import Image from "next/image";
import Swal from "sweetalert2"; // Import sweetalert2

// Icon
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti";
import { IoMdArrowRoundBack, IoIosArrowDropdown } from "react-icons/io";
import { VscTrash } from "react-icons/vsc";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { CgNotes } from "react-icons/cg";
import { IoClose } from "react-icons/io5";

// import axios from "axios";

import client from "@/libs/axios";
import Card from "@/components/Card";
import { Modal } from "@/components/Modal";
import { fetchProductsList } from "@/libs/fetching/product";
import { fetchPembelianAdd } from "@/libs/fetching/pembelian";

const Pembelian = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isnoteModalOpen, setIsnoteModalOpen] = useState(false);

  //   const [orderList, setOrderList] = useState([]);
  //   const orderListRef = useRef(orderList); // Create a ref to track the latest state
  const [pembelianItems, setPembelianItems] = useState([]);
  const [pembelianItemsUpdate, setPembelianItemsUpdate] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedExtra, setSelectedExtra] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  // Function
  const [expandedPayments, setexpandedPayments] = useState({});
  const [selectedMethod, setSelectedMethod] = useState(null);
  // State untuk modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenInfo, setIsModalOpenInfo] = useState(false);
  const openModalnote = () => {
    setIsnoteModalOpen(true);
  };
  const closeModalnote = () => {
    setIsnoteModalOpen(false);
  };
  // Update the ref whenever the state changes
  //   useEffect(() => {
  //     orderListRef.current = orderList;
  //   }, [orderList]);

  const token = localStorage.getItem("token");
  // FETCh
  useEffect(() => {
    const id_store =
      localStorage.getItem("id_store") == "undefined"
        ? null
        : localStorage.getItem("id_store");
    const id_company =
      localStorage.getItem("id_company") == "undefined"
        ? null
        : localStorage.getItem("id_company");
    const fetching_requirement = async () => {
      const get_product_list = async () => {
        const data_product = await fetchProductsList(
          id_store,
          id_company,
          null
        );
        setProducts(data_product);
      };
      get_product_list();
    };
    fetching_requirement();
  }, []);

  useEffect(() => {
    const storedCartItems = JSON.parse(
      localStorage.getItem("pembelianItems") || "[]"
    );
    setPembelianItems(storedCartItems);
  }, []);

  const handleCartUpdate = () => {
    setPembelianItemsUpdate((prev) => !prev);
  };

  const handleButtonClick = async (e) => {
    await handlePembelian(e);
  };

  const handleCardClick = async (product) => {
    try {
      const response = await client.post("product/getproduct", {
        id: product._id,
      });
      setSelectedProduct(response.data); // Set the selected product with fetched data
      setIsModalOpen(false);
      setIsModalOpenInfo(true); // Open the modal
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };

  const [infoBuyyer, setInfoBuyyer] = useState({
    keterangan: "",
  });
  // Add Pembelian

  const handlePembelian = async (e) => {
    e.preventDefault();
    console.log(pembelianItems);

    if (pembelianItems.length === 0) {
      Swal.fire("Error!", "Tidak ada item untuk dibeli.", "error");
      return;
    }

    try {
      // Prepare data for the API request
      const preparePembelianData = () => {
        const totalNumberItem = pembelianItems.length;
        const pembelianDetail = pembelianItems.map((item) => ({
          id_product: item.product.id,
          id_company: item.product.id_company,
          id_store: item.product.id_store,
          name: item.product.name,
          product_code: item.product.code,
          item_price: Number(item.product.buy_price),
          item_quantity: item.quantity,
          item_discount: 0,
        }));

        const formattedDate = moment().format("YYYYMMDDHHmmss");
        const pembelianCode = `PEM/${formattedDate}`;
        const totalQty = pembelianItems.reduce(
          (total, item) => total + item.quantity,
          0
        );
        const totalPrice = pembelianItems.reduce(
          (total, item) => total + item.product.buy_price * item.quantity,
          0
        );

        const id_user = localStorage.getItem("id_user") || "UNKNOWN_USER";

        return {
          no: pembelianCode,
          id_user,
          id_payment_type: "67ae07107f2282a509936fb7",
          status: 1, // 1 = active, 2 = pending
          total_price: totalPrice,
          total_quantity: totalQty,
          total_discount: 0,
          keterangan: infoBuyyer.keterangan || "",
          total_number_item: totalNumberItem,
          pembelianDetails: pembelianDetail,
        };
      };

      const pembelianData = preparePembelianData();
      // Make the API call
      const response = await fetchPembelianAdd(pembelianData, token);

      for (const item of pembelianItems) {
        await client.put(
          "/api/stock",
          {
            amount: item.quantity,
            params: "in",
            id_product: item.product.id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      if (response && response.status === 201) {
        // Pastikan response tidak undefined
        await clearPembelian();
        Swal.fire("Sukses!", "Berhasil Order.", "success");
      } else {
        Swal.fire("Gagal!", "Gagal Order.", "error");
      }
    } catch (error) {
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

  const infoBuyyerHandleChange = (e) => {
    const { name, value } = e.target;
    setInfoBuyyer({
      ...infoBuyyer,
      [name]: value,
    });
  };

  useEffect(() => {
    if (pembelianItems[0]?.informasi) {
      setInfoBuyyer((prevInfo) => ({
        ...prevInfo,
        keterangan: pembelianItems[0].informasi.keterangan || "",
      }));
    }
  }, [pembelianItems]);

  const [payment, SetPayment] = useState({
    bayar: "",
  });

  const handleQuantityChange = (index, newQuantity) => {
    if (newQuantity < 1) return; // Minimal quantity 1
    const updatedItems = [...pembelianItems];
    updatedItems[index].quantity = newQuantity;
    updatedItems[index].totalPrice =
      updatedItems[index].product.buy_price * newQuantity;
    setPembelianItems(updatedItems);
    localStorage.setItem("pembelianItems", JSON.stringify(updatedItems)); // Simpan perubahan ke cookie
  };
  const handleDeleteInfo = (index) => {
    const updatedItems = pembelianItems.filter((_, i) => i !== index);
    setPembelianItems(updatedItems);
    localStorage.setItem("pembelianItems", JSON.stringify(updatedItems)); // Simpan perubahan ke cookie
    // console.log("LATEST localStorage:", localStorage.get("pembelianItems"));
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

  // Clear localStorage pembelianItems
  const clearPembelian = () => {
    try {
      setPembelianItems([]); // Reset the pembelian state
      localStorage.setItem("pembelianItems", JSON.stringify([])); // Update localStorage
      console.log("Pembelian items cleared and localStorage updated.");
    } catch (error) {
      console.error("Error clearing pembelian items:", error.message);
      Swal.fire("Error!", "Failed to clear pembelian items.", "error");
    }
  };

  const addNewItems = (newItem) => {
    setPembelianItems((prevOrder) => [...prevOrder, newItem]);
  };

  return (
    <div className="bg-[#F7F7F7] w-full mt-10">
      <div className="p-4 mx-auto max-w-4xl">
        <div className="flex items-center mb-4">
          <h1 className="text-2xl font-semibold">BELI STOCK</h1>
        </div>
        <div className="h-[1.5px] bg-gray-300 w-full mb-6"></div>

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
            Anda memiliki {pembelianItems.length} item di dalam keranjang
          </p> */}
          {pembelianItems.length === 0 ? (
            <p>Keranjang Anda kosong.</p>
          ) : (
            <ul className="space-y-4">
              {pembelianItems.map((item, index) => (
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
                  {/* <p>{item.product.diskon ? item.product.diskon : "manok"}</p> */}

                  <div className="flex items-center">
                    <p className="font-semibold mr-4 relative">
                      Rp.
                      {new Intl.NumberFormat("id-ID").format(
                        item.product.buy_price
                      )}
                    </p>
                    {/* Harga satuan */}
                    <div className="flex items-center">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const inputValue = e.target.value.trim(); // Trim whitespace
                          const newQuantity =
                            inputValue === "" ? 1 : Number(inputValue); // Default to 1 if empty
                          handleQuantityChange(index, newQuantity);
                        }}
                        min="1"
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
        <div>
          <button
            className={`${
              pembelianItems[0]?.informasi || infoBuyyer.keterangan
                ? "bg-[#FDDC05]"
                : "bg-[#D3D3D3]"
            } text-black font-semibold rounded-full px-4 py-2 flex items-center space-x-2 hover:bg-[#FDDC05] transition-all duration-200 shadow-lg`}
            onClick={openModalnote}
          >
            <CgNotes className="w-5 h-5" /> <span>+ Tambah Catatan</span>
          </button>

          {/* Menampilkan tulisan kecil jika textarea terisi */}
          {(pembelianItems[0]?.informasi ||
            infoBuyyer.keterangan.trim() !== "") && (
            <p className="text-gray-500 text-sm mt-2">Catatan terisi</p>
          )}
        </div>
        <div className="mt-6 text-right">
          <p className="text-lg font-bold mb-4">
            Sub Total: Rp.
            {new Intl.NumberFormat("id-ID").format(
              pembelianItems.reduce(
                (total, item) => total + item.quantity * item.product.buy_price,
                0
              )
            )}
          </p>
          {/* <p className="text-lg font-bold mb-4">
            Total: Rp.
            {new Intl.NumberFormat("id-ID").format(
              Math.max(
                pembelianItems.reduce(
                  (total, item) =>
                    total + item.quantity * item.product.buy_price,
                  0
                ) *
                  (1 - (pembelianDiskon || 0)) *
                  (1 + tax), // Kurangi diskon dulu, lalu tambahkan pajak
                0
              )
            )}
          </p> */}
          {/* <div className="flex justify-start">
            <button
              onClick={openModalPromo}
              className="py-2 px-4 rounded-lg w-1/2 font-bold"
              style={{ backgroundColor: "#FDDC05", color: "black" }}
              disabled={pembelianDiskon != null ? true : false}
            >
              Masukkan Kode Promo
            </button>
          </div> */}
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
          <br />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.length === 0 ? (
              <div className="col-span-full flex justify-center">
                <h1 className="text-center">Produk tidak ditemukan!</h1>
              </div>
            ) : (
              products.map((product) => (
                <div key={product._id} onClick={() => handleCardClick(product)}>
                  {}
                  <Card
                    lebar={50}
                    tinggi={50}
                    image={product.image || "https://placehold.co/100x100"}
                    nama={product.name_product}
                    // harga={`Rp ${new Intl.NumberFormat("id-ID").format(
                    //   product.sell_price
                    // )}`}
                    harga={`Rp ${new Intl.NumberFormat("id-ID").format(
                      Math.max(product.buy_price)
                    )}`}
                  />
                </div>
              ))
            )}
          </div>
        </Modal>
      )}

      {isnoteModalOpen && (
        <Modal onClose={closeModalnote}>
          <div className="relative w-full">
            <p className="font-bold text-2xl mb-5">Catatan Pemesanan </p>

            <textarea
              id="infoBuyyerKeterangan"
              name="keterangan"
              style={{ height: "100px" }}
              value={infoBuyyer.keterangan}
              onChange={infoBuyyerHandleChange}
              className="bg-white shadow-md border p-4 h-20 pt-2 rounded-lg w-full text-black placeholder-black"
              placeholder="belum menuliskan keterangan"
            />
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
              <input
                type="number"
                min={1}
                step={1}
                value={quantity}
                onChange={(e) => {
                  const newQuantity = Number(e.target.value);
                  setQuantity(newQuantity);
                }}
                className="mx-4 w-16 text-center appearance-none bg-transparent border-none focus:outline-none focus:border-b focus:border-black spinner-none"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="py-2 px-3 border border-black rounded-md"
              >
                <FaPlus />
              </button>
            </div>

            <button
              onClick={() => {
                // const pembelianItems = JSON.parse(
                //   localStorage.get("pembelianItems") || "[]"
                // );

                // console.log("localStorage BEFORE:", cartItems);

                // Cek apakah item dengan extras & size yang sama sudah ada
                const existingIndex = pembelianItems.findIndex(
                  (item) =>
                    // console.log(item.product._id),
                    item.product.id === selectedProduct._id &&
                    item.selectedExtra?._id === selectedExtra &&
                    item.selectedSize?._id === selectedSize
                );

                if (existingIndex !== -1) {
                  pembelianItems[existingIndex].quantity += quantity;
                } else {
                  const today = new Date().toISOString().split("T")[0];

                  const newItem = {
                    product: {
                      id: selectedProduct._id,
                      code: selectedProduct.product_code,

                      id_company: selectedProduct.id_company,
                      id_store: selectedProduct.id_store,
                      name: selectedProduct.name_product,
                      image: selectedProduct.image,
                      price: selectedProduct.sell_price,
                      buy_price: selectedProduct.buy_price,
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

                  console.log("item barunya le", newItem);
                  addNewItems(newItem);
                }
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

export default Pembelian;
