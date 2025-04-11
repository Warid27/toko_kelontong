import React, { useEffect, useState, useRef } from "react";
import moment from "moment";
import ImageWithFallback from "@/utils/ImageWithFallback";
import Topbar from "@/components/Topbar";
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti";
import { IoMdArrowRoundBack, IoIosArrowDropdown } from "react-icons/io";
import { CgNotes } from "react-icons/cg";
import { VscTrash } from "react-icons/vsc";
import Swal from "sweetalert2"; // Import sweetalert2
import { Modal } from "@/components/Modal";
import { fetchItemCampaignList } from "@/libs/fetching/itemCampaign";
import { fetchProductsList } from "@/libs/fetching/product";
import { toast } from "react-toastify";
import { addOrder, fetchOrderList } from "@/libs/fetching/order";
import { fetchTableList } from "@/libs/fetching/table";

const Cart = () => {
  // const [payments, setPayments] = useState([]);
  const [table_custList, setTable_custList] = useState([]);
  const [orderList, setOrderList] = useState([]);
  const orderListRef = useRef(orderList); // Create a ref to track the latest state
  const [cartItems, setCartItems] = useState([]);
  const [isnoteModalOpen, setIsnoteModalOpen] = useState(false);
  const [itemCampaignList, setItemCampaignList] = useState([]);
  const [productList, setProductList] = useState([]);

  // Function
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Update the ref whenever the state changes
  useEffect(() => {
    orderListRef.current = orderList;
  }, [orderList]);

  // FETCH

  useEffect(() => {
    const fetching_requirement = async () => {
      const get_itemCampaign_list = async () => {
        const data_itemCampaign = await fetchItemCampaignList();
        setItemCampaignList(data_itemCampaign);
      };
      // const get_product_list = async () => {
      //   const data_product = await fetchProductsList(null, null, null, "order");
      //   set(data_company);
      // };
      get_itemCampaign_list();
      // setIsLoading(false);
    };
    fetching_requirement();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetchProductsList(
          null,
          null,
          null,
          "order",
          null
        );
        const fullProductList = response.data;

        const storedCartItems = JSON.parse(
          localStorage.getItem("cartItems") || "[]"
        );

        // Merge cart items with full product details
        const updatedCartItems = storedCartItems
          .map((cartItem) => {
            const matchingProduct = fullProductList.find(
              (product) => product._id === cartItem.id_product
            );
            if (!matchingProduct) return null; // Skip if no matching product

            const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

            // Find active campaign for the product
            const campaign = itemCampaignList.find(
              (icl) =>
                icl._id === matchingProduct.id_item_campaign &&
                icl.start_date <= today &&
                icl.end_date >= today
            );
            const discountValue = campaign?.value || 0;
            const priceAfterDiscount =
              matchingProduct.sell_price * (1 - discountValue);

            return {
              product: {
                id: matchingProduct._id,
                id_store: matchingProduct.id_store,
                id_company: matchingProduct.id_company,
                name: matchingProduct.name_product,
                image: matchingProduct.image,
                price: matchingProduct.sell_price,
                amount: matchingProduct.id_stock?.amount,
                orderQty: matchingProduct.orderQty,
                priceAfterDiscount: priceAfterDiscount,
                discount: discountValue,
              },
              quantity: cartItem.quantity,
              selectedExtra: cartItem.id_extras
                ? {
                    _id: cartItem.id_extras,
                    name:
                      matchingProduct?.id_extras?.extrasDetails?.find(
                        (extra) => extra._id === cartItem.id_extras
                      )?.name || "Tidak ditemukan",
                  }
                : null,
              selectedSize: cartItem.id_size
                ? {
                    _id: cartItem.id_size,
                    name:
                      matchingProduct?.id_size?.sizeDetails?.find(
                        (size) => size._id === cartItem.id_size
                      )?.name || "Tidak ditemukan",
                  }
                : null,
            };
          })
          .filter(Boolean); // Remove null values

        setCartItems(updatedCartItems);
      } catch (error) {
        toast.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [itemCampaignList]);

  useEffect(() => {
    const fetchTable_cust = async () => {
      try {
        const response = await fetchTableList();
        const data = response.data;

        // Validate that the response is an array
        if (!Array.isArray(data)) {
          toast.error("Unexpected data format from /table/listtable:", data);
          setTable_custList([]);
        } else {
          setTable_custList(data);
        }
      } catch (error) {
        toast.error("Error fetching table_cust:", error);
        setTable_custList([]);
      }
    };
    fetchTable_cust();
  }, []);
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetchOrderList(null, "all");
        const data = response.data;

        // Validate that the response is an array
        if (!Array.isArray(data)) {
          toast.error("Unexpected data format from order", data);
          setOrderList([]);
        } else {
          // Append new orders to the existing orderList state
          setOrderList((prevOrderList) => {
            const uniqueOrders = [
              ...prevOrderList,
              ...data.filter(
                (newOrder) =>
                  !prevOrderList.some(
                    (oldOrder) => oldOrder._id === newOrder._id
                  )
              ),
            ];
            return uniqueOrders;
          });
        }
      } catch (error) {
        toast.error("Error fetching orders:", error);
        setOrderList([]);
      }
    };
    fetchOrder();
  }, []);

  useEffect(() => {
    const storedCartItems = JSON.parse(
      localStorage.getItem("cartItems") || "[]"
    );
    setCartItems(storedCartItems);
  }, []);

  const handleButtonClick = async (e) => {
    await handleAddOrder(e);
  };

  const handleAddOrder = async (e) => {
    e.preventDefault();

    try {
      // Validate input data
      if (!infoBuyyer || !infoBuyyer.nama) {
        toast.error("Customer name is missing.");
        alert("Error: Please provide a valid customer name.");
        return;
      }

      if (!tableNumber || !tableNumber.nomor) {
        toast.error("Table number is missing.");
        alert("Error: Please select a valid table.");
        return;
      }

      // Collect items with insufficient stock
      const insufficientItems = cartItems.filter(
        (item) => item.quantity > item.product.amount - item.product.orderQty
      );

      if (insufficientItems.length > 0) {
        // Build a detailed error message with <br> for line breaks
        const errorMessage = insufficientItems
          .map(
            (item) =>
              `- ${item.product.name}: Stok hanya ada ${
                item.product.amount - item.product.orderQty
              }, tetapi Anda memesan ${item.quantity}`
          )
          .join("<br>"); // Use <br> instead of \n for line breaks

        // Show the error message using Swal.fire
        Swal.fire({
          title: "Stok tidak mencukupi!",
          html: `<div style="text-align: left;">Berikut adalah item dengan stok tidak mencukupi:<br>${errorMessage}</div>`, // Wrap in a div with justify
          icon: "error",
        });
        return null;
      }

      // Prepare order details
      const orderDetails = cartItems.map((element) => ({
        id_store: element.product.id_store,
        id_company: element.product.id_company,
        id_product: element.product.id,
        id_extrasDetails: element.selectedExtra,
        id_sizeDetails: element.selectedSize,
        name_product: element.product.name,
        quantity: element.quantity,
        price_item: element.product.priceAfterDiscount,
        total_price: element.product.priceAfterDiscount * element.quantity,
        discount: element.product.discount,
      }));

      // Generate order code
      const formattedDate = moment().format("DDMMYYHHmmss");
      const orderCodeReal = "ORD/" + formattedDate;
      const ordersToday = cartItems.length;
      const no = `${formattedDate}${ordersToday + 1}`;

      const total_price = cartItems.reduce(
        (total, item) =>
          total + item.quantity * (item.product?.priceAfterDiscount || 0),
        0
      );
      const total_quantity = cartItems.reduce(
        (total, item) => total + item.quantity,
        0
      );
      const reqBody = {
        no: no,
        code: orderCodeReal,
        person_name: infoBuyyer.nama,
        status: 2,
        order_status: 1,
        id_table_cust: tableNumber.nomor,
        total_quantity: total_quantity,
        total_price: total_price,
        keterangan:
          infoBuyyer.keterangan === ""
            ? "user belum menuliskan Keterangan"
            : infoBuyyer.keterangan,
        orderDetails: orderDetails,
      };
      // Send POST request to create the order
      const response = await addOrder(reqBody);

      if (response.status === 201) {
        Swal.fire("Sukses!", "Berhasil Order.", "success");
        clearCart();
      }
    } catch (erroraddorder) {
      // Handle errors
      if (erroraddorder.response) {
        toast.error(`ERROR STATUS: ${erroraddorder.response.status}`);
        toast.error(
          `ERROR DATA: ${JSON.stringify(erroraddorder.response.data)}`
        );
      } else {
        toast.error(`ERRORNYA: ${erroraddorder.message}`);
      }
    }
  };

  // ADD SALES DULU DISINI, codenya ada di file cartItemToSales.js

  const [infoBuyyer, setInfoBuyyer] = useState({
    nama: "",
    keterangan: "",
  });

  const infoBuyyerHandleChange = (e) => {
    const { name, value } = e.target;
    setInfoBuyyer({
      ...infoBuyyer,
      [name]: value,
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
  const handleQuantityChange = async (index, newQuantity) => {
    if (newQuantity < 1) return; // Minimal quantity 1

    // Deep copy the cart items to avoid state mutation issues
    const updatedItems = JSON.parse(JSON.stringify(cartItems));

    updatedItems[index].quantity = newQuantity;
    updatedItems[index].totalPrice =
      updatedItems[index].product?.priceAfterDiscount * newQuantity || 0;

    setCartItems(updatedItems);
    localStorage.setItem("cartItems", JSON.stringify(updatedItems)); // Simpan perubahan ke localStorage
  };

  const handleDeleteInfo = (index) => {
    const updatedItems = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedItems);
    localStorage.setItem("cartItems", JSON.stringify(updatedItems)); // Simpan perubahan ke cookie
  };

  const handleDelete = async (index, id_product, quantity) => {
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

  const openModalnote = () => {
    setIsnoteModalOpen(true);
  };
  const closeModalnote = () => {
    setIsnoteModalOpen(false);
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

  // Clear localStorage cartItems
  const clearCart = () => {
    try {
      setCartItems([]);
      setInfoBuyyer({
        nama: "",
        keterangan: "",
      });
      setTableNumber({
        nomor: "",
      });
      localStorage.setItem("cartItems", JSON.stringify([])); // Update localStorage
    } catch (error) {
      toast.error("Error clearing cart items:", error.message);
      Swal.fire("Error!", "Failed to clear cart items.", "error");
    }
  };

  return (
    <div className="bg-[#F7F7F7] min-h-screen custom-margin">
      <Topbar onCartUpdate={handleDeleteInfo} />

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
              htmlFor="infoBuyyer"
              className="absolute top-2 left-4 text-sm text-black-500 bg-white px-1 font-semibold"
            >
              Nama Pelanggan
            </label>
            <input
              id="infoBuyyerNama"
              type="text"
              name="nama"
              value={infoBuyyer.nama}
              onChange={infoBuyyerHandleChange}
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
          <h2 className="font-semibold mb-1">Keranjang anda</h2>
          <p className="text-sm text-gray-500 mb-4">
            Anda memiliki {cartItems.length} item di dalam keranjang
          </p>
          {cartItems.length === 0 ? (
            <p>Keranjang Anda kosong.</p>
          ) : (
            <ul className="space-y-4">
              {cartItems.map((item, index) => {
                let { product, selectedSize, selectedExtra, quantity } =
                  item || {};
                let { name, image, priceAfterDiscount, discount, price, id } =
                  product || {};

                return (
                  <li
                    key={index}
                    className="flex items-center border p-4 rounded-lg bg-white shadow-md"
                  >
                    <ImageWithFallback
                      onError={"https://placehold.co/100x100"}
                      src={image || "https://placehold.co/100x100"}
                      alt={name || "Produk Tidak Diketahui"}
                      className="w-16 h-16 object-cover rounded-lg mr-4"
                      width={64}
                      height={64}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {name || "Produk Tidak Diketahui"}
                      </h3>

                      {/* Hanya tampilkan size atau extra yang dipilih, dipisahkan dengan koma */}
                      <div className="flex">
                        <p className="text-sm">
                          {[selectedSize?.name, selectedExtra?.name]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <p className="font-semibold mr-4 relative">
                        {discount > 0 ? (
                          <s className="font-bold text-sm mr-4 text-red-500 italic absolute -top-5 -left-5">
                            Rp.
                            {new Intl.NumberFormat("id-ID").format(price)}
                          </s>
                        ) : null}
                        Rp.{" "}
                        {new Intl.NumberFormat("id-ID").format(
                          priceAfterDiscount || 0
                        )}
                      </p>

                      {/* Harga satuan & tombol quantity */}
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => {
                            const newQuantity = Number(e.target.value);
                            handleQuantityChange(index, newQuantity);
                          }}
                          min="1"
                          className="mx-4 w-16 text-center appearance-none bg-transparent border-none focus:outline-none focus:border-b focus:border-black spinner-none"
                        />

                        <div className="flex flex-col items-center ml-2 -space-y-2.5">
                          <button
                            onClick={() =>
                              handleQuantityChange(index, quantity + 1)
                            }
                            className={`text-lg bg-transparent p--4 leading-none`}
                          >
                            <TiArrowSortedUp />
                          </button>
                          <button
                            onClick={() =>
                              handleQuantityChange(index, quantity - 1)
                            }
                            className="text-lg bg-transparent p--4 leading-none"
                          >
                            <TiArrowSortedDown />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDelete(index, id, quantity)}
                        className="ml-4"
                      >
                        <VscTrash className="w-6 h-6" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div>
          <button
            className={`${
              infoBuyyer.keterangan ? "bg-[#FDDC05]" : "bg-[#D3D3D3]"
            } text-black font-semibold rounded-full px-4 py-2 flex items-center space-x-2 hover:bg-[#FDDC05] transition-all duration-200 shadow-lg`}
            onClick={openModalnote}
          >
            <CgNotes className="w-5 h-5" /> <span>+ Tambah Catatan</span>
          </button>

          {/* Menampilkan tulisan kecil jika textarea terisi */}
          {infoBuyyer.keterangan.trim() !== "" && (
            <p className="text-gray-500 text-sm mt-2">Catatan terisi</p>
          )}
        </div>

        <div className="mt-6 text-right">
          <p className="text-lg font-bold mb-4">
            Total: Rp.
            {new Intl.NumberFormat("id-ID").format(
              cartItems.reduce(
                (total, item) =>
                  total +
                  item.quantity * (item.product?.priceAfterDiscount || 0),
                0
              )
            )}
          </p>
          <div className="flex justify-between">
            <button
              onClick={handleAddOrder}
              className="py-2 px-4 rounded-lg w-full font-bold"
              style={{ backgroundColor: "#FDDC05", color: "black" }}
            >
              Submit
            </button>
          </div>
        </div>

        {isnoteModalOpen && (
          <Modal onClose={closeModalnote} title={"Catatan Pemesanan"}>
            <div>
              <div className="relative w-full">
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
            </div>
          </Modal>
        )}
        {/* DISINI DULU ADA MODAL UNTUK MENAMBAHKAN DATA SECARA ONLINE (ORDER DAN SALES) */}
        {/* ADA DI paymentModal.js */}
      </div>
    </div>
  );
};

export default Cart;
