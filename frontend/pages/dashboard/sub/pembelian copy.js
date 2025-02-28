// import React, { useEffect, useState } from "react";
// import Image from "next/image";
// import Card from "@/components/Card";
// import client from "@/libs/axios";
// import { Modal } from "@/components/Modal";
// import { FaMinus, FaPlus } from "react-icons/fa6";
// import Swal from "sweetalert2";

// export default function Pembelian() {
//   const [products, setProducts] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [queryReady, setQueryReady] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [quantity, setQuantity] = useState(1);

//   useEffect(() => {
//     const id_store = localStorage.getItem("id_store");
//     const id_company = localStorage.getItem("id_company");
//     const id_user = localStorage.getItem("id_user");

//     const fetchProducts = async () => {
//       setIsLoading(true);

//       try {
//         const response = await client.post("/product/listproduct", {
//           id_store: id_store,
//           id_company: id_company,
//           status: 0, // 0 = Active, 1 = Inactive
//         });
//         setProducts(response.data);
//       } catch (error) {
//         console.error("Error fetching products:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     if (id_store && id_company) {
//       fetchProducts();
//     } else {
//       console.warn("Missing one or more query parameters!");
//       setIsLoading(false);
//     }
//   }, []);

//   const handleCardClick = async (product) => {
//     try {
//       const response = await client.post("/product/getproduct", {
//         id: product._id,
//       });
//       setSelectedProduct(response.data); // Set the selected product with fetched data
//       setIsModalOpen(true); // Open the modal
//     } catch (error) {
//       console.error("Error fetching product details:", error);
//     }
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setSelectedProduct(null);
//   };

//   const handleSubmitUpdate = async (selected) => {
//     try {
//       const token = localStorage.getItem("token");

//       // Make the API request to update the stock
//       const response = await client.put(
//         "/api/stock",
//         {
//           amount: quantity,
//           params: "in",
//           id_product: selected._id,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       // If the request is successful, show a success alert
//       Swal.fire({
//         icon: "success",
//         title: "Success!",
//         text: "Stock updated successfully.",
//       });
//       closeModal()
//     } catch (error) {
//       console.error("Error updating product:", error);

//       // Check if the error response contains a detailed message
//       if (error.response && error.response.data && error.response.data.error) {
//         // Display the error message using SweetAlert2
//         Swal.fire({
//           icon: "error",
//           title: "Error!",
//           text: error.response.data.error, // Use the error message from the backend
//         });
//       } else {
//         Swal.fire({
//           icon: "error",
//           title: "Error!",
//           text: "An unexpected error occurred while updating the stock.",
//         });
//       }
//     }
//   };

//   //   const handleCartUpdate = () => {
//   //     setCartUpdated((prev) => !prev);
//   //   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-100">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-t-4 border-gray-200 rounded-full animate-spin"></div>
//           <p className="mt-4 text-gray-500">
//             Fetching products, please wait...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-[#F7F7F7] min-h-screen">
//       <div className="p-10">
//         <div className="flex justify-center max-h-[55vh] overflow-hidden relative"></div>
//         <div className="mt-10 space-y-6">
//           <h2 className="font-bold text-4xl mb-4">Products</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {products.map((product) => (
//               <div
//                 className="flex justify-center max-h-[55vh] relative"
//                 key={product._id}
//                 onClick={() => handleCardClick(product)}
//               >
//                 <Card
//                   className="w-full object-cover"
//                   image={product.image || "https://placehold.co/100x100"}
//                   nama={product.name_product}
//                   harga={`Rp ${new Intl.NumberFormat("id-ID").format(
//                     Math.max(product.buy_price || 999999)
//                   )}`}
//                 />
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {isModalOpen && (
//         <Modal onClose={closeModal} title={selectedProduct?.name_product}>
//           <div>
//             <Image
//               src={selectedProduct?.image || "https://placehold.co/100x100"}
//               alt={selectedProduct?.name_product}
//               width={100}
//               height={100}
//               className="w-[500px] h-[550px] mb-4"
//             />
//             <p className="text-xl font-bold">{selectedProduct?.name_product}</p>
//             <p>{selectedProduct?.deskripsi}</p>
//             <p className="hidden">{selectedProduct?.product_code}</p>

//             {/* <p className="font-semibold mt-4 mb-2">Extras</p>
//             <div className="flex flex-wrap space-x-2">
//               {selectedProduct?.id_extras?.extrasDetails.map((extra) => (
//                 <button
//                   key={extra._id}
//                   className={`p-2 rounded-md ${
//                     selectedExtra === extra._id
//                       ? "bg-[#FDDC05] text-black font-semibold"
//                       : "bg-white border-[#FDDC05] border-2"
//                   }`}
//                   onClick={() => setSelectedExtra(extra._id)}
//                 >
//                   {extra.name}
//                 </button>
//               ))}
//             </div>

//             <p className="font-semibold mt-4 mb-2">Size</p>
//             <div className="flex flex-wrap space-x-2">
//               {selectedProduct?.id_size?.sizeDetails.map((size) => (
//                 <button
//                   key={size._id}
//                   className={`p-2 rounded-md ${
//                     selectedSize === size._id
//                       ? "bg-[#FDDC05] text-black font-semibold"
//                       : "bg-white border-[#FDDC05] border-2"
//                   }`}
//                   onClick={() => setSelectedSize(size._id)}
//                 >
//                   {size.name}
//                 </button>
//               ))}
//             </div> */}

//             {/* Kontrol jumlah produk */}
//             <div className="flex items-center place-content-center mt-4">
//               <button
//                 onClick={() => setQuantity(Math.max(0, quantity - 1))}
//                 className="py-2 px-3 border border-black rounded-md"
//               >
//                 <FaMinus />
//               </button>
//               <span className="mx-4">{quantity}</span>{" "}
//               <button
//                 onClick={() => setQuantity(quantity + 1)}
//                 className="py-2 px-3 border border-black rounded-md"
//               >
//                 <FaPlus />
//               </button>
//             </div>

//             <button
//               onClick={() => handleSubmitUpdate(selectedProduct)}
//               className={`mt-4 w-full p-2 rounded-md ${
//                 quantity === 0 ? "bg-gray-400" : "bg-green-500 text-white"
//               }`}
//               disabled={quantity === 0}
//             >
//               Tambah Stock
//             </button>
//           </div>
//         </Modal>
//       )}
//     </div>
//   );
// }
