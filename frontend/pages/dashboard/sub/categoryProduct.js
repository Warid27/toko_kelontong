import React, { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import Image from "next/image";
import { MdKeyboardArrowDown } from "react-icons/md";
import client from "@/libs/axios";
import { Modal } from "@/components/Modal";
import { HiDotsHorizontal } from "react-icons/hi";
import Swal from "sweetalert2";
import { MdDelete } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import { fetchCategoryList, fetchCategoryAdd } from "@/libs/fetching/category";

const CategoryProduct = () => {
  const [categoryProduct, setCategoryProduct] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [categoryProductToUpdate, setCategoryProductToUpdate] = useState(null); // Untuk menyimpan produk yang akan diupdate
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); // Untuk mengontrol tampilan modal update
  const [loading, setLoading] = useState(false); // Untuk loading saat update status
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10; 

  const [categoryProductDataAdd, setCategoryProductDataAdd] = useState({
    name_category: "",
    id_store: ""
  });

  const [categoryProductDataUpdate, setCategoryProductDataUpdate] = useState({
    id: "",
    name_category: "",
    id_store: ""
  });

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
      const get_category_list = async () => {
        const data_category = await fetchCategoryList();
        setCategoryProduct(data_category);
        setIsLoading(false);
      };
      get_category_list();
    };
    fetching_requirement();
  }, []);

  const handleUpdateCategoryProduct = (categoryProduct, params) => {
    setCategoryProductToUpdate(categoryProduct); // Menyimpan produk yang dipilih
    modalOpen(params, true);

    console.log(categoryProduct);
  };

  const deleteCategoryProductById = async (id) => {
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
        const response = await client.delete(`/api/category/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          Swal.fire("Berhasil", "CategoryProduct berhasil dihapus!", "success");
          setCategoryProduct((prevCategoryProducts) =>
            prevCategoryProducts.filter((p) => p._id !== id)
          );
        }
      } catch (error) {
        console.error("Gagal menghapus CategoryProduct:", error.message);
        Swal.fire("Gagal", "CategoryProduct tidak dapat dihapus!", "error");
      }
    }
  };

  const handleChangeAdd = (value, name) => {
    setCategoryProductDataAdd((prevState) => ({
      ...prevState,
      [name]: value instanceof Date ? value.toISOString() : value,
    }));
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      // Ensure all required fields are filled
      if (!categoryProductDataAdd.name_category) {
        alert("Please fill all required fields.");
        return;
      }

      // Send product data to the backend
      const response = await fetchCategoryAdd(
        categoryProductDataAdd.name_category

      );

      // Auto Reload
      modalOpen("add", false);
      Swal.fire("Berhasil", "Kategori Produk berhasil ditambahkan!", "success");
      setCategoryProduct((prevCategoryProducts) => [
        ...prevCategoryProducts,
        response,
      ]);
    } catch (error) {
      console.error("Error adding CategoryProduct:", error);
    }
  };

  useEffect(() => {
    if (categoryProductToUpdate) {
      setCategoryProductDataUpdate({
        id: categoryProductToUpdate._id || "",
        name_category: categoryProductToUpdate.name_category || "",
      });
    }
  }, [categoryProductToUpdate]);

  const handleChangeUpdate = (value, name) => {
    setCategoryProductDataUpdate((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    for (const key in categoryProductDataUpdate) {
      formData.append(key, categoryProductDataUpdate[key]);
    }

    try {
      // const productId = "67a9615bf59ec80d10014871";
      const token = localStorage.getItem("token");
      const response = await client.put(
        `/api/category/${categoryProductDataUpdate.id}`,
        {
          name_category: categoryProductDataUpdate.name_category || "",
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Auto Reload
      modalOpen("update", false);
      Swal.fire("Berhasil", "Produk berhasil diupdate!", "success");
      setCategoryProduct((prevCategoryProducts) =>
        prevCategoryProducts.map((categoryProduct) =>
          categoryProduct._id === categoryProductDataUpdate.id
            ? response.data
            : categoryProduct
        )
      );
    } catch (error) {
      console.error("Error updating CategoryProduct:", error);
    }
  };

  const startIndex = currentPage * itemsPerPage;
  const selectedData = categoryProduct.slice(startIndex, startIndex + itemsPerPage);

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
            <p className="text-2xl font-bold">Daftar Category Product</p>
            <p>Detail Daftar Category Product</p>
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
              <option value="">Best sellers</option>
              <option value="">Ricebowl</option>
              <option value="">Milkshake</option>
            </select>
          </div>
          <div>
            <button className="addBtn" onClick={() => modalOpen("add", true)}>
              + Tambah CategoryProduct
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          <div>
            {categoryProduct.length === 0 ? (
              <h1>Data Category Product tidak ditemukan!</h1>
            ) : (
              <>
              <table className="table w-full border border-gray-300">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Category Product</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedData.map((cp, index) => (
                    <tr key={cp._id}>
                      <td>{startIndex + index + 1}</td>
                      <td>{cp.name_category}</td>
                      <td>
                        <button
                          className=" p-3 rounded-lg text-2xl "
                          onClick={() => deleteCategoryProductById(cp._id)}
                        >
                          <MdDelete />
                        </button>
                        <button
                          className=" p-3 rounded-lg text-2xl "
                          onClick={() =>
                            handleUpdateCategoryProduct(cp, "update")
                          }
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
                pageCount={Math.ceil(categoryProduct.length / itemsPerPage)}
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

      {isModalOpen && (
        <Modal
          onClose={() => modalOpen("add", false)}
          title={"Tambah Category Product"}
        >
          <form onSubmit={handleSubmitAdd}>
            <p className="font-semibold mt-4">Nama Category Product</p>
            <input
              type="text"
              name="name_category"
              value={categoryProductDataAdd.name_category}
              onChange={(e) => handleChangeAdd(e.target.value, e.target.name)}
              className="border rounded-md p-2 w-full bg-white"
              required
            />

            <div className="flex justify-end mt-5">
              <button
                type="button"
                className="bg-gray-500 text-white p-2 rounded-lg mr-2"
                onClick={() => modalOpen("add", false)}
              >
                Batal
              </button>
              <button
                type="submit"
                // onClick={categoryProductDataAdd}
                className="bg-blue-500 text-white p-2 rounded-lg"
              >
                Tambah
              </button>
            </div>
          </form>
        </Modal>
      )}
      {isUpdateModalOpen && (
        <Modal
          onClose={() => modalOpen("update", false)}
          title={"Edit Category Product"}
        >
          <form onSubmit={handleSubmitUpdate}>
            <p className="font-semibold mt-4">Nama Category Product</p>
            <input
              type="text"
              name="name_category"
              value={categoryProductDataUpdate.name_category}
              onChange={(e) =>
                handleChangeUpdate(e.target.value, e.target.name)
              }
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <div className="flex justify-end mt-5">
              <button
                className="closeBtn"
                onClick={() => modalOpen("update", false)}
              >
                Close
              </button>
              <button type="submit" className="submitBtn">
                Simpan
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default CategoryProduct;
