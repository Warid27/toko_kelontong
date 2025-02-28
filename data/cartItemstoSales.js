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
