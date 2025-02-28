// import React, { useEffect, useState } from "react";
// import { IoSearchOutline } from "react-icons/io5";
// import Image from "next/image";
// import { MdKeyboardArrowDown } from "react-icons/md";
// import client from "@/libs/axios";
// import { Modal } from "@/components/Modal";
// import { HiDotsHorizontal } from "react-icons/hi";
// import Swal from "sweetalert2";
// import { MdDelete } from "react-icons/md";
// import { FaRegEdit } from "react-icons/fa";
// import { fetchTypeList, fetchTypeAdd } from "@/libs/fetching/type";

// const TypeList = () => {
//   const [type, setType] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [openDropdown, setOpenDropdown] = useState(null);
//   const [typeToUpdate, setTypeToUpdate] = useState(null); // Untuk menyimpan produk yang akan diupdate
//   const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); // Untuk mengontrol tampilan modal update
//   const [loading, setLoading] = useState(false); // Untuk loading saat update status

//   const [typeDataAdd, setTypeDataAdd] = useState({
//     type: "",
//   });

//   const [typeDataUpdate, setTypeDataUpdate] = useState({
//     id: "",
//     type: "",
//   });

//   const openModalAdd = () => {
//     setIsModalOpen(true);
//   };

//   const closeModalAdd = () => {
//     setIsModalOpen(false);
//   };
//   const openModalUpdate = () => {
//     setIsUpdateModalOpen(true);
//   };

//   const closeModalUpdate = () => {
//     setIsUpdateModalOpen(false);
//   };

//   // const addNewType = (newType) => {
//   //   setType((prevTypes) => [...prevTypes, newType]);
//   // };

//   useEffect(() => {
//     const fetching_requirement = async () => {
//       const get_type_list = async () => {
//         const data_type = await fetchTypeList();
//         setType(data_type);
//         setIsLoading(false);
//       };
//       get_type_list();
//     };
//     fetching_requirement();
//   }, []);

//   // const handleAddType = () => {
//   //   setIsModalOpen(true);
//   // };

//   const handleUpdateType = (type) => {
//     setTypeToUpdate(type); // Menyimpan produk yang dipilih
//     setIsUpdateModalOpen(true);

//     console.log(type);
//   };

//   const deleteTypeById = async (id) => {
//     const result = await Swal.fire({
//       title: "Are you sure?",
//       text: "You won't be able to revert this!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "Yes, delete it!",
//       cancelButtonText: "No, cancel!",
//     });

//     if (result.isConfirmed) {
//       try {
//         const token = localStorage.getItem("token");
//         const response = await client.delete(`/api/type/${id}`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         if (response.status === 200) {
//           Swal.fire("Berhasil", "Type berhasil dihapus!", "success");
//           setType((prevTypes) => prevTypes.filter((p) => p._id !== id));
//         }
//       } catch (error) {
//         console.error("Gagal menghapus Type:", error.message);
//         Swal.fire("Gagal", "Type tidak dapat dihapus!", "error");
//       }
//     }
//   };

//   const handleChangeAdd = (value, name) => {
//     setTypeDataAdd((prevState) => ({
//       ...prevState,
//       [name]: value instanceof Date ? value.toISOString() : value,
//     }));
//   };

//   const handleSubmitAdd = async (e) => {
//     e.preventDefault();
//     console.log("datanya cok asuk", typeDataAdd);

//     try {
//       const token = localStorage.getItem("token");

//       // Ensure all required fields are filled
//       if (!typeDataAdd.type) {
//         alert("Please fill all required fields.");
//         return;
//       }

//       // Send product data to the backend
//       const response = await fetchTypeAdd(typeDataAdd.type)

//       console.log("Type added:", response);
//       Swal.fire("Berhasil", "Type berhasil ditambahkan!", "success");

//       // Reload the page or update state
//       // onClose();
//       window.location.reload();
//     } catch (error) {
//       console.error("Error adding Type:", error);
//     }
//   };

//   useEffect(() => {
//     if (typeToUpdate) {
//       setTypeDataUpdate({
//         id: typeToUpdate._id || "",
//         type: typeToUpdate.type || "",
//       });
//     }
//   }, [typeToUpdate]);

//   const handleChangeUpdate = (value, name) => {
//     setTypeDataUpdate((prevState) => ({
//       ...prevState,
//       [name]: value,
//     }));
//   };

//   const handleSubmitUpdate = async (e) => {
//     e.preventDefault();

//     const formData = new FormData();
//     for (const key in typeDataUpdate) {
//       formData.append(key, typeDataUpdate[key]);
//     }

//     try {
//       // const productId = "67a9615bf59ec80d10014871";
//       const token = localStorage.getItem("token");
//       const response = await client.put(
//         `/api/type/${typeDataUpdate.id}`,
//         {
//           type: typeDataUpdate.type || "",
//         },

