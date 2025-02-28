import React, { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import Image from "next/image";
import { MdKeyboardArrowDown } from "react-icons/md";
import client from "@/libs/axios";
import { HiDotsHorizontal } from "react-icons/hi";
import Swal from "sweetalert2";
import { MdDelete } from "react-icons/md";
import { FaRegEdit, FaInfoCircle } from "react-icons/fa";
import { Modal } from "@/components/Modal";
import { fetchProductsList } from "@/libs/fetching/product";
import { fetchSizeGet } from "@/libs/fetching/size";
import ReactPaginate from "react-paginate";

const Size = () => {
  const [sizeData, setSizeData] = useState({}); // Changed to object
  const [isLoading, setIsLoading] = useState(true);
  const [productList, setProductList] = useState([]); // State for list of products
  const [isSizeModelOpen, setIsSizeModelOpen] = useState(false);
  const [extraDataUpdate, setExtraDataUpdate] = useState({
    id: "",
    name: "",
    deskripsi: "",
    id_product: "",
  });
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetching_requirement = async () => {
      const id_store = localStorage.getItem("id_store");
      const get_product_list = async () => {
        const data_product = await fetchProductsList(id_store);
        setProductList(data_product);
        setIsLoading(false)
      };
      get_product_list();
    };
    fetching_requirement();
  }, []);

  // Fetch size data for a given product ID
  const getSize = async (productId, sizeId) => {
    try {
      // const token = localStorage.getItem("token");
      // const response = await client.post(
      //   "/size/getsize",
      //   { id: sizeId }, // Use `data` for Axios payload
      //   {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //       "Content-Type": "application/json",
      //     },
      //   }
      // );
      const data_size = await fetchSizeGet(sizeId);

      // Store the entire response data for the product
      setSizeData((prevData) => ({
        ...prevData,
        [productId]: data_size || {
          name: "Belum ada ukuran untuk produk ini",
        },
      }));
    } catch (error) {
      console.error(
        "Error fetching size:", error);
      setSizeData((prevData) => ({
        ...prevData,
        [productId]: { name: "Belum ada ukuran untuk produk ini" },
      }));
    }
  };

  // Fetch size data for all products once productList is populated
  useEffect(() => {
    if (productList.length > 0) {
      productList.forEach((product) => {
        if (product.id_size != null && product.id_size !== "") {
          getSize(product._id, product.id_size);
        } else {
          setSizeData((prevData) => ({
            ...prevData,
            [product._id]: {
              name: "Belum ada ukuran untuk produk ini",
              deskripsi: "Belum ada ukuran untuk produk ini",
              _id: null,
            },
          }));
        }
      });
    }
  }, [productList]);

  const closeModalUpdate = () => {
    setIsSizeModelOpen(false);
  };

  const handleChangeSize = (e) => {
    const { name, value } = e.target;
    setSizeData((prev) => ({
      ...prev,
      [extraDataUpdate._id]: {
        ...prev[extraDataUpdate._id],
        [name]: value,
      },
    }));
  };

  const handleSizeDetailsChange = (index, field, value) => {
    setSizeData((prev) => {
      const updatedDetails = [
        ...(prev[extraDataUpdate._id]?.sizeDetails || []),
      ];
      updatedDetails[index][field] = value;
      return {
        ...prev,
        [extraDataUpdate._id]: {
          ...prev[extraDataUpdate._id],
          sizeDetails: updatedDetails,
        },
      };
    });
  };

  const handleUpdateData = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const currentSize = sizeData[extraDataUpdate._id];

      // Validation: Ensure all required fields are filled
      if (
        !currentSize?.name ||
        currentSize?.name === "Belum ada ukuran untuk produk ini" ||
        !currentSize?.deskripsi
      ) {
        alert("Semua field harus diisi!"); // Show an error message
        return; // Stop further execution
      }

      // Update size
      await client.post(
        `/api/submit-size`,
        {
          name: currentSize.name,
          deskripsi: currentSize.deskripsi,
          id_product: extraDataUpdate._id,
          sizeDetails: currentSize.sizeDetails,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Size updated successfully");
      window.location.reload(); // Refresh the page after successful update
    } catch (error) {
      console.error(
        "Error updating size:",
        error.response?.data || error.message
      );
    }
  };

  const handleAddData = async (e) => {
    e.preventDefault();
    try {
      // Retrieve the token from localStorage
      const token = localStorage.getItem("token");

      // Extract the current size data for the product being updated
      const currentSize = sizeData[extraDataUpdate._id];

      // Validation: Ensure all required fields are filled
      if (
        !currentSize?.name ||
        currentSize?.name === "Belum ada ukuran untuk produk ini" ||
        !currentSize?.deskripsi
      ) {
        alert("Semua field harus diisi!"); // Show an error message
        return; // Stop further execution
      }

      // API call to add the new size
      await client.post(
        `/api/submit-size`,
        {
          name: currentSize.name,
          deskripsi: currentSize.deskripsi,
          id_product: extraDataUpdate._id,
          sizeDetails: currentSize.sizeDetails,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Size added successfully");
      window.location.reload(); // Refresh the page after successful addition
    } catch (error) {
      console.error(
        "Error adding size:",
        error.response?.data || error.message
      );
    }
  };

  const startIndex = currentPage * itemsPerPage;
  const selectedData = productList.slice(startIndex, startIndex + itemsPerPage);

  if (isLoading) {
    return (
      <div className="w-full h-screen pt-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // INFO

  const addSizeDetail = () => {
    setSizeData((prev) => {
      const currentDetails = prev[extraDataUpdate._id]?.sizeDetails || [];
      return {
        ...prev,
        [extraDataUpdate._id]: {
          ...prev[extraDataUpdate._id],
          sizeDetails: [...currentDetails, { name: "", deskripsi: "" }],
        },
      };
    });
  };

  const removeSizeDetail = (index) => {
    setSizeData((prev) => {
      const currentDetails = [
        ...(prev[extraDataUpdate._id]?.sizeDetails || []),
      ];
      currentDetails.splice(index, 1);
      return {
        ...prev,
        [extraDataUpdate._id]: {
          ...prev[extraDataUpdate._id],
          sizeDetails: currentDetails,
        },
      };
    });
  };
  const handleUpdateSize = (product) => {
    setExtraDataUpdate(product);
    setIsSizeModelOpen(true);

    console.log(product);
  };

  // DETAILS

  return (
    <div className="w-full h-screen pt-16">
      <div className="justify-between w-full bg-white shadow-lg p-4">
        <div className="flex flex-row justify-between">
          <div className="flex flex-col">
            <p className="text-2xl font-bold">Daftar Ukuran</p>
            <p>Detail Daftar Ukuran</p>
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
        </div>
      </div>

      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          <div>
            {productList.length === 0 ? (
              <h1 className="text-center text-gray-500">
                Data Ukuran tidak ditemukan!
              </h1>
            ) : (
              <>
              <table className="table w-full border border-gray-300">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Product</th>
                    <th>Nama Ukuran</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedData.map((product, index) => (
                    <tr key={product._id}>
                      <td>{index + 1}</td>
                      <td>
                        <b>{product.name_product}</b>
                      </td>
                      <td> {sizeData[product._id]?.name || "Loading..."}</td>
                      <td>
                        <button
                          className="p-3 rounded-lg text-2xl"
                          onClick={() => handleUpdateSize(product)}
                        >
                          <FaInfoCircle />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <ReactPaginate
                previousLabel={"← Prev"}
                nextLabel={"Next →"}
                pageCount={Math.ceil(productList.length / itemsPerPage)}
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

      {isSizeModelOpen && (
        <Modal onClose={closeModalUpdate} title={"Ukuran Produk"}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (extraDataUpdate.id_size) {
                handleUpdateData(e);
              } else {
                handleAddData(e);
              }
            }}
          >
            {/* Product Name */}
            <p className="font-semibold mt-4">Nama Produk</p>
            <input
              type="text"
              name="name_product"
              value={extraDataUpdate.name_product || ""}
              className="border rounded-md p-2 w-full bg-white"
              disabled
            />

            {/* Ukurant Name */}
            <p className="font-semibold mt-4">Nama Ukuran</p>
            <input
              type="text"
              name="name"
              value={sizeData[extraDataUpdate._id]?.name || ""}
              onChange={handleChangeSize}
              className="border rounded-md p-2 w-full bg-white"
              required
            />

            {/* Ukurant Description */}
            <p className="font-semibold mt-4">Deskripsi Ukuran</p>
            <textarea
              name="deskripsi"
              value={sizeData[extraDataUpdate._id]?.deskripsi || ""}
              onChange={handleChangeSize}
              className="border rounded-md p-2 w-full bg-white"
              required
            />

            {/* Size Details Section */}
            <div id="sizeDetailsContainer">
              <p className="font-bold mt-4 text-lg">Detail Ukuran</p>
              {sizeData[extraDataUpdate._id]?.sizeDetails?.map(
                (detail, index) => (
                  <div key={index} className="size-detail">
                    <div className="form-group">
                      <label>Nama Detail</label>
                      <input
                        type="text"
                        name={`sizeDetails[${index}][name]`}
                        value={detail.name || ""}
                        onChange={(e) =>
                          handleSizeDetailsChange(index, "name", e.target.value)
                        }
                        className="border rounded-md p-2 w-full bg-white"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Deskripsi</label>
                      <textarea
                        name={`sizeDetails[${index}][deskripsi]`}
                        value={detail.deskripsi || ""}
                        onChange={(e) =>
                          handleSizeDetailsChange(
                            index,
                            "deskripsi",
                            e.target.value
                          )
                        }
                        className="border rounded-md p-2 w-full bg-white"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      className="bg-red-500 text-white p-2 rounded-lg mt-2"
                      onClick={() => removeSizeDetail(index)}
                    >
                      Hapus
                    </button>
                  </div>
                )
              )}
            </div>

            {/* Add Detail Button */}
            <button
              type="button"
              className="bg-green-500 text-white p-2 rounded-lg mt-3"
              onClick={addSizeDetail}
            >
              Tambah Detail Ukuran
            </button>

            {/* Action Buttons */}
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
                className={`p-2 rounded-lg ${
                  extraDataUpdate.id_size ? "bg-blue-500" : "bg-green-500"
                } text-white`}
              >
                {extraDataUpdate.id_size ? "Update" : "Tambah"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Size;
