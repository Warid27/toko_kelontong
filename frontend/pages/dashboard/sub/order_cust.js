// import React, { useEffect, useState } from "react";
// import client from "@/libs/axios";
// import { fetchOrderList } from "@/libs/fetching/order";
// import { fetchProductsList } from "@/libs/fetching/product";
// import { fetchTableList } from "@/libs/fetching/table";
// import { fetchItemCampaignList } from "@/libs/fetching/itemCampaign";
// const OrderCust = ({ setSelectedLink }) => {
//   const [listOrder, setListOrder] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [productList, setProductList] = useState([]);
//   const [tableList, setTableList] = useState([]);
//   const [itemCampaignList, setItemCampaignList] = useState([]);
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     const fetching_requirement = async () => {
//       const id_store =
//         localStorage.getItem("id_store") == "undefined"
//           ? null
//           : localStorage.getItem("id_store");

//       const get_itemCampaign_list = async () => {
//         const data_itemCampaign = await fetchItemCampaignList();
//         setItemCampaignList(data_itemCampaign);
//       };
//       const get_product_list = async () => {
//         const data_product = await fetchProductsList(
//           id_store,
//           null,
//           null,
//           "order"
//         );
//         setProductList(data_product);
//       };
//       const get_table_list = async () => {
//         const data_table = await fetchTableList();
//         setTableList(data_table);
//       };
//       const get_order_list = async () => {
//         const data_order = await fetchOrderList(id_store, token);
//         setListOrder(data_order);
//       };
//       get_itemCampaign_list();
//       get_product_list();
//       get_table_list();
//       get_order_list();
//     };
//     fetching_requirement();
//     setIsLoading(false);
//   }, []);

//   const handleProcessOrder = (order) => {
//     console.log("order", order);

//     const { __reactFiber$ihwx534u59, __reactProps, ...safeOrder } = order;
//     console.log("safeOrder", safeOrder);

//     const orderFormat = safeOrder.orderDetails.map((od) => {
//       const quantity = od.quantity || 1;
//       console.log("QTY", quantity);
//       console.log("OD", od);
//       console.log("OD ID", od.id_product?._id);
//       console.log("PL", productList);
//       const selectedProduct = productList.find(
//         (pl) => pl._id === od.id_product?._id
//       );

//       const today = new Date().toISOString().split("T")[0];
//       const campaign = itemCampaignList.find(
//         (icl) =>
//           icl._id === selectedProduct?.id_item_campaign &&
//           icl.start_date <= today &&
//           icl.end_date >= today
//       );

//       const discountValue = campaign?.value || 0;
//       console.log("SELEKTED", selectedProduct);
//       return {
//         informasi: {
//           id_order: order._id,
//           code: order.code,
//           id_table_cust: order.id_table_cust,
//           person_name: order.person_name,
//           keterangan: order.keterangan,
//         },
//         product: {
//           id: selectedProduct?._id || null,
//           id_company: selectedProduct?.id_company || null,
//           id_store: selectedProduct?.id_store || null,
//           id_item_campaign: selectedProduct?.id_item_campaign || null,
//           name: selectedProduct?.name_product || "Unknown",
//           image: selectedProduct?.image || "",
//           price: selectedProduct?.sell_price || 0,
//           product_code: selectedProduct?.product_code || "",
//           diskon: discountValue,
//           amount: selectedProduct?.id_stock?.amount,
//           orderQty: selectedProduct?.orderQty,
//           priceAfterDiscount: selectedProduct?.sell_price * (1 - discountValue),
//         },
//         quantity,
//         qty_before: quantity,
//         selectedExtra: od.id_extrasDetails
//           ? {
//               _id: od.id_extrasDetails,
//               name:
//                 selectedProduct?.id_extras?.extrasDetails.find(
//                   (extra) => extra._id === od.id_extrasDetails
//                 )?.name || "Unknown Extra",
//             }
//           : null,
//         selectedSize: od.id_sizeDetails
//           ? {
//               _id: od.id_sizeDetails,
//               name:
//                 selectedProduct?.id_size?.sizeDetails.find(
//                   (size) => size._id === od.id_sizeDetails
//                 )?.name || "Unknown Size",
//             }
//           : null,
//       };
//     });

//     localStorage.setItem("kasirItems", JSON.stringify(orderFormat));
//     handleNavigateToKasir(orderFormat);
//   };

//   // function
//   const handleNavigateToKasir = (data) => {
//     setSelectedLink("kasir");
//   };

//   if (isLoading) {
//     return (
//       <div className="w-full h-screen pt-16 flex justify-center items-center">
//         <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full h-screen pt-16">
//       <div className="justify-between w-full bg-white shadow-lg p-4">
//         <div className="flex flex-row justify-between">
//           <div className="flex flex-col">
//             <p className="text-2xl font-bold">Pesanan Masuk</p>
//             <p>Detail Pesanan Masuk</p>
//           </div>
//         </div>
//       </div>

//       <div className="p-4 mt-4">
//         <div className="bg-white rounded-lg">
//           <div className="overflow-x-auto">
//             {listOrder.length === 0 ? (
//               <h1>Pesanan tidak ditemukan!</h1>
//             ) : (
//               <table className="table w-full border border-gray-300">
//                 <thead>
//                   <tr>
//                     <th>No</th>
//                     <th>Nama Pelanggan</th>
//                     <th>No Meja</th>
//                     <th>Jumlah Pesanan</th>
//                     <th>Total Harga</th>
//                     <th>Aksi</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {listOrder.map((order, index) => (
//                     <tr key={order._id}>
//                       <td>{index + 1}</td>
//                       <td>{order.person_name}</td>
//                       <td>
//                         {tableList.find((tl) => tl._id == order.id_table_cust)
//                           ?.name || "Unknown"}
//                       </td>
//                       <td>{order.orderDetails.length}</td>
//                       <td>
//                         {order.orderDetails
//                           .map((od) => od.total_price)
//                           .reduce((acc, curr) => acc + curr, 0)}
//                       </td>
//                       <td>
//                         <button
//                           className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
//                           onClick={() => handleProcessOrder(order)}
//                         >
//                           Process
//                         </button>
//                         ;
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrderCust;
