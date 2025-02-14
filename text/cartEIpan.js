import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Image from "next/image";
import Topbar from "@/components/Topbar";
import { TiArrowSortedUp } from "react-icons/ti";
import { TiArrowSortedDown } from "react-icons/ti";
import { IoMdArrowRoundBack } from "react-icons/io";
import { VscTrash } from "react-icons/vsc";
// import axios from "axios";
import client from "@/libs/axios";
import Swal from "sweetalert2"; // Import sweetalert2
import { IoClose } from "react-icons/io5";
import { Modal } from "@/components/Modal";

// const client = axios.create({
//   baseURL: "http://http://20.10.16.130:31540/addsales", // Ganti dengan URL API Anda
//   headers: {
//     Authorization: `Bearer ${localStorage.getItem("token")}`, // Jika perlu
//   },
// });

const Cart = () => {
  // State untuk modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const storedCartItems = JSON.parse(Cookies.get("cartItems") || "[]");
    setCartItems(storedCartItems);

    console.log(storedCartItems);
  }, []);

  const handleButtonClick = (e) => {
    handleAddOrder(e);
    handleSales(e);
  };

  const handleAddOrder = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const sementara = cartItems.map((element) => {
        return {
          id_product: element.product.id,
          name_product: element.product.name_product,
          quantity: element.quantity,
          price_item: element.product.price_after,
          total_price: element.price_after,
          item_discount: 0,
        };
      });

      const response = await client.post(
        "/addorder",
        {
          no: "123",
          code: "ORD-001",
          person_name: customerName.nama,
          status: 1,
          id_table_cust: tableNumber.nomor,
          keterangan: 1,
          id_store: 1,
          id_company: 1,
          id_user: 1,
          orderDetails: sementara,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 201) {
        Swal.fire("Order created successfully:", response.data);
      }

      console.log("Product added:", response.data);

      // Tambahkan reload atau update state agar data muncul
      // onClose();
      window.location.reload();
    } catch (erroraddorder) {
      // Cek apakah ada response dari server
      if (erroraddorder.response) {
        // Jika ada, tampilkan status dan data dari response
        console.log(`ERROR STATUS: ${erroraddorder.response.status}`);
        console.log(
          `ERROR DATA: ${JSON.stringify(erroraddorder.response.data)}`
        );
      } else {
        // Jika tidak ada response, tampilkan pesan kesalahan umum

        console.log(`ERRORNYA: ${erroraddorder.message}`);
      }
    }
  };

  const handleSales = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      // const daftarproduk = cartItems.map((element) => {
      //   return {
      //     id_store: element.product.id_store,
      //     id_company: element.product.id_company,
      //   };
      // })

      const daftarprodukcustomer = cartItems.map((element) => {
        return {
          id_product: element.product.id,
          name_product: element.product.name_product,
          product_code: element.product.product_code,
          item_price: element.product.price_after,
          item_quantity: element.quantity,
          item_discount: 0,
        };
      });
      const response = await client.post(
        "/addsales",
        {
          no: "INV12345",
          id_user: 1,
          id_store: 1,
          id_company: 1,
          id_order: 1234,
          id_sales_campaign: 5,
          id_payment_type: selectedMethod.value,
          tax: 0,
          status: 1, // 1 = active, 2 = pending
          salesdetail: daftarprodukcustomer,
        },

        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 201) {
        // Tindakan tambahan setelah berhasil, misalnya menampilkan pesan sukses

        Swal.fire("Order created successfully:", cartItems);
      }
    } catch (errorsales) {
      // Cek apakah ada response dari server
      if (errorsales.response) {
        // Jika ada, tampilkan status dan data dari response
        console.log(`ERROR STATUS: ${errorsales.response.status}`);
        console.log(`ERROR DATA: ${JSON.stringify(errorsales.response.data)}`);
      } else {
        // Jika tidak ada response, tampilkan pesan kesalahan umum

        console.log(`ERRORNYA: ${errorsales.message}`);
      }
    }
  };

  // nama pelanggan
  const [customerName, setCustomerName] = useState({
    nama: "",
  });

  console.log(customerName.nama);

  const customerhandleChange = (e) => {
    setCustomerName({
      ...customerName,
      nama: e.target.value,
    });
  };

  const [tableNumber, setTableNumber] = useState({
    nomor: "",
  });

  const tablehandleChange = (e) => {
    setTableNumber({
      ...tableNumber,
      nomor: e.target.value,
    });
  };

  // nama product
  // useEffect(() => {
  //   if (tableNumber.nomor < 1) {
  //     setTableNumber({ nomor: 1 });
  //   } else if (tableNumber.nomor > 100) {
  //     setTableNumber({ nomor: 100 });
  //   }
  // }, [tableNumber]);
  // akhir nama produc

  useEffect(() => {
    console.log("nama pelanggan Updated:", customerName);
    console.log("nomor meja Updated:", tableNumber);
  }, [customerName, tableNumber]);

  const [payment, SetPayment] = useState({
    bayar: "",
  });
  console.log(payment);

  const handleQuantityChange = (index, newQuantity) => {
    if (newQuantity < 1) return; // Minimal quantity 1
    const updatedItems = [...cartItems];
    updatedItems[index].quantity = newQuantity;
    updatedItems[index].totalPrice =
      updatedItems[index].product.price * newQuantity;
    setCartItems(updatedItems);
    Cookies.set("cartItems", JSON.stringify(updatedItems)); // Simpan perubahan ke cookie
  };
  // const handleNameProductChange = (index, newNameProduct) => {
  //   const updatedItems = [...cartItems];
  //   updatedItems[index].name_product = newNameProduct;
  // };

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
      const updatedItems = cartItems.filter((_, i) => i !== index);
      setCartItems(updatedItems);
      Cookies.set("cartItems", JSON.stringify(updatedItems));

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

  const handleBack = () => {
    window.history.back();
  };

  const [selectedMethod, setSelectedMethod] = useState(null); //ini buat input radio

  return (
    <div className="bg-[#F7F7F7] min-h-screen custom-margin">
      <Topbar />

      <div className="p-4 mx-auto max-w-4xl">
        <div className="flex items-center mb-4">
          <button onClick={handleBack} className="mr-4">
            <IoMdArrowRoundBack className="text-xl" />
          </button>

          <h1 className="text-2xl font-semibold">INFORMASI PEMESANAN</h1>
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
            <label
              htmlFor="tableNumber"
              className="absolute top-2 left-4 text-sm text-black-500 bg-white px-1 font-semibold"
            >
              Nomor Meja
            </label>
            <input
              id="tableNumber"
              type="number"
              value={tableNumber.nomor}
              onChange={tablehandleChange}
              className="bg-white shadow-md border p-4 h-20 rounded-lg w-full text-black placeholder-black"
            />
          </div>
        </div>

        <div className="mb-6">
          <h2 className="font-semibold mb-1">Keranjang anda</h2>
          <p className="text-sm text-gray-500 mb-4">
            Anda memiliki {cartItems.length} item di dalam keranjang
          </p>
          {cartItems.length === 0 ? (
            <p>Keranjang Anda kosong.</p>
          ) : (
            <ul className="space-y-4">
              {cartItems.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center border p-4 rounded-lg bg-white shadow-md"
                >
                  <Image
                    src={item.product.image || "https://placehold.co/100x100"}
                    alt={item.product.name_product}
                    className="w-16 h-16 object-cover rounded-lg mr-4"
                    width={64}
                    height={64}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {item.product.name_product}
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
                      Rp {item.product.price_after}
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

                      {console.log(item)}
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
            Total: Rp{" "}
            {cartItems.reduce(
              (total, item) => total + item.quantity * item.product.price_after,
              0
            )}
          </p>
          <div className="flex justify-between">
            {/* Tombol Take Home */}
            <button
              onClick={openModal}
              className="py-2 px-4 rounded-lg w-1/2 mr-2 font-bold"
              style={{ backgroundColor: "#FFA461", color: "black" }}
            >
              Take Home
            </button>
            {/* Tombol Open Bill */}
            <button
              onClick={openModal}
              className="py-2 px-4 rounded-lg w-1/2 font-bold"
              style={{ backgroundColor: "#FDDC05", color: "black" }}
            >
              Open Bill
            </button>
          </div>
        </div>
      </div>
      {/* Modal */}
      {isModalOpen && (
        <Modal onClose={closeModal}>
          {/* bg-opacity dan blur biar gak ngelag */}
          <div class="bg-opacity-100">
            {/* Ringkasan Belanja */}

            <div className="border rounded-lg mb-4 shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
              <div className="bg-orange-500 text-white p-3 rounded-t-lg font-bold">
                Ringkasan Belanja
              </div>
              <div className="p-4">
                {/* Header Produk - Qty - Harga */}
                <div className="flex justify-between text-gray-500 font-semibold text-sm pb-2 border-b border-gray-300">
                  <p className="w-1/2">Produk</p>
                  <p className="w-1/4 text-center">Qty</p>
                  <p className="w-1/4 text-right">Harga</p>
                </div>

                {/* Daftar Produk */}
                {cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between py-2">
                    <p className="w-1/2 font-semibold">
                      {item.product.name_product}
                    </p>
                    <p className="w-1/4 text-center">{item.quantity}</p>
                    <p className="w-1/4 text-right font-semibold">
                      Rp {item.product.price_after.toLocaleString()}
                    </p>
                  </div>
                ))}

                {/* Biaya Kirim */}
                <div className="flex justify-between text-green-500 font-semibold mt-2">
                  <p>Biaya Kirim</p>
                  <p>0</p>
                </div>

                {/* Border dashed line */}
                <div className="border-b border-dashed border-gray-300 my-2"></div>

                {/* Total Harga */}
                <div className="flex justify-between font-bold text-lg mt-3">
                  <p className="text-black">Total Harga</p>
                  <p className="text-orange-500">
                    Rp.{" "}
                    {cartItems
                      .reduce(
                        (total, item) =>
                          total + item.quantity * item.product.price_after,
                        0
                      )
                      .toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Pilih Metode Pembayaran */}
            <div className="border rounded-lg mb-4 shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
              <div className="bg-orange-500 text-white p-3 rounded-t-lg font-bold">
                Pilih Metode Pembayaran
              </div>
              <div className="p-2 space-y-1">
                {[
                  {
                    label: "Credit/Debit Card (Visa/Master)",
                    id: 1,
                    value: 2,
                    image: "visa.svg",
                  },
                  {
                    label: "BCA Virtual Account",
                    id: 2,
                    value: 3,
                    image: "bca.svg",
                  },
                  {
                    label: "Mandiri Bill Payment",
                    id: 3,
                    value: 3,
                    image: "mandiri.svg",
                  },
                  {
                    label: "Octoclicks (CIMB Clicks)",
                    id: 4,
                    value: 3,
                    image: "octo.svg",
                  },
                  {
                    label: "Gopay",
                    id: 5,
                    value: 4,
                    image: "gopay.svg",
                  },
                  {
                    label: "QRIS",
                    id: 6,
                    subLabel: "(Gopay, Ovo, Dana, ShopeePay, etc.)",
                    value: 4,
                    image: "qris.svg",
                  },
                ].map((method) => (
                  <label
                    key={method.id}
                    className="flex items-center cursor-pointer w-full p-2 rounded-md hover:bg-orange-50 peer-checked:bg-orange-50"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="relative w-6 h-6 flex items-center justify-center">
                        <div className="absolute w-5 h-5 bg-white rounded-full border-2 border-gray-400"></div>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.value}
                          checked={selectedMethod?.id === method.id}
                          onChange={() => {
                            setSelectedMethod(method);
                            console.log("Selected Payment Method:", {
                              id: method.id,
                              label: method.label,
                              value: method.value,
                            });
                          }}
                          className="peer relative w-5 h-5 rounded-full border-2 border-gray-400 appearance-none checked:border-orange-500 transition-all duration-200"
                        />
                        <div className="absolute w-3 h-3 bg-orange-500 rounded-full scale-0 peer-checked:scale-100 transition-all duration-200"></div>
                      </div>
                      <img
                        src={method.image}
                        alt={`${method.label} logo`}
                        className="object-contain w-8 h-8"
                      />
                      <div className="flex items-center">
                        <span>{method.label}</span>
                        {method.subLabel && (
                          <span className="text-gray-500 text-sm ml-1">
                            {method.subLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Kupon Promo */}
            <div className="border rounded-lg shadow-md overflow-hidden">
              <div className="bg-orange-500 text-white p-3 font-bold">
                Kupon Promo
              </div>
              <div className="p-4">
                <input
                  type="text"
                  placeholder="Masukkan kode promo"
                  className="w-full p-3 border border-gray-300 rounded-md bg-white text-black placeholder-gray-400 outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>

            {/* Tombol Bayar dan Makan di Tempat */}
            <div className="flex flex-col gap-3 mt-4">
              <button
                className="w-full py-3 rounded-md font-bold text-white bg-[#642416] hover:bg-[#4e1b10] transition-all"
                onClick={handleButtonClick}
              >
                BAYAR
              </button>
              <button
                className="w-full py-3 rounded-md font-bold text-black bg-[#fddc05] hover:bg-[#e6c304] transition-all"
                onClick={handleButtonClick}
              >
                Makan di Tempat
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Cart;
