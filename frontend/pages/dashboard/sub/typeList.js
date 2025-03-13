import React, { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import Image from "next/image";
import { MdKeyboardArrowDown } from "react-icons/md";
import client from "@/libs/axios";
import { Modal } from "@/components/Modal";
import Swal from "sweetalert2";
import Header from "@/components/section/header";
import { MdDelete } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import { fetchTypeList, fetchTypeAdd } from "@/libs/fetching/type";
import ReactPaginate from "react-paginate";
import { SubmitButton } from "@/components/form/button";
import { CloseButton } from "@/components/form/button";

const TypeList = () => {
  const [type, setType] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [typeToUpdate, setTypeToUpdate] = useState(null); // Untuk menyimpan produk yang akan diupdate
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); // Untuk mengontrol tampilan modal update
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const [typeDataAdd, setTypeDataAdd] = useState({
    type: "",
  });

  const [typeDataUpdate, setTypeDataUpdate] = useState({
    id: "",
    type: "",
  });
  const token = localStorage.getItem("token");

  // --- Function
  const modalOpen = (param, bool) => {
    const setters = {
      add: setIsModalOpen,
      update: setIsUpdateModalOpen,
    };
    if (setters[param]) {
      setters[param](bool);
    }
  };

  useEffect(() => {
    const fetching_requirement = async () => {
      const get_type_list = async () => {
        const data_type = await fetchTypeList(token);
        setType(data_type);
        setIsLoading(false);
      };
      get_type_list();
    };
    fetching_requirement();
  }, []);
  // useEffect(() => {
  //   const unsubscribe = fetchTypeStream((newData) => {
  //     setType((prevTypes) => [...prevTypes, newData]); // Menambahkan data baru ke list
  //   });
  //   setIsLoading(false);
  //   return () => unsubscribe(); // Cleanup saat unmount
  // }, []);

  const handleUpdateType = (type) => {
    setTypeToUpdate(type); // Menyimpan produk yang dipilih
    modalOpen("update", true);

    console.log(type);
  };

  const deleteTypeById = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    });

    if (result.isConfirmed) {
      try {
        const response = await client.delete(`/api/type/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          Swal.fire("Berhasil", "Type berhasil dihapus!", "success");
          setType((prevTypes) => prevTypes.filter((p) => p._id !== id));
        }
      } catch (error) {
        console.error("Gagal menghapus Type:", error.message);
        Swal.fire("Gagal", "Type tidak dapat dihapus!", "error");
      }
    }
  };

  const handleChangeAdd = (value, name) => {
    setTypeDataAdd((prevState) => ({
      ...prevState,
      [name]: value instanceof Date ? value.toISOString() : value,
    }));
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    console.log("datanya cok asuk", typeDataAdd);

    try {
      // Ensure all required fields are filled
      if (!typeDataAdd.type) {
        alert("Please fill all required fields.");
        return;
      }

      // Send product data to the backend
      const response = await fetchTypeAdd(typeDataAdd.type);

      console.log("Type added:", response);
      Swal.fire("Berhasil", "Type berhasil ditambahkan!", "success");

      // Reload the page or update state
      // onClose();
      window.location.reload();
    } catch (error) {
      console.error("Error adding Type:", error);
    }
  };

  useEffect(() => {
    if (typeToUpdate) {
      setTypeDataUpdate({
        id: typeToUpdate._id || "",
        type: typeToUpdate.type || "",
      });
    }
  }, [typeToUpdate]);

  const handleChangeUpdate = (value, name) => {
    setTypeDataUpdate((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    for (const key in typeDataUpdate) {
      formData.append(key, typeDataUpdate[key]);
    }

    try {
      // const productId = "67a9615bf59ec80d10014871";
      const response = await client.put(
        `/api/type/${typeDataUpdate.id}`,
        {
          type: typeDataUpdate.type || "",
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Type updated successfully:", response.data);
      // onClose();
      window.location.reload();
    } catch (error) {
      console.error("Error updating Type:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen pt-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const filteredTypeList = type.filter((t) =>
    t.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Hitung data yang akan ditampilkan berdasarkan halaman
  const startIndex = currentPage * itemsPerPage;
  const selectedData = filteredTypeList.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="w-full h-screen pt-16 relative">
      
      <Header
        title="Daftar Type"
        subtitle="Detail Daftar Type"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        modalOpen={modalOpen}
        isSearch={true}
        isAdd={true}
      />

      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          <div className="overflow-x-auto">
            {filteredTypeList.length === 0 ? (
              <h1>Data Tipe tidak ditemukan!</h1>
            ) : (
              <>
                <table className="table w-full border border-gray-300">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Id</th>
                      <th>Nama Tipe</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedData.map((cp, index) => (
                      <tr key={cp._id}>
                        <td>{startIndex + index + 1}</td>
                        <td>{cp._id}</td>
                        <td>{cp.type}</td>
                        <td>
                          <button
                            className=" p-3 rounded-lg text-2xl "
                            onClick={() => deleteTypeById(cp._id)}
                          >
                            <MdDelete />
                          </button>
                          <button
                            className=" p-3 rounded-lg text-2xl "
                            onClick={() => handleUpdateType(cp)}
                          >
                            <FaRegEdit />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <ReactPaginate
                  previousLabel={"← Prev"}
                  nextLabel={"Next →"}
                  pageCount={Math.ceil(type.length / itemsPerPage)}
                  onPageChange={({ selected }) => setCurrentPage(selected)}
                  containerClassName={"flex gap-2 justify-center mt-4"}
                  pageLinkClassName={"border px-3 py-1"}
                  previousLinkClassName={"border px-3 py-1"}
                  nextLinkClassName={"border px-3 py-1"}
                  activeClassName={"bg-blue-500 text-white"}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => modalOpen("add", false)}
        title="Tambah Type"
      >
          <form onSubmit={handleSubmitAdd}>
            <p className="font-semibold mt-4">Nama Tipe</p>
            <input
              type="text"
              name="type"
              value={typeDataAdd.type}
              onChange={(e) => handleChangeAdd(e.target.value, e.target.name)}
              className="border rounded-md p-2 w-full bg-white"
              required
            />

            <div className="flex justify-end mt-5">
            <CloseButton onClick={() => modalOpen("add", false)}/>
            <SubmitButton/>
            </div>
          </form>
        </Modal>
        <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => modalOpen("update", false)}
        title={`Edit Perusahaan`}
      >
          <form onSubmit={handleSubmitUpdate}>
            <p className="font-semibold mt-4">Nama Tipe</p>
            <input
              type="text"
              name="type"
              value={typeDataUpdate.type}
              onChange={(e) =>
                handleChangeUpdate(e.target.value, e.target.name)
              }
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <div className="flex justify-end mt-5">
            <CloseButton onClick={() => modalOpen("update", false)}/>
            <SubmitButton/>
            </div>
          </form>
        </Modal>
    </div>
  );
};

export default TypeList;
