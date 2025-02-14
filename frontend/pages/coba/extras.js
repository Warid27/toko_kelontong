import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { IoSearchOutline } from "react-icons/io5";
import Image from "next/image";
import { MdKeyboardArrowDown } from "react-icons/md";
import client from "@/libs/axios";
import { HiDotsHorizontal } from "react-icons/hi";
import Swal from "sweetalert2";
import { MdDelete } from "react-icons/md";
import { FaRegEdit, FaInfoCircle } from "react-icons/fa";
import { Modal } from "@/components/Modal";

const Extras = () => {
  const router = useRouter(); // Initialize the router
  const [extrases, setExtrases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [productList, setProductList] = useState([]); // State for list of products
  const [openDropdown, setOpenDropdown] = useState(null);
  const [extraToUpdate, setExtraToUpdate] = useState(null); // Untuk menyimpan Varian yang akan diupdate
  const [loading, setLoading] = useState(false); // Untuk loading saat update status

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const [extraDataAdd, setExtraDataAdd] = useState({
    name: "",
    deskripsi: "",
    id_product: "",
  });

  const [extraDataUpdate, setExtraDataUpdate] = useState({
    id: "",
    name: "",
    deskripsi: "",
    id_product: "",
  });

  // Function to navigate to the details page
  const extrasDetails = (id) => {
    router.push({
      pathname: "/dashboard",
      query: { extrasId: id }, // Pass the ID as a query parameter
    });
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("token");
        const id_store = localStorage.getItem("id_store");

        if (!id_store) {
          console.error("id_store is missing in localStorage");
          setIsLoading(false);
          return;
        }

        const response = await client.post(
          "/product/listproduct",
          { id_store: id_store }, // Pass id_store in the request body
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = response.data;

        if (!Array.isArray(data)) {
          console.error(
            "Unexpected data format from /product/listproduct:",
            data
          );
          setProductList([]);
        } else {
          setProductList(data);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProductList([]);
      }
    };
    fetchProduct();
  }, []);

  const openModalAdd = () => {
    setIsModalOpen(true);
  };

  const closeModalAdd = () => {
    setIsModalOpen(false);
  };
  const openModalUpdate = () => {
    setIsUpdateModalOpen(true);
  };

  const closeModalUpdate = () => {
    setIsUpdateModalOpen(false);
  };

  const handleStatus = async (extrasId, currentStatus) => {
    try {
      setLoading(true);

      const newStatus = currentStatus === 0 ? 1 : 0;

      const response = await client.put(`/api/extras/${extrasId}`, {
        status: newStatus === 0 ? 0 : 1,
      });

      console.log("Response from API:", response.data);

      setExtrases((prevExtrases) =>
        prevExtrases.map((extras) =>
          extras._id === extrasId ? { ...extras, status: newStatus } : extras
        )
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchExtrases = async () => {
      try {
        const token = localStorage.getItem("token");
        const id_store = localStorage.getItem("id_store");

        const response = await client.post("/extras/listextras", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: {
            id_store: id_store,
          },
        });

        // Set the fetched extrases into state
        setExtrases(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching extrases:", error);
        setIsLoading(false);
      }
    };

    fetchExtrases();
  }, []);

  const handleUpdateExtra = (extras) => {
    setExtraToUpdate(extras); // Menyimpan Varian yang dipilih
    setIsUpdateModalOpen(true);

    console.log(extras);
  };

  const deleteExtraById = async (id) => {
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
        const token = localStorage.getItem("token");
        const response = await client.delete(`/api/extras/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          Swal.fire("Berhasil", "Varian berhasil dihapus!", "success");
          setExtrases((prevExtrases) =>
            prevExtrases.filter((p) => p._id !== id)
          );
        }
      } catch (error) {
        console.error("Gagal menghapus Varian:", error.message);
        Swal.fire("Gagal", "Varian tidak dapat dihapus!", "error");
      }
    }
  };

  const handleChangeAdd = (e) => {
    const { name, value } = e.target;
    setExtraDataAdd((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      // Ensure all required fields are filled
      if (
        !extraDataAdd.name ||
        !extraDataAdd.deskripsi ||
        !extraDataAdd.id_product
      ) {
        alert("Please fill all required fields.");
        return;
      }

      const response = await client.post(
        "/extras/addextras",
        {
          name: extraDataAdd.name,
          deskripsi: extraDataAdd.deskripsi,
          id_product: extraDataAdd.id_product,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("extras added:", response.data);
      Swal.fire("Berhasil", "Varian berhasil ditambahkan!", "success");

      // Reload the page or update state
      closeModalAdd;
      window.location.reload();
    } catch (error) {
      console.error("Error adding extras:", error);
    }
  };

  useEffect(() => {
    if (extraToUpdate) {
      setExtraDataUpdate({
        id: extraToUpdate._id || "",
        name: extraToUpdate.name || "",
        deskripsi: extraToUpdate.deskripsi || "",
        id_product: extraToUpdate.id_product || "",
      });
    }
  }, [extraToUpdate]);

  const handleChangeUpdate = (e) => {
    const { name, value } = e.target;
    setExtraDataUpdate((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    for (const key in extraDataUpdate) {
      formData.append(key, extraDataUpdate[key]);
    }

    try {
      // const extrasId = "67a9615bf59ec80d10014871";
      const token = localStorage.getItem("token");
      const response = await client.put(
        `/api/extras/${extraDataUpdate.id}`,
        {
          name: extraDataUpdate.name,
          deskripsi: extraDataUpdate.deskripsi,
          id_product: extraDataUpdate.id_product,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("extras updated successfully:", response.data);
      window.location.reload();
    } catch (error) {
      console.error("Error updating extras:", error);
    }
  };

  // const closeModal = () => {
  //   setIsModalOpen(false);
  // };

  if (isLoading) {
    return (
      <div className="w-full h-screen pt-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  return (
    <div className="w-full h-screen pt-16">
      <div className="justify-between w-full bg-white shadow-lg p-4">
        <div className="flex flex-row justify-between">
          <div className="flex flex-col">
            <p className="text-2xl font-bold">Daftar Varian</p>
            <p>Detail Daftar Varian</p>
          </div>
          <div className="relative mt-2 flex flex-row space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search anything here"
                className="pl-10 h-10 pr-4 py-2 border border-gray-300 rounded-md w-full max-w-xs"
              />
              <IoSearchOutline className="absolute left-2 top-2.5 text-xl text-gray-500" />
            </div>
            <div className="avatar">
              <div className="w-10 h-10 rounded-full">
                <Image
                  src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                  alt="avatar"
                  width={40}
                  height={40}
                />
              </div>
            </div>
            <button className="button btn-ghost btn-sm rounded-lg">
              <MdKeyboardArrowDown className="text-2xl mt-1" />
            </button>
          </div>
        </div>
        <div className="flex flex-row justify-between mt-8">
          <div>
            <select className="select w-full max-w-xs bg-white border-gray-300">
              <option disabled selected>
                Best sellers
              </option>
              <option>Ricebowl</option>
              <option>Milkshake</option>
            </select>
          </div>
          <div>
            <button
              className="button bg-[#FDDC05] text-white p-2 rounded-lg font-bold"
              onClick={openModalAdd}
            >
              + Tambah Varian
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          <div className="overflow-x-auto">
            {extrases.length === 0 ? (
              <h1>Data Varian tidak ditemukan!</h1>
            ) : (
              <table className="table w-full border border-gray-300">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Varian</th>
                    <th>Deskripsi</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {extrases.map((extras, index) => (
                    <tr key={extras._id}>
                      <td>{index + 1}</td>
                      <td>
                        <b>{extras.name}</b>
                      </td>
                      <td>{extras.deskripsi}</td>
                      <td className="flex space-x-4">
                        {" "}
                        {/* Beri jarak antar tombol */}
                        <button
                          className=" p-3 rounded-lg text-2xl "
                          onClick={() => deleteExtraById(extras._id)}
                        >
                          <MdDelete />
                        </button>
                        <button
                          className=" p-3 rounded-lg text-2xl "
                          onClick={() => handleUpdateExtra(extras)}
                        >
                          <FaRegEdit />
                        </button>
                        <button
                          className=" p-3 rounded-lg text-2xl "
                          onClick={() => extrasDetails(extras._id)}
                        >
                          <FaInfoCircle />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <Modal onClose={closeModalAdd} title={"Tambah Varian"}>
          <form onSubmit={handleSubmitAdd}>
            <p className="font-semibold mt-4">Nama Varian</p>
            <input
              type="text"
              name="name"
              value={extraDataAdd.name}
              onChange={handleChangeAdd}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4">Deskripsi Varian</p>
            <textarea
              name="deskripsi"
              value={extraDataAdd.deskripsi}
              onChange={handleChangeAdd}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4 mb-2">Product</p>
            <select
              id="product"
              className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={extraDataAdd.id_product}
              onChange={(e) =>
                setExtraDataAdd((prevState) => ({
                  ...prevState,
                  id_product: e.target.value,
                }))
              }
              required
            >
              <option value="" disabled>
                === Pilih Products ===
              </option>

              {productList.length === 0 ? (
                <option value="default">No products available</option>
              ) : (
                productList.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name_product}
                  </option>
                ))
              )}
            </select>
            <div className="flex justify-end mt-5">
              <button
                type="button"
                className="bg-gray-500 text-white p-2 rounded-lg mr-2"
                onClick={closeModalAdd}
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded-lg"
              >
                Tambah
              </button>
            </div>
          </form>
        </Modal>
      )}

      {isUpdateModalOpen && (
        <Modal onClose={closeModalUpdate} title={"Edit Varian"}>
          <form onSubmit={handleSubmitUpdate}>
            <p className="font-semibold mt-4">Nama Varian</p>
            <input
              type="text"
              name="name"
              value={extraDataUpdate.name}
              onChange={handleChangeUpdate}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4">Deskripsi Varian</p>
            <textarea
              name="deskripsi"
              value={extraDataUpdate.deskripsi}
              onChange={handleChangeUpdate}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4 mb-2">Product</p>
            <select
              id="product"
              className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={extraDataUpdate.id_product}
              onChange={(e) =>
                setExtraDataUpdate((prevState) => ({
                  ...prevState,
                  id_product: e.target.value,
                }))
              }
              required
            >
              <option value="" disabled>
                === Pilih Products ===
              </option>

              {productList.length === 0 ? (
                <option value="default">No products available</option>
              ) : (
                productList.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name_product}
                  </option>
                ))
              )}
            </select>
            <div className="flex justify-end mt-5">
              <button
                type="button"
                className="bg-gray-500 text-white p-2 rounded-lg mr-2"
                onClick={closeModalUpdate}
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded-lg"
              >
                Edit
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Extras;
