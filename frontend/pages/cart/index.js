import React, { useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import Image from "next/image";
import Topbar from "@/components/Topbar";
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti";
import { IoMdArrowRoundBack, IoIosArrowDropdown } from "react-icons/io";
import { VscTrash } from "react-icons/vsc";
// import axios from "axios";
import client from "@/libs/axios";
import Swal from "sweetalert2"; // Import sweetalert2
import { IoClose } from "react-icons/io5";
import { Modal } from "@/components/Modal";

const Cart = () => {
  const [payments, setPayments] = useState([]);
  const [table_custList, setTable_custList] = useState([]);
  const [orderList, setOrderList] = useState([]);
  const orderListRef = useRef(orderList); // Create a ref to track the latest state
  const [cartItems, setCartItems] = useState([]);

  // Function
  const [expandedPayments, setexpandedPayments] = useState({});
  const [selectedMethod, setSelectedMethod] = useState(null);
  // State untuk modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Update the ref whenever the state changes
  useEffect(() => {
    orderListRef.current = orderList;
  }, [orderList]);

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
  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await client.post(
        "/order/listorder",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = response.data;

      // Validate that the response is an array
      if (!Array.isArray(data)) {
        console.error("Unexpected data format from /order/listorder:", data);
        setOrderList([]);
      } else {
        // Append new orders to the existing orderList state
        setOrderList((prevOrderList) => {
          const uniqueOrders = [
            ...prevOrderList,
            ...data.filter(
              (newOrder) =>
                !prevOrderList.some((oldOrder) => oldOrder._id === newOrder._id)
            ),
          ];
          return uniqueOrders;
        });
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrderList([]);
    }
  };
  // FETCH PAYMENT
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("token");
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
  // FETCH ORDER useEffect
  useEffect(() => {
    fetchOrder();
  }, []);

  useEffect(() => {
    const storedCartItems = JSON.parse(Cookies.get("cartItems") || "[]");
    setCartItems(storedCartItems);
  }, []);

  const handleButtonClick = async (e) => {
    await handleAddOrder(e);
  };

  // Wait Order
  // const waitForOrder = async (orderCodeReal, maxRetries = 5, delay = 1000) => {
  //   let retries = 0;
  //   while (retries < maxRetries) {
  //     await fetchOrder(); // Fetch the latest order list

  //     // Use the ref to access the latest orderList
  //     const currentOrderList = orderListRef.current;

  //     // Check if the orderList contains the new order
  //     const order = currentOrderList.find((ol) => ol.code === orderCodeReal);
  //     if (order) {
  //       return order; // Return the matching order
  //     }

  //     retries++;
  //     await new Promise((resolve) => setTimeout(resolve, delay)); // Wait before retrying
  //   }

  //   throw new Error(
  //     `Order not found after ${maxRetries} retries: ${orderCodeReal}`
  //   );
  // };
  // Add Order
  const handleAddOrder = async (e) => {
    e.preventDefault();

    try {
      // Validate input data
      if (!customerName || !customerName.nama) {
        console.error("Customer name is missing.");
        alert("Error: Please provide a valid customer name.");
        return;
      }

      if (!tableNumber || !tableNumber.nomor) {
        console.error("Table number is missing.");
        alert("Error: Please select a valid table.");
        return;
      }

      const token = localStorage.getItem("token");
      // Prepare order details
      const orderDetails = cartItems.map((element) => {
        return {
          id_product: element.product.id,
          name_product: element.product.name,
          id_extrasDetails: element.selectedExtra,
          id_sizeDetails: element.selectedSize,
          quantity: element.quantity,
          price_item: element.product.price,
          total_price: element.product.price * element.quantity,
          discount: 0,
        };
      });

      // Generate order code
      const orderCode = "ORD/" + Date.now() + "/" + crypto.randomUUID();
      const orderCodeReal = orderCode;

      const Tanggal_Lengkap = new Date().toISOString().split("T")[0]; // Full date in "YYYY-MM-DD" format
      const Tahun_lengkap = Tanggal_Lengkap.split("-")[0]; // Full year, e.g., "2023"
      const Tahun = Tahun_lengkap.slice(-2); // Last two digits of the year, e.g., "23"
      const Bulan = Tanggal_Lengkap.split("-")[1]; // Month, e.g., "10" for October
      const Tanggal = Tanggal_Lengkap.slice(-2); // Day, e.g., "05"

      // Count of items in cartItems
      const ordersToday = cartItems.length;

      // Generate the unique identifier
      const no = `${Tanggal}${Bulan}${Tahun}${ordersToday + 1}`;

      // Send POST request to create the order
      const response = await client.post(
        "order/addorder",
        {
          no: no,
          code: orderCodeReal,
          person_name: customerName.nama,
          status: 2,
          id_table_cust: tableNumber.nomor,
          keterangan: 1,
          // id_store: "67a30e78cb191b12b2a6c2ba", // Replace with dynamic value if available
          // id_company: "679dcb0cc076b05c739a596e", // Replace with dynamic value if available
          // id_user: "67a034f9962111a02fcc5ad2", // Replace with dynamic value if available
          orderDetails: orderDetails,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 201) {
        // Only order
        Swal.fire("Sukses!", "Berhasil Order.", "success");
        await clearCart();
        window.location.reload();

        // ORDER AND SALES

        // // Wait for the order to appear in the orderList
        // const order = await waitForOrder(orderCodeReal);

        // // Process sales
        // try {
        //   await handleSales(orderCodeReal);
        // } catch (salesError) {
        //   console.error("Error in handleSales:", salesError.message);
        //   alert("Error: Failed to process sales. Please try again.");
        // }
      }
    } catch (erroraddorder) {
      // Handle errors
      if (erroraddorder.response) {
        console.log(`ERROR STATUS: ${erroraddorder.response.status}`);
        console.log(
          `ERROR DATA: ${JSON.stringify(erroraddorder.response.data)}`
        );
      } else {
        console.log(`ERRORNYA: ${erroraddorder.message}`);
      }
    }
  };

  // Add Sales
  // const handleSales = async (orderCodeReal) => {
  //   try {
  //     // Validate orderList
  //     const validateOrderList = () => {
  //       const currentOrderList = orderListRef.current;
  //       if (!Array.isArray(currentOrderList) || currentOrderList.length === 0) {
  //         throw new Error("Error: orderList is empty.");
  //       }
  //       return currentOrderList;
  //     };

  //     const validateOrder = (currentOrderList, orderCode) => {
  //       const order = currentOrderList.find((ol) => ol.code === orderCode);
  //       if (!order) {
  //         throw new Error(`No matching order found for code: ${orderCode}`);
  //       }
  //       return order;
  //     };

  //     // Validate inputs
  //     const currentOrderList = validateOrderList();
  //     const order = validateOrder(currentOrderList, orderCodeReal);

  //     // Prepare data for the API request
  //     const prepareSalesData = () => {
  //       const totalNumberItem = cartItems.length;

  //       const salesDetail = cartItems.map((item) => ({
  //         id_product: item.product.id,
  //         name: item.product.name,
  //         product_code: item.product.product_code,
  //         item_price: Number(item.product.price),
  //         item_quantity: item.quantity,
  //         item_discount: 0,
  //       }));

  //       const salesCode = `INV/${Date.now()}/${crypto.randomUUID()}`;
  //       const totalQty = cartItems.reduce(
  //         (total, item) => total + item.quantity,
  //         0
  //       );
  //       const totalPrice = cartItems.reduce(
  //         (total, item) => total + item.product.price * item.quantity,
  //         0
  //       );
  //       return {
  //         no: salesCode,
  //         id_user: "67a034f9962111a02fcc5ad2", // Consider making this dynamic
  //         id_store: "679b448102f7087c0369c23c", // Consider making this dynamic
  //         id_order: order._id,
  //         id_sales_campaign: "67adf9ffcf892c7756288622", // Consider making this dynamic
  //         id_payment_type: selectedMethod._id,
  //         tax: 0,
  //         status: 1, // 1 = active, 2 = pending
  //         total_price: totalPrice,
  //         total_quantity: totalQty,
  //         total_discount: 0,
  //         total_number_item: totalNumberItem,
  //         salesDetails: salesDetail,
  //       };
  //     };

  //     const token = localStorage.getItem("token");
  //     const salesData = prepareSalesData();

  //     // Make the API call
  //     const response = await client.post("sales/addsales", salesData, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });

  //     if (response.status === 201) {
  //       Swal.fire("Sukses!", "Berhasil Order.", "success");
  //       await clearCart(); // Clear cart only after successful API call
  //       window.location.reload(); // Refresh the page
  //     }
  //   } catch (error) {
  //     // Handle errors gracefully
  //     let errorMessage = "An unexpected error occurred.";
  //     if (error.response) {
  //       errorMessage = `Error: ${JSON.stringify(error.response.data)}`;
  //     } else if (error.message) {
  //       errorMessage = error.message;
  //     }

  //     console.error(errorMessage);
  //     Swal.fire("Error!", errorMessage, "error");
  //   }
  // };

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

  // nama product
  // useEffect(() => {
  //   if (tableNumber.nomor < 1) {
  //     setTableNumber({ nomor: 1 });
  //   } else if (tableNumber.nomor > 100) {
  //     setTableNumber({ nomor: 100 });
  //   }
  // }, [tableNumber]);
  // akhir nama produc

  const [payment, SetPayment] = useState({
    bayar: "",
  });

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
  //   updatedItems[index].name = newNameProduct;
  // };
  const handleDeleteInfo = (index) => {
    const updatedItems = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedItems);
    Cookies.set("cartItems", JSON.stringify(updatedItems)); // Simpan perubahan ke cookie
    console.log("LATEST COOKIES:", Cookies.get("cartItems"));
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

  const handleBack = () => {
    window.history.back();
  };

  // Clear Cookies cartItems
  const clearCart = () => {
    try {
      setCartItems([]); // Reset the cart state
      Cookies.set("cartItems", JSON.stringify([]), { expires: 7 }); // Update cookies
    } catch (error) {
      console.error("Error clearing cart items:", error.message);
      Swal.fire("Error!", "Failed to clear cart items.", "error");
    }
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
            Total: Rp.
            {new Intl.NumberFormat("id-ID").format(
              cartItems.reduce(
                (total, item) => total + item.quantity * item.product.price,
                0
              )
            )}
          </p>
          <div className="flex justify-between">
            {/* <button
              onClick={openModal}
              className="py-2 px-4 rounded-lg w-1/2 mr-2 font-bold"
              style={{ backgroundColor: "#FFA461", color: "black" }}
            >
              Take Home
            </button>
            <button
              onClick={openModal}
              className="py-2 px-4 rounded-lg w-1/2 font-bold"
              style={{ backgroundColor: "#FDDC05", color: "black" }}
            >
              Open Bill
            </button> */}
            <button
              onClick={handleAddOrder}
              className="py-2 px-4 rounded-lg w-full font-bold"
              style={{ backgroundColor: "#FDDC05", color: "black" }}
            >
              Submit
            </button>
          </div>
        </div>

        {/* DISINI DULU ADA MODAL UNTUK MENAMBAHKAN DATA SECARA ONLINE (ORDER DAN SALES) */}
        {/* ADA DI paymentModal.js */}
      </div>
    </div>
  );
};

export default Cart;
