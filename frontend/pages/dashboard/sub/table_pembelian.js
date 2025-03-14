// import React, { useEffect, useState } from "react";
// import { IoSearchOutline } from "react-icons/io5";
// import Image from "next/image";
// import { MdKeyboardArrowDown } from "react-icons/md";
// import client from "@/libs/axios";
// import { FaInfoCircle } from "react-icons/fa";
// import Swal from "sweetalert2";
// import { MdDelete } from "react-icons/md";
// import { FaRegEdit } from "react-icons/fa";
// import { Modal } from "@/components/Modal";
// import Cookies from "js-cookie";
// import ContentRenderer from "@/components/nav/renderContents";
// import { fetchPembelianList } from "@/libs/fetching/pembelian";
// import { fetchTableList } from "@/libs/fetching/table";
// import ReactPaginate from "react-paginate";

// const PembelianList = ({ setSelectedLink }) => {
//   const [listPembelian, setListPembelian] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [tableList, setTableList] = useState([]);
//   const [pembelianToUpdate, setPembelianToUpdate] = useState(null);
//   const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
//   const [currentPage, setCurrentPage] = useState(0);
//   const itemsPerPage = 10;
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const id_store = localStorage.getItem("id_store");
//   const fetching_requirement = async () => {
//       const get_pembelian_list = async () => {
//         const data_pembelian = await fetchPembelianList(id_store, token);
//         setListPembelian(data_pembelian);
//         setIsLoading(false);
//       };
//       const get_table_list = async () => {
//         const data_table = await fetchTableList();
//         setTableList(data_table);
//         setIsLoading(false);
//       };
//       get_pembelian_list();
//       get_table_list();
//     };
//     fetching_requirement();
//   }, []);

//   // Open info modal
//   const handleInfoDetails = (pembelian) => {
//     setPembelianToUpdate(pembelian);
//     setIsInfoModalOpen(true);
//   };

//   // Close info modal
//   const closeModalInfo = () => {
//     setIsInfoModalOpen(false);
//   };

//   const startIndex = currentPage * itemsPerPage;
//   const selectedData = listPembelian.slice(startIndex, startIndex + itemsPerPage);

//   if (isLoading) {
//     return (
//       <div className="w-full h-screen pt-16 flex justify-center items-center">
//         <div className="animate-spin rounded-full h-16 w-16 bpembelian-t-2 bpembelian-b-2 bpembelian-gray-900"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full h-screen pt-16">
//       <div className="justify-between w-full bg-white shadow-lg p-4">
//         <div className="flex flex-row justify-between">
//           <div className="flex flex-col">
//             <p className="text-2xl font-bold">Daftar Pembelianan</p>
//             <p>Detail daftar pembelianan</p>
//           </div>
//         </div>
//       </div>
//       <div className="p-4 mt-4">
//         <div className="bg-white rounded-lg">
//           <div className="overflow-x-auto">
//             {listPembelian.length === 0 ? (
//               <h1>Data Pembelianan tidak ditemukan!</h1>
//             ) : (
//               <>
//               <table className="table w-full bpembelian bpembelian-gray-300">
//                 <thead>
//                   <tr>
//                     <th>No</th>
//                     <th>No Pemb</th>
//                     <th>Jumlah Barang</th>
//                     <th>Total Harga</th>
//                     <th>Total Kuantitas</th>
//                     <th>Status</th>
//                     <th>Aksi</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {selectedData.map((pembelian, index) => (
//                     <tr key={pembelian._id}>
//                       <td>{index + 1}</td>
//                       <td>{pembelian.no}</td>
//                       <td>{pembelian.total_number_item}</td>
//                       <td>{pembelian.total_price}</td>
//                       <td>{pembelian.total_quantity}</td>
//                       <td>{pembelian.status == "2" ? "pending" : "selesai"}</td>
//                       <td>
//                         <button
//                           className="p-3 rounded-lg text-2xl"
//                           onClick={() => handleInfoDetails(pembelian)}
//                         >
//                           <FaInfoCircle />
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//               <ReactPaginate
//                 previousLabel={"← Prev"}
//                 nextLabel={"Next →"}
//                 pageCount={Math.ceil(listPembelian.length / itemsPerPage)}
//                 onPageChange={({ selected }) => setCurrentPage(selected)}
//                 containerClassName={"flex gap-2 justify-center mt-4"}
//                 pageLinkClassName={"border px-3 py-1"}
//                 previousLinkClassName={"border px-3 py-1"}
//                 nextLinkClassName={"border px-3 py-1"}
//                 activeClassName={"bg-blue-500 text-white"}
//               />
//               </>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Info Modal */}
//       {isInfoModalOpen && (
//         <Modal onClose={closeModalInfo} title={"Pembelian Detail"}>
//           {pembelianToUpdate?.pembelianDetails?.map((detail, index) => (
//             <div key={index}>
//               <div>Detail {index + 1}</div>
//               <div className="grid grid-cols-[auto_auto_1fr] gap-y-2 font-sans">
//                 <span className="text-left font-bold pr-2">Kode Produk</span>
//                 <span className="font-bold px-2">:</span>
//                 <span className="text-gray-700">
//                   {detail.product_code || "-"}
//                 </span>
//                 <span className="text-left font-bold pr-2">Nama Barang</span>
//                 <span className="font-bold px-2">:</span>
//                 <span className="text-gray-700">{detail.name || "-"}</span>
//                 <span className="text-left font-bold pr-2">Harga Barang</span>
//                 <span className="font-bold px-2">:</span>
//                 <span className="text-gray-700">
//                   {detail.item_price || "-"}
//                 </span>
//                 <span className="text-left font-bold pr-2">Jumlah Barang</span>
//                 <span className="font-bold px-2">:</span>
//                 <span className="text-gray-700">
//                   {detail.item_quantity || "-"}
//                 </span>
//                 <span className="text-left font-bold pr-2">Diskon</span>
//                 <span className="font-bold px-2">:</span>
//                 <span className="text-gray-700">
//                   {detail.item_discount || "-"}
//                 </span>
//               </div>
//               <hr />
//             </div>
//           ))}
//         </Modal>
//       )}
//     </div>
//   );
// };

// export default PembelianList;
