import React, { useEffect, useState, useRef } from "react";
import moment from "moment";
import Image from "next/image";
import Swal from "sweetalert2";

// Icon
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti";
import { VscTrash } from "react-icons/vsc";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { CgNotes } from "react-icons/cg";
import { IoMdArrowRoundBack, IoIosArrowDropdown } from "react-icons/io";

// import axios from "axios";

import client from "@/libs/axios";
import Card from "@/components/Card";
import { Modal } from "@/components/Modal";

import { fetchProductsList } from "@/libs/fetching/product";

const Kasir = () => {
  const [products, setProducts] = useState([]);
  const [table_custList, setTable_custList] = useState([]);
  const [orderList, setOrderList] = useState([]);
  const [itemCampaignList, setItemCampaignList] = useState([]);
  const [salesCampaignList, setSalesCampaignList] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  //   const [orderList, setOrderList] = useState([]);
  //   const orderListRef = useRef(orderList); // Create a ref to track the latest state
  const [kasirItems, setKasirItems] = useState([]);
  const [kasirItemsUpdate, setKasirItemsUpdate] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedExtra, setSelectedExtra] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  // State untuk modal
  const [isModalOpenPay, setIsModalOpenPay] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenPromo, setIsModalOpenPromo] = useState(false);
  const [isModalOpenProductInfo, setIsModalOpenProductInfo] = useState(false);
  const [isnoteModalOpen, setIsnoteModalOpen] = useState(false);
  const [salesDiskon, setSalesDiskon] = useState(null); // Gunakan useState
  const [idSalesDiskon, setIdSalesDiskon] = useState(null); // Gunakan useState
  const [payments, setPayments] = useState([]);
  const [infoBuyyer, setInfoBuyyer] = useState({
    nama: "",
    keterangan: "",
    status: 1,
  });
  const [promo, setPromo] = useState({
    nama: "",
  });
  const [expandedPayments, setexpandedPayments] = useState({});
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [tableNumber, setTableNumber] = useState({
    nomor: "",
  });

  const token = localStorage.getItem("token");
  const id_store =
    localStorage.getItem("id_store") == "undefined"
      ? null
      : localStorage.getItem("id_store");
  const tax = 12 / 100;
  // --- Function
  const modalOpen = async (param, bool) => {
    const setters = {
      add: setIsModalOpen,
      product: setIsModalOpenProductInfo,
      note: setIsnoteModalOpen,
      promo: setIsModalOpenPromo,
      pay: setIsModalOpenPay,
    };

    if (param === "add" && bool) {
      await fetchProduct(); // 🔥 Fetch first before opening modal
    }

    if (setters[param]) {
      setters[param](bool);
    }
  };

  // FETCH
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await client.post("/payment/listpayment", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Flatten the paymentName arrays into a single list
        const flattenedPayments = response.data.flatMap((paymentType) =>
          paymentType.paymentName.map((payment) => ({
            ...payment,
            payment_method: paymentType.payment_method,
          }))
        );

        setPayments(flattenedPayments);
      } catch (error) {
        console.error("Error fetching payments:", error);
        setError("Failed to load payment methods. Please try again later.");
      }
    };
    fetchPayments();
  }, []);
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
          { id_store },
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
    const storedKasirItems = JSON.parse(
      localStorage.getItem("kasirItems") || "[]"
    );
    setKasirItems(storedKasirItems);
  }, []);

  useEffect(() => {
    if (kasirItems[0]?.informasi) {
      setInfoBuyyer((prevInfo) => ({
        ...prevInfo,
        keterangan: kasirItems[0].informasi.keterangan || "",
        nama: kasirItems[0].informasi.person_name || "",
      }));
    }
  }, [kasirItems]);

  const fetchProduct = async () => {
    const data_product = await fetchProductsList(id_store, null, null, "order");
    setProducts(data_product);
  };

  const handleCartUpdate = () => {
    setKasirItemsUpdate((prev) => !prev);
    modalOpen("product", false);
  };

  const handleButtonClick = async (e) => {
    await handleSales(e);
  };

  const handleCardClick = async (product) => {
    try {
      // Filter the products array to find the product with the matching _id
      const selectedProductFromState = products.find(
        (p) => p._id === product._id
      );

      if (selectedProductFromState) {
        setSelectedProduct(selectedProductFromState); // Set the selected product
        modalOpen("add", false);
        modalOpen("product", true);
      } else {
        console.warn("Product not found in the current state!");
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      alert("An error occurred while fetching the product.");
    }
  };

  // Add Sales

  const handleSales = async (e) => {
    e.preventDefault();
    try {
      const prepareSalesData = () => {
        const totalNumberItem = kasirItems.length;
        const insufficientItems = kasirItems.filter((item) => {
          const { amount, orderQty = 0 } = item.product;
          const qtyBefore = item.qty_before || 0;

          // Jika stok barang benar-benar kosong, langsung dianggap tidak cukup
          if (amount === 0) return true;

          // Hitung stok tersedia
          const availableStock = amount - orderQty + qtyBefore;

          // Jika jumlah yang diminta lebih dari stok tersedia, item dianggap tidak cukup
          return item.quantity > availableStock;
        });

        // will insufficient if item.product.amount === 0, if not 0, then calculate by - orderQty and qty_before
        if (insufficientItems.length > 0) {
          const errorMessage = insufficientItems
            .map((item) => {
              const { name, amount, orderQty = 0 } = item.product;
              const qtyBefore = item.qty_before || 0;
              const availableStock = amount - orderQty + qtyBefore;

              return `- ${name}: Stok hanya ada ${availableStock}, tetapi Anda memesan ${item.quantity}`;
            })
            .join("<br>");

          Swal.fire({
            title: "Stok tidak mencukupi!",
            html: `<div style="text-align: left;">
                      Berikut adalah item dengan stok tidak mencukupi:<br>${errorMessage}
                   </div>`,
            icon: "error",
          });

          return null; // Hentikan eksekusi jika stok tidak cukup
        }
        console.log("INI BISA");
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
          totalPrice * (1 - (salesDiskon || 0)) * (1 + tax),
          0
        );

        const id_user = localStorage.getItem("id_user");
        return {
          no: salesCode,
          id_user: id_user,
          id_order: kasirItems[0]?.informasi?.id_order || null,
          id_sales_campaign: idSalesDiskon,
          // id_payment_type: "67ae07107f2282a509936fb7",
          id_payment_type: selectedMethod._id,
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

      const salesData = prepareSalesData();

      if (!salesData) return; // Hentikan eksekusi jika stok tidak cukup

      console.log("SELES", salesData);
      const response = await client.post("sales/addsales", salesData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 201) {
        for (const item of kasirItems) {
          console.log("ITEM WAK", item);
          await client.put(
            "/api/stock",
            {
              amount: item.quantity,
              params: "out",
              id_product: item.product.id,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }

        const orderId = kasirItems[0]?.informasi?.id_order || null;

        if (orderId) {
          const responseOrder = await client.put(
            `api/order/${orderId}`,
            { status: 1 },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (responseOrder.status === 200) {
            await clearKasir();
            Swal.fire("Success!", "Pembayaran Berhasil.", "success");
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

  const handleSubmitPromo = async (e) => {
    e.preventDefault();
    console.log("PEROMO", promo);
    console.log("SELES KEMPING", salesCampaignList);
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

  const tableHandleChange = (e) => {
    setTableNumber({
      ...tableNumber,
      nomor: e.target.value,
    });
  };

  const handleDeleteInfo = (index) => {
    const updatedItems = kasirItems.filter((_, i) => i !== index);

    setKasirItems(updatedItems);
    localStorage.setItem("kasirItems", JSON.stringify(updatedItems));

    // Use updatedItems instead of kasirItems
    if (!updatedItems[0]?.informasi) {
      setInfoBuyyer({ nama: "", keterangan: "", status: 1 });
    }
  };

  const handleDelete = async (index, id_product, quantity) => {
    if (!kasirItems[index]) {
      console.error("Index tidak valid:", index);
      return;
    }

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
      try {
        handleDeleteInfo(index);

        Swal.fire(
          "Terhapus!",
          "Item berhasil dihapus dari keranjang.",
          "success"
        );
      } catch (error) {
        console.error("Error updating stock:", error);
        Swal.fire("Gagal!", "Terjadi kesalahan saat menghapus item.", "error");
      }
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
    } catch (error) {
      console.error("Error clearing kasir items:", error.message);
      Swal.fire("Error!", "Failed to clear kasir items.", "error");
    }
  };
  const handleQuantityChange = async (index, newQuantity) => {
    // Validate the new quantity
    if (isNaN(newQuantity) || newQuantity < 1) return; // Ignore invalid or out-of-range values

    // Deep copy the cart items to avoid state mutation issues
    const updatedItems = [...kasirItems];
    updatedItems[index] = {
      ...updatedItems[index],
      quantity: newQuantity,
      totalPrice:
        updatedItems[index].product?.priceAfterDiscount * newQuantity || 0,
    };

    // Update state and localStorage
    setKasirItems(updatedItems);
    localStorage.setItem("kasirItems", JSON.stringify(updatedItems));
  };

  const addNewItems = (newItem) => {
    setKasirItems((prevItems) => {
      const updatedItems = [...prevItems, newItem];
      localStorage.setItem("kasirItems", JSON.stringify(updatedItems));
      return updatedItems;
    });
  };

  // Add to kasirItems
  const handleAddToCart = async () => {
    const existingIndex = findExistingItemIndex();

    if (existingIndex !== -1) {
      updateExistingItem(existingIndex);
    } else {
      const newItem = createNewItem();
      addNewItems(newItem);
    }

    handleCartUpdate();
  };

  // Find item in kasirItems
  const findExistingItemIndex = () => {
    return kasirItems.findIndex(
      (item) =>
        item.product.id === selectedProduct._id &&
        (item.selectedExtra?._id || null) === (selectedExtra || null) &&
        (item.selectedSize?._id || null) === (selectedSize || null)
    );
  };

  // Update existing item in cart
  const updateExistingItem = (index) => {
    setKasirItems((prevItems) => {
      const updatedItems = [...prevItems];
      updatedItems[index] = {
        ...updatedItems[index],
        quantity: updatedItems[index].quantity + quantity,
      };
      localStorage.setItem("kasirItems", JSON.stringify(updatedItems));
      return updatedItems;
    });
  };

  const createNewItem = () => {
    const today = new Date().toISOString().split("T")[0];
    const campaign = findActiveCampaign(today);
    const discountValue = campaign ? campaign.value : 0;
    const baseProduct = {
      id: selectedProduct._id,
      product_code: selectedProduct.product_code,
      id_company: selectedProduct.id_company,
      id_store: selectedProduct.id_store,
      id_item_campaign: selectedProduct.id_item_campaign || null,
      name: selectedProduct.name_product,
      image: selectedProduct.image,
      price: selectedProduct.sell_price,
      diskon: discountValue,
      amount: selectedProduct?.id_stock?.amount,
      orderQty: selectedProduct.orderQty,
      priceAfterDiscount: selectedProduct.sell_price * (1 - discountValue),
    };

    const newItem = {
      product: baseProduct,
      quantity,
      selectedExtra: getSelectedExtra(),
      selectedSize: getSelectedSize(),
    };

    const informasi = kasirItems.find((ki) => ki.informasi != null);
    if (informasi) {
      newItem.informasi = {
        id_order: informasi.informasi.id_order,
        code: informasi.informasi.code,
        id_table_cust: informasi.informasi.id_table_cust,
        person_name: informasi.informasi.person_name,
      };
    }

    return newItem;
  };
  const findActiveCampaign = (today) => {
    return itemCampaignList.find(
      (campaign) =>
        campaign._id === selectedProduct.id_item_campaign &&
        campaign.start_date <= today &&
        campaign.end_date >= today
    );
  };
  const getSelectedExtra = () => {
    if (!selectedExtra) return null;

    return {
      _id: selectedExtra,
      name: selectedProduct?.id_extras?.extrasDetails.find(
        (extra) => extra._id === selectedExtra
      )?.name,
    };
  };
  const getSelectedSize = () => {
    if (!selectedSize) return null;

    return {
      _id: selectedSize,
      name: selectedProduct?.id_size?.sizeDetails.find(
        (size) => size._id === selectedSize
      )?.name,
    };
  };

  // Payment
  // Group payments by payment_method
  const groupedPayments = payments.reduce((acc, payment) => {
    if (!acc[payment.payment_method]) {
      acc[payment.payment_method] = [];
    }
    acc[payment.payment_method].push(payment);
    return acc;
  }, {});

  // Toggle payments expansion
  const togglePayments = (payments) => {
    setexpandedPayments((prev) => ({
      ...prev,
      [payments]: !prev[payments],
    }));
  };

  return (
    <div className="bg-[#F7F7F7] w-full pt-16 h-screen">
      <div className="p-4 mx-auto max-w-4xl">
        <div className="flex items-center mb-4">
          <h1 className="text-2xl font-semibold">SALES</h1>
        </div>
        <div className="h-[1.5px] bg-gray-300 w-full mb-6"></div>

        <div className="grid grid-cols-2 gap-4 mb-6 bg-white">
          {/* Input Nama */}
          <div className="relative w-full">
            <label
              htmlFor="infoBuyyerNama"
              className="absolute top-2 left-4 text-sm text-gray-500 bg-white px-1 font-semibold"
            >
              Masukkan Nama
            </label>
            <input
              id="infoBuyyerNama"
              type="text"
              name="nama"
              value={infoBuyyer?.nama}
              onChange={infoBuyyerHandleChange}
              className="bg-white shadow-md border p-4 h-20 rounded-lg w-full text-black placeholder-black"
            />
          </div>

          {/* Select Nomor Meja */}
          <div className="relative w-full">
            <label
              htmlFor="nomer"
              className="absolute top-2 left-4 text-sm text-gray-500 bg-white px-1 font-semibold"
            >
              Nomor Meja
            </label>
            <select
              id="nomer"
              name="id_table_cust"
              className="bg-white shadow-md border rounded-lg w-full p-4 h-20 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={
                kasirItems?.[0]?.informasi?.id_table_cust ??
                tableNumber.nomor ??
                ""
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
                  {/* {console.log("ITEMNYA", item)} */}

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
                    {/* Hanya tampilkan size atau extra yang dipilih, dipisahkan dengan koma */}
                    <div className="flex">
                      <p className="text-sm">
                        {[
                          item.selectedSize?.name || "Ukuran tidak ada",
                          item.selectedExtra?.name || "Varian tidak ada",
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
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
                            handleQuantityChange(
                              index,
                              Math.max(item.quantity - 1, 1)
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
                        handleDelete(index, item.product.id, item.quantity)
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
            name={"status"}
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
            <button
              onClick={() => modalOpen("pay", true)}
              className="submitBtn"
            >
              Bayar
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <Modal onClose={() => modalOpen("add", false)} title={"Tambah Pesanan"}>
          <br />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product._id}
                onClick={
                  (product?.id_stock?.amount || 0) - (product?.orderQty || 0) >
                  0
                    ? () => handleCardClick(product)
                    : null
                }
                className={
                  (product?.id_stock?.amount || 0) - (product?.orderQty || 0) >
                  0
                    ? "cursor-pointer" // Indicates the div is clickable
                    : "cursor-not-allowed " // Indicates the div is not clickable
                }
              >
                {console.log("PRODAK", product)}
                <Card
                  lebar={50}
                  tinggi={50}
                  image={product.image || "https://placehold.co/100x100"}
                  nama={product.name_product}
                  stock={
                    (product?.id_stock?.amount || 0) - (product?.orderQty || 0)
                  }
                  harga={`Rp ${new Intl.NumberFormat("id-ID").format(
                    Math.max(
                      product.sell_price *
                        (1 -
                          (product.id_item_campaign
                            ? itemCampaignList.find((icl) => {
                                const today = new Date()
                                  .toISOString()
                                  .split("T")[0];
                                return (
                                  icl._id === product.id_item_campaign &&
                                  icl.start_date <= today &&
                                  icl.end_date >= today
                                );
                              })?.value || 0
                            : 0)),
                      0 // Pastikan harga tidak negatif
                    )
                  )}`}
                />
              </div>
            ))}
          </div>
        </Modal>
      )}
      {/* {isModalOpenPromo && (
        <Modal
          onClose={() => modalOpen("promo", false)}
          title="Masukkan Kode Promo"
        >
          <form onSubmit={handleSubmitPromo}>
            <button>Submit</button>
          </form>
        </Modal>
      )} */}

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
          onClose={() => {
            modalOpen("product", false);
            modalOpen("add", true);
          }}
          title={selectedProduct?.name_product}
        >
          <div>
            {console.log("SELEKTED LE", selectedProduct)}

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
                    (selectedProduct?.id_stock?.amount || 0) -
                      selectedProduct?.orderQty
                  } // Prevent exceeding stock
                >
                  <FaPlus />
                </button>
              </div>
              {/* Show stock warning message when quantity exceeds available stock */}
              {quantity >
                (selectedProduct?.id_stock?.amount || 0) -
                  selectedProduct?.orderQty && (
                <p className="text-red-500 mt-2">
                  Stok produk ini hanya{" "}
                  {(selectedProduct?.id_stock?.amount || 0) -
                    selectedProduct?.orderQty}
                </p>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              className={`mt-4 w-full p-2 rounded-md ${
                quantity === 0 ||
                quantity >
                  ((selectedProduct?.id_stock?.amount || 0) -
                    (selectedProduct?.orderQty || 0) || 0)
                  ? "closeBtn"
                  : "addBtn"
              }`}
              disabled={
                quantity === 0 ||
                quantity >
                  ((selectedProduct?.id_stock?.amount || 0) -
                    (selectedProduct?.orderQty || 0) || 0)
              }
            >
              Tambah ke Keranjang
            </button>
          </div>
        </Modal>
      )}

      {isModalOpenPay && (
        <Modal onClose={() => modalOpen("pay", false)} title={"Pembayaran"}>
          {/* bg-opacity dan blur biar gak ngelag */}
          <div className="bg-opacity-100">
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
                {kasirItems.map((item, index) => (
                  <div key={index} className="flex justify-between py-2">
                    <p className="w-1/2 font-semibold">{item.product.name}</p>
                    <p className="w-1/4 text-center">{item.quantity}</p>
                    <p className="w-1/4 text-right font-semibold">
                      Rp {item.product.price.toLocaleString()}
                    </p>
                  </div>
                ))}

                {/* Biaya Kirim */}
                <div className="flex justify-between text-green-500 font-semibold mt-2">
                  <p>Jumlah Item</p>
                  <p>{kasirItems.length}</p>
                </div>

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
                    {kasirItems
                      .reduce(
                        (total, item) =>
                          total + item.quantity * item.product.price,
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
                {Object.keys(groupedPayments).map((payments) => (
                  <div key={payments}>
                    {/* Payments Header */}
                    <div
                      className="flex items-center justify-between cursor-pointer p-2 bg-gray-100 rounded-md hover:bg-gray-200"
                      onClick={() => togglePayments(payments)}
                    >
                      <span className="font-semibold">{payments}</span>
                      <span
                        className={`transition-transform duration-200 ${
                          expandedPayments[payments] ? "rotate-180" : ""
                        }`}
                      >
                        <IoIosArrowDropdown />
                      </span>
                    </div>

                    {/* Payment Methods (Dropdown Content) */}
                    {expandedPayments[payments] && (
                      <div className="pl-4 mt-2 space-y-2">
                        {groupedPayments[payments].map((payment) => (
                          <label
                            key={payment._id}
                            className="flex items-center cursor-pointer w-full p-2 gap-3 rounded-md hover:bg-orange-50 peer-checked:bg-orange-50"
                          >
                            <div className="relative w-6 h-6 flex items-center justify-center">
                              <div className="absolute w-5 h-5 bg-white rounded-full border-2 border-gray-400"></div>
                              <input
                                type="radio"
                                name="paymentMethod"
                                value={payment._id}
                                checked={selectedMethod?._id === payment._id}
                                onChange={() => setSelectedMethod(payment)}
                                className="peer relative w-5 h-5 rounded-full border-2 border-gray-400 appearance-none checked:border-orange-500 transition-all duration-200"
                                aria-label={payment.payment_name}
                              />
                              <div className="absolute w-3 h-3 bg-orange-500 rounded-full scale-0 peer-checked:scale-100 transition-all duration-200"></div>
                            </div>
                            <div className="flex items-center justify-center gap-5">
                              <img
                                src={payment.image}
                                alt={`${payment.payment_name} logo`}
                                className="object-contain w-8 h-8"
                              />
                              <span>{payment.payment_name}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* Kupon Promo */}
            <div className="border rounded-lg shadow-md overflow-hidden">
              <form onSubmit={handleSubmitPromo}>
                <div className="bg-orange-500 text-white p-3 font-bold">
                  Kupon Promo
                </div>
                <div className="p-4">
                  <input
                    type="text"
                    value={promo?.nama || ""}
                    onChange={promohandleChange}
                    placeholder="Masukkan Kode Promo..."
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-300 bg-white"
                  />
                </div>
                <button className="addBtn">Add Promo</button>
              </form>
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

export default Kasir;
