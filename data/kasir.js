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

const Kasir = () => {
  const [products, setProducts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [table_custList, setTable_custList] = useState([]);
  const [orderList, setOrderList] = useState([]);
  const [itemCampaignList, setItemCampaignList] = useState([]);
  const [salesCampaignList, setSalesCampaignList] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  //   const [orderList, setOrderList] = useState([]);
  //   const orderListRef = useRef(orderList); // Create a ref to track the latest state
  const [kasirItems, setKasirItems] = useState([]);
  // const [kasirItemsUpdate, setKasirItemsUpdate] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedExtra, setSelectedExtra] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  // State untuk modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenPromo, setIsModalOpenPromo] = useState(false);
  const [isModalOpenProductInfo, setIsModalOpenProductInfo] = useState(false);
  const [isnoteModalOpen, setIsnoteModalOpen] = useState(false);
  const [salesDiskon, setSalesDiskon] = useState(null); // Gunakan useState
  const [idSalesDiskon, setIdSalesDiskon] = useState(null); // Gunakan useState
  const [infoBuyyer, setInfoBuyyer] = useState({
    nama: "",
    keterangan: "",
    status: 1,
  });
  const [promo, setPromo] = useState({
    nama: "",
  });
  const token = localStorage.getItem("token");
  const tax = 12 / 100;
  // --- Function
  const modalOpen = (param, bool) => {
    const setters = {
      add: setIsModalOpen,
      product: setIsModalOpenProductInfo,
      note: setIsnoteModalOpen,
      promo: setIsModalOpenPromo,
    };
    if (setters[param]) {
      setters[param](bool);
    }
  };

  // FETCH
  useEffect(() => {
    const fetchTable_cust = async () => {
      try {
        const response = await client.get("/table/listtable", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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
    const fetchItemCampaign = async () => {
      try {
        const response = await client.post(
          "/itemcampaign/listitemcampaigns",
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
            "Unexpected data format from /itemcampaign/listitemcampaign:",
            data
          );
          setItemCampaignList([]);
        } else {
          setItemCampaignList(data);
        }
      } catch (error) {
        console.error("Error fetching item campaign:", error);
        setItemCampaignList([]);
      }
    };
    fetchItemCampaign();
  }, []);
  useEffect(() => {
    const fetchSalesCampaign = async () => {
      try {
        const response = await client.post(
          "/salescampaign/listsalescampaign",
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
            "Unexpected data format from /salescampaign/listsalescampaign:",
            data
          );
          setSalesCampaignList([]);
        } else {
          setSalesCampaignList(data);
        }
      } catch (error) {
        console.error("Error fetching sales campaign:", error);
        setSalesCampaignList([]);
      }
    };
    fetchSalesCampaign();
  }, []);
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await client.post(
          "/order/listorder",
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
          console.error("Unexpected data format from /order/listorder:", data);
          setOrderList([]);
        } else {
          setOrderList(data);
        }
      } catch (error) {
        console.error("Error fetching Order:", error);
        setOrder([]);
      }
    };
    fetchOrder();
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
    const storedKasirItems = JSON.parse(
      localStorage.getItem("kasirItems") || "[]"
    );
    console.log("KASIR ITEMS:", localStorage.getItem("kasirItems"));
    setKasirItems(storedKasirItems);
  }, []);

  useEffect(() => {
    if (kasirItems[0]?.informasi) {
      setInfoBuyyer((prevInfo) => ({
        ...prevInfo,
        nama: kasirItems[0].informasi.person_name || "",
        keterangan: kasirItems[0].informasi.keterangan || "",
      }));
    }
  }, [kasirItems]);

  // FUNCTION
  // const handleCartUpdate = () => {
  //   setKasirItemsUpdate((prev) => !prev);
  // };

  const handleButtonClick = async (e) => {
    await handleSales(e);
  };

  const handleCardClick = async (product) => {
    try {
      const response = await client.post(
        "product/getproduct",
        {
          id: product._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const fetchedProduct = response.data;

      if (fetchedProduct.amount === 0) {
        alert("This product is out of stock.");
        return;
      }

      setSelectedProduct(fetchedProduct); // Set selected product with stock details
      modalOpen("add", false);
      modalOpen("product", true);
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };

  // Add Sales
  const handleSales = async (e) => {
    e.preventDefault();
    console.log("KASIR ITEMS:", kasirItems);
    try {
      const prepareSalesData = () => {
        const totalNumberItem = kasirItems.length;
        const salesDetail = kasirItems.map((item) => ({
          id_product: item.product.id,
          id_extras: item.selectedExtra ? item.selectedExtra._id : null,
          id_size: item.selectedSize ? item.selectedSize._id : null,
          id_company: item.product.id_company,
          id_store: item.product.id_store,
          id_item_campaign: item.product.id_item_campaign,
          name: item.product.name,
          product_code: item.product.code,
          item_price: Number(item.product.priceAfterDiscount),
          item_quantity: item.quantity,
          item_discount: 0,
        }));

        const formattedDate = moment().format("DD-MM-YY HH:mm:ss");

        const salesCode = `INV/${formattedDate}`;
        const tax = 0.12;
        const totalQty = kasirItems.reduce(
          (total, item) => total + item.quantity,
          0
        );
        const totalPrice = kasirItems.reduce(
          (total, item) =>
            total + item.product.priceAfterDiscount * item.quantity,
          0
        );
        const totalPriceWithTax = Math.max(
          kasirItems.reduce(
            (total, item) =>
              total + item.quantity * item.product.priceAfterDiscount,
            0
          ) *
            (1 - (salesDiskon || 0)) *
            (1 + tax),
          0
        );
        const id_user = localStorage.getItem("id_user");
        return {
          no: salesCode,
          id_user: id_user || "TIDAK TERDETEKSI LE", // Consider making this dynamic
          id_order: kasirItems[0]?.informasi
            ? kasirItems[0].informasi.id_order || null
            : null,
          id_sales_campaign: idSalesDiskon, // Consider making this dynamic
          id_payment_type: "67ae07107f2282a509936fb7",
          tax: tax,
          name: infoBuyyer.nama,
          status: infoBuyyer.status,
          keterangan: infoBuyyer.keterangan,
          total_price: totalPriceWithTax,
          total_quantity: totalQty,
          total_discount: salesDiskon,
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
        const orderId = kasirItems[0]?.informasi?.id_order || null;

        if (orderId != null || orderId != undefined) {
          const responseOrder = await client.put(
            `api/order/${orderId}`,
            {
              status: 1,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (responseOrder.status === 200) {
            await clearKasir();
            return Swal.fire("Success!", "Berhasil.", "success");
          }
        } else {
          await clearKasir();
        }
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
  const infoBuyyerHandleChange = (e) => {
    const { name, value } = e.target;
    setInfoBuyyer({
      ...infoBuyyer,
      [name]: value,
    });
  };

  const promohandleChange = (e) => {
    setPromo({ ...promo, nama: e.target.value });
  };

  const handleQuantityChange = async (
    index,
    params,
    id_product,
    newQuantity
  ) => {
    if (newQuantity < 1) {
      console.error("Quantity cannot be less than 1.");
      return;
    }

    // Deep copy untuk menghindari mutasi state langsung
    const updatedItems = JSON.parse(JSON.stringify(kasirItems));

    const currentItem = updatedItems[index];

    // Validasi stok tersedia
    const availableStock = currentItem.product.amount + 1;
    if (newQuantity > availableStock) {
      console.error("Cannot add more items than available stock.");
      return;
    }

    // Perbarui quantity dan total harga
    currentItem.quantity = newQuantity;
    currentItem.totalPrice =
      (currentItem.product?.priceAfterDiscount || 0) * newQuantity;

    // Tunggu reservasi stok dan perbarui reserved_amount
    const reserved_amount = await handleReserve(params, id_product, 1);
    currentItem.product.reserved_amount = reserved_amount;

    // Simpan perubahan ke state dan localStorage
    setKasirItems(updatedItems);
    localStorage.setItem("kasirItems", JSON.stringify(updatedItems));
  };

  const handleReserve = async (params, id_product, amount) => {
    try {
      const response = await client.put("/api/reserve", {
        action: params,
        id_product: id_product,
        quantity: amount,
      });

      return response.data.stock.reserved_amount; // Return the reserved amount
    } catch (error) {
      console.error("Error fetching product details:", error);
      return 0; // Return a default value in case of an error
    }
  };

  const handleSubmitPromo = async (e) => {
    e.preventDefault();

    const cekPromo = salesCampaignList.find(
      (scl) => scl.campaign_name === promo.nama
    );

    if (cekPromo) {
      console.log("Ada promo:", cekPromo);
      setIdSalesDiskon(cekPromo._id);
      setSalesDiskon(cekPromo.value); // Gunakan setState agar reaktif
      Swal.fire("Berhasil", "Promo Berhasil Diaktifkan!", "success");
      modalOpen("promo", false);
    } else {
      Swal.fire("Gagal", "Promo Tidak Ditemukan!", "error"); // "error" bukan "gagal"
      console.log("Tidak ada promo:", cekPromo);
    }
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

  // const handleQuantityChange = (index, newQuantity) => {
  //   // Prevent invalid quantities
  //   if (newQuantity < 1) {
  //     console.error("Quantity cannot be less than 1.");
  //     return;
  //   }

  //   // Get the current item from kasirItems
  //   const currentItem = kasirItems[index];
  //   // Check if the new quantity exceeds the available stock
  //   if (newQuantity > currentItem.product.amount + 1) {
  //     console.error("Cannot add more items than available stock.");
  //     return;
  //   }

  //   // Update the quantity and recalculate the total price
  //   const updatedItems = kasirItems.map((item, i) =>
  //     i === index
  //       ? {
  //           ...item,
  //           quantity: newQuantity,
  //           totalPrice: item.product.priceAfterDiscount * newQuantity,
  //         }
  //       : item
  //   );

  //   // Update state and local storage
  //   setKasirItems(updatedItems);
  //   localStorage.setItem("kasirItems", JSON.stringify(updatedItems)); // Save changes to localStorage
  // };

  const handleDeleteInfo = (index) => {
    const updatedItems = kasirItems.filter((_, i) => i !== index);
    setKasirItems(updatedItems);
    localStorage.setItem("kasirItems", JSON.stringify(updatedItems));
    // console.log("LATEST localStorage:", localStorage.getItem("kasirItems"));
  };

  const handleDelete = async (index, params, id_product, quantity) => {
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
      handleReserve(params, id_product, quantity);
      handleDeleteInfo(index);

      Swal.fire(
        "Terhapus!",
        "Item berhasil dihapus dari keranjang.",
        "success"
      );
    }
  };

  // Clear localStorage kasirItems
  const clearKasir = () => {
    try {
      // Reset all relevant states
      setSalesDiskon(null);
      setIdSalesDiskon(null);
      setPromo({ nama: "" });
      setTableNumber({ nomor: "" });
      setInfoBuyyer({ nama: "", keterangan: "", status: 1 });
      setKasirItems([]); // Reset the kasir state
      localStorage.setItem("kasirItems", JSON.stringify([]), { expires: 7 }); // Update localStorage

      // Show success message
      Swal.fire("Success!", "Berhasil order!", "success");
    } catch (error) {
      console.error("Error clearing kasir items:", error.message);
      Swal.fire("Error!", "Failed to clear kasir items.", "error");
    }
  };

  const addNewItems = (newItem) => {
    setKasirItems((prevItem) => [...prevItem, newItem]);
  };

  const addNewItem = async () => {
    if (!selectedProduct) {
      console.error("Produk tidak ditemukan!");
      return;
    }

    const existingIndex = kasirItems.findIndex(
      (item) =>
        item.product.id === selectedProduct._id &&
        item.selectedExtra?._id === selectedExtra &&
        item.selectedSize?._id === selectedSize
    );

    if (existingIndex !== -1) {
      kasirItems[existingIndex].quantity += quantity;
      handleReserve("add", selectedProduct._id, quantity);
      console.log("QTY", quantity);
      // ✅ Perbarui state products agar quantity bertambah
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === selectedProduct._id
            ? {
                ...product,
                id_stock: {
                  ...product.id_stock, // Salin semua properti di id_stock agar tidak hilang
                  reserved_amount:
                    (product.id_stock?.reserved_amount || 0) + quantity,
                },
              }
            : product
        )
      );

      console.log("PRODAK:", products);
    } else {
      const today = new Date().toISOString().split("T")[0];

      // Cek apakah produk masuk dalam kampanye diskon
      const campaign = itemCampaignList.find(
        (icl) =>
          icl._id === selectedProduct.id_item_campaign &&
          icl.start_date <= today &&
          icl.end_date >= today
      );

      const discountValue = campaign?.value || 0;
      const informasi = kasirItems.find((ki) => ki.informasi != null);
      handleReserve("add", selectedProduct._id, quantity);

      const baseItem = {
        product: {
          id: selectedProduct._id,
          code: selectedProduct.product_code,
          id_company: selectedProduct.id_company,
          id_store: selectedProduct.id_store,
          id_item_campaign: selectedProduct.id_item_campaign || null,
          name: selectedProduct.name_product,
          image: selectedProduct.image,
          price: selectedProduct.sell_price,
          diskon: discountValue,
          priceAfterDiscount: selectedProduct.sell_price * (1 - discountValue),
          amount: selectedProduct.amount,
          reserved_amount: quantity || 0,
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

      let newItem;
      if (!informasi) {
        newItem = baseItem;
        console.log("Item baru (tanpa informasi)", newItem);
      } else {
        newItem = {
          informasi: {
            id_order: informasi.informasi.id_order,
            code: informasi.informasi.code,
            id_table_cust: informasi.informasi.id_table_cust,
            person_name: informasi.informasi.person_name,
          },
          ...baseItem,
        };
        console.log("Item baru (dengan informasi)", newItem);
      }

      addNewItems(newItem);

      // ✅ Tambahkan item baru ke `products`
      setProducts((prevProducts) => [...prevProducts, newItem]);

      // ✅ Perbarui reserved_amount produk
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === selectedProduct._id
            ? {
                ...product,
                id_stock: {
                  ...product.id_stock, // Pastikan id_stock tetap ada
                  reserved_amount:
                    (product.id_stock?.reserved_amount || 0) + quantity,
                },
              }
            : product
        )
      );
    }

    modalOpen("product", false);
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
              htmlFor="infoBuyyer"
              className="absolute top-2 left-4 text-sm text-black-500 bg-white px-1 font-semibold"
            >
              Masukkan Nama
            </label>
            {kasirItems[0]?.informasi ? (
              <input
                id="infoBuyyerName"
                type="text"
                name="nama"
                value={kasirItems[0].informasi.person_name || "error"}
                disabled={true}
                className="bg-white shadow-md border p-4 h-20 rounded-lg w-full text-black placeholder-black"
              />
            ) : (
              <input
                id="infoBuyyerName"
                type="text"
                name="nama"
                value={infoBuyyer?.nama || ""}
                onChange={infoBuyyerHandleChange}
                className="bg-white shadow-md border p-4 h-20 rounded-lg w-full text-black placeholder-black"
              />
            )}
          </div>
          <div className="relative w-full">
            <label className="absolute top-2 left-4 text-sm text-black-500 bg-white px-1 font-semibold">
              Nomor Meja
            </label>
            <select
              id="nomer"
              name="id_table_cust"
              className="bg-white shadow appearance-none border rounded w-full p-4 h-20 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={
                kasirItems[0]?.informasi?.id_table_cust || tableNumber.nomor
              }
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
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold mb-1">Pesanan</h2>
            <button onClick={() => modalOpen("add", true)} className="addBtn">
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
                  {/* <p>{item.product.diskon ? item.product.diskon : "manok"}</p> */}

                  <div className="flex items-center">
                    <p className="font-semibold mr-4 relative">
                      {item.product.price != item.product.priceAfterDiscount ? (
                        <s className="font-bold text-sm mr-4 text-red-500 italic absolute -top-5 -left-5">
                          Rp.
                          {new Intl.NumberFormat("id-ID").format(
                            item.product.price
                          )}
                        </s>
                      ) : null}
                      Rp.
                      {new Intl.NumberFormat("id-ID").format(
                        item.product.priceAfterDiscount
                      )}
                    </p>
                    {/* Harga satuan */}
                    <div className="flex items-center">
                      <input
                        type="number"
                        value={item.quantity}
                        min="1"
                        readOnly
                        className="text-center bg-transparent text-lg w-8 outline-none border-none"
                      />
                      {console.log("ITEMNYA LE:", item)}
                      <div className="flex flex-col items-center ml-2 -space-y-2.5">
                        <button
                          // onClick={() =>
                          //   handleQuantityChange(index, item.quantity + 1)
                          // }
                          onClick={() =>
                            item.product.amount -
                              item.product.reserved_amount ===
                            0
                              ? {}
                              : handleQuantityChange(
                                  index,
                                  "add",
                                  item.product.id,
                                  item.quantity + 1
                                )
                          }
                          className={`text-lg bg-transparent p--4 leading-none ${
                            item.product.amount -
                              item.product.reserved_amount ===
                            0
                              ? "opacity-50"
                              : ""
                          }`}
                        >
                          <TiArrowSortedUp />
                        </button>
                        <button
                          onClick={() =>
                            item.quantity <= 1
                              ? {}
                              : handleQuantityChange(
                                  index,
                                  "remove",
                                  item.product.id,
                                  item.quantity - 1
                                )
                          }
                          className={`text-lg bg-transparent p--4 leading-none ${
                            item.quantity <= 1 ? "opacity-50" : ""
                          }`}
                        >
                          <TiArrowSortedDown />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        handleDelete(
                          index,
                          "remove",
                          item.product.id,
                          item.quantity
                        )
                      }
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
        <div className="flex justify-between">
          <div>
            <button
              className={`${
                kasirItems[0]?.informasi || infoBuyyer.keterangan
                  ? "addBtn"
                  : "closeBtn"
              } flex items-center space-x-3`}
              onClick={() => modalOpen("note", true)}
            >
              <CgNotes className="w-5 h-5" /> <span>+ Tambah Catatan</span>
            </button>
            {/* Menampilkan tulisan kecil jika textarea terisi */}
            {(kasirItems[0]?.informasi ||
              infoBuyyer.keterangan.trim() !== "") && (
              <p className="text-gray-500 text-sm mt-2">Catatan terisi</p>
            )}
          </div>
          <select
            className="select bg-white"
            value={infoBuyyer.status}
            name="status"
            onChange={(e) => infoBuyyerHandleChange(e)}
          >
            <option value={1}>Active</option>
            <option value={2}>Pending</option>
            {/* Tambahkan opsi lain jika diperlukan di masa depan */}
          </select>
        </div>
        <div className="mt-6 text-right">
          <p className="text-lg font-bold mb-4">
            Sub Total: Rp.
            {new Intl.NumberFormat("id-ID").format(
              kasirItems.reduce(
                (total, item) =>
                  total + item.quantity * item.product.priceAfterDiscount,
                0
              )
            )}
          </p>
          <p className="text-lg font-bold mb-4">
            Diskon: {salesDiskon != null ? salesDiskon * 100 : "-"}%
          </p>
          <p className="text-lg font-bold mb-4">Pajak: {tax * 100}%</p>
          <p className="text-lg font-bold mb-4">
            Total: Rp.
            {new Intl.NumberFormat("id-ID").format(
              Math.max(
                kasirItems.reduce(
                  (total, item) =>
                    total + item.quantity * item.product.priceAfterDiscount,
                  0
                ) *
                  (1 - (salesDiskon || 0)) *
                  (1 + tax), // Kurangi diskon dulu, lalu tambahkan pajak
                0
              )
            )}
          </p>
          <div className="flex justify-start">
            <button
              onClick={() => modalOpen("promo", true)}
              className={`addBtn ${salesDiskon != null ? "opacity-50" : ""}`}
              disabled={salesDiskon != null ? true : false}
            >
              Masukkan Kode Promo
            </button>
          </div>
          <div className="flex justify-end">
            <button onClick={handleButtonClick} className="submitBtn">
              Bayar
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <Modal onClose={() => modalOpen("add", false)} title={"Tambah Pesanan"}>
          <br />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {console.log("PRODUCTS:", products)}
            {products.map((product) => {
              const today = new Date().toISOString().split("T")[0];
              const campaign = itemCampaignList.find(
                (icl) =>
                  icl._id === product.id_item_campaign &&
                  icl.start_date <= today &&
                  icl.end_date >= today
              );

              const discountValue = campaign?.value || 0;
              const discountedPrice = Math.max(
                product.sell_price * (1 - discountValue),
                0
              );
              const originalPrice = product.sell_price;

              return (
                <div
                  key={product._id}
                  onClick={
                    product?.id_stock
                      ? product.id_stock.amount -
                          product.id_stock.reserved_amount >
                        0
                        ? () => handleCardClick(product)
                        : () => {}
                      : () => {}
                  }
                >
                  <Card
                    className="w-full object-cover"
                    image={product.image || "https://placehold.co/100x100"}
                    nama={product.name_product}
                    stock={Math.max(
                      product?.id_stock?.amount -
                        product?.id_stock?.reserved_amount,
                      0
                    )}
                    diskon={discountValue}
                    harga={`Rp ${new Intl.NumberFormat("id-ID").format(
                      discountedPrice
                    )}`}
                    hargaDiskon={
                      discountValue
                        ? `Rp ${new Intl.NumberFormat("id-ID").format(
                            originalPrice
                          )}`
                        : null
                    }
                  />
                </div>
              );
            })}
          </div>
        </Modal>
      )}

      {isModalOpenPromo && (
        <Modal
          onClose={() => modalOpen("promo", false)}
          title="Masukkan Kode Promo"
        >
          <form onSubmit={handleSubmitPromo}>
            <input
              type="text"
              value={promo?.nama || ""}
              onChange={promohandleChange}
              placeholder="Masukkan Kode Promo..."
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-300 bg-white"
            />
            <button>Submit</button>
          </form>
        </Modal>
      )}

      {isnoteModalOpen && (
        <Modal onClose={() => modalOpen("note", false)}>
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
      {isModalOpenProductInfo && (
        <Modal
          onClose={() => modalOpen("product", false)}
          title={selectedProduct?.name_product}
        >
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
            <div className="flex flex-col items-center mt-4">
              <div className="flex items-center place-content-center">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))} // Prevent quantity from going below 1
                  className="py-2 px-3 border border-black rounded-md"
                  disabled={quantity <= 1} // Disable button if quantity is 1
                >
                  <FaMinus />
                </button>

                {/* Styled input with no spinners */}
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
                  disabled={
                    quantity >=
                    selectedProduct?.amount -
                      (selectedProduct?.reserved_amount || 0)
                  }
                >
                  <FaPlus />
                </button>
              </div>

              {/* Show stock warning message when quantity exceeds available stock */}
              {quantity > selectedProduct?.amount && (
                <p className="text-red-500 mt-2">
                  Stok produk ini hanya {selectedProduct?.amount}
                </p>
              )}
            </div>

            <style jsx>{`
              /* Remove spinners for WebKit browsers (Chrome, Safari, etc.) */
              .spinner-none::-webkit-inner-spin-button,
              .spinner-none::-webkit-outer-spin-button {
                -webkit-appearance: none;
                margin: 0;
              }

              /* Remove spinners for Firefox */
              .spinner-none {
                -moz-appearance: textfield;
              }
            `}</style>

            <button
              onClick={addNewItem}
              className={`mt-4 w-full p-2 rounded-md ${
                quantity === 0 ? "closeBtn" : "addBtn"
              }`}
              disabled={quantity === 0 ? true : false}
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