//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       console.log("Type updated successfully:", response.data);
//       // onClose();
//       window.location.reload();
//     } catch (error) {
//       console.error("Error updating Type:", error);
//     }
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
//             <p className="text-2xl font-bold">Daftar Tipe</p>
//             <p>Detail Daftar Tipe</p>
//           </div>
//           <div className="relative mt-2 flex flex-row space-x-4">
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Search anything here"
//                 className="pl-10 h-10 pr-4 py-2 border border-gray-300 rounded-md w-full max-w-xs"
//               />
//               <IoSearchOutline className="absolute left-2 top-2.5 text-xl text-gray-500" />
//             </div>
//             <div className="avatar">
//               <div className="w-10 h-10 rounded-full">
//                 <Image
//                   src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
//                   alt="avatar"
//                   width={40}
//                   height={40}
//                 />
//               </div>
//             </div>
//             <button className="button btn-ghost btn-sm rounded-lg">
//               <MdKeyboardArrowDown className="text-2xl mt-1" />
//             </button>
//           </div>
//         </div>
//         <div className="flex flex-row justify-between mt-8">
//           <div>
//             <select className="select w-full max-w-xs bg-white border-gray-300">
//               <option value="">Best sellers</option>
//               <option value="">Ricebowl</option>
//               <option value="">Milkshake</option>
//             </select>
//           </div>
//           <div>
//             <button className="button addBtn" onClick={openModalAdd}>
//               + Tambah Type
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="p-4 mt-4">
//         <div className="bg-white rounded-lg">
//           <div className="overflow-x-auto">
//             {type.length === 0 ? (
//               <h1>Data Tipe tidak ditemukan!</h1>
//             ) : (
//               <table className="table w-full border border-gray-300">
//                 <thead>
//                   <tr>
//                     <th>No</th>
//                     <th>Id</th>
//                     <th>Nama Tipe</th>
//                     <th>Aksi</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {type.map((cp, index) => (
//                     <tr key={cp._id}>
//                       <td>{index + 1}</td>
//                       <td>{cp._id}</td>
//                       <td>{cp.type}</td>
//                       <td>
//                         <button
//                           className=" p-3 rounded-lg text-2xl "
//                           onClick={() => deleteTypeById(cp._id)}
//                         >
//                           <MdDelete />
//                         </button>
//                         <button
//                           className=" p-3 rounded-lg text-2xl "
//                           onClick={() => handleUpdateType(cp)}
//                         >
//                           <FaRegEdit />
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </div>
//       </div>

//       {isModalOpen && (
//         <Modal onClose={closeModalAdd} title={"Tambah Tipe"}>
//           <form onSubmit={handleSubmitAdd}>
//             <p className="font-semibold mt-4">Nama Tipe</p>
//             <input
//               type="text"
//               name="type"
//               value={typeDataAdd.type}
//               onChange={(e) => handleChangeAdd(e.target.value, e.target.name)}
//               className="border rounded-md p-2 w-full bg-white"
//               required
//             />

//             <div className="flex justify-end mt-5">
//               <button
//                 type="button"
//                 className="bg-gray-500 text-white p-2 rounded-lg mr-2"
//                 onClick={closeModalAdd}
//               >
//                 Batal
//               </button>
//               <button
//                 type="submit"
//                 // onClick={typeDataAdd}
//                 className="submitBtn"
//               >
//                 Tambah
//               </button>
//             </div>
//           </form>
//         </Modal>
//       )}
//       {isUpdateModalOpen && (
//         <Modal onClose={closeModalUpdate} title={"Edit Tipe"}>
//           <form onSubmit={handleSubmitUpdate}>
//             <p className="font-semibold mt-4">Nama Tipe</p>
//             <input
//               type="text"
//               name="type"
//               value={typeDataUpdate.type}
//               onChange={(e) =>
//                 handleChangeUpdate(e.target.value, e.target.name)
//               }
//               className="border rounded-md p-2 w-full bg-white"
//               required
//             />
//             <div className="flex justify-end mt-5">
//               <button
//                 type="submit"
//                 className="bg-blue-500 text-white p-2 rounded-lg"
//               >
//                 Simpan Perubahan
//               </button>
//             </div>
//           </form>
//         </Modal>
//       )}
//     </div>
//   );
// };

// export default TypeList;

import { useEffect, useState } from "react";

const TypeList = () => {
  const [types, setTypes] = useState([]);

  return (
    <div>
      <button>THIS BUTTON WILL BE TRIGGERED BROADCASTING "listtype"</button>
      <ul>
        <li>DATA RECEIVED:</li>
        {types.length === 0 ? (
          <li>Loading...</li>
        ) : (
          types.map((type, index) => (
            <li key={type._id}>
              {index + 1}. {type.type}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default TypeList;
