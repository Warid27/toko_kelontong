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
import { fetchExtrasGet } from "@/libs/fetching/extras";
import ReactPaginate from "react-paginate";

const Extras = () => {
  const [extrasData, setExtrasData] = useState({}); // Changed to object
  const [isLoading, setIsLoading] = useState(true);
  const [productList, setProductList] = useState([]); // State for list of products
  const [isExtrasModalOpen, setIsExtrasModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [extraDataUpdate, setExtraDataUpdate] = useState({
    id: "",
    name: "",
    deskripsi: "",
    id_product: "",
  });
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const id_store =
    localStorage.getItem("id_store") == "undefined"
      ? null
      : localStorage.getItem("id_store");
  const id_company =
    localStorage.getItem("id_company") == "undefined"
      ? null
      : localStorage.getItem("id_company");

  // --- Function
  const modalOpen = (param, bool) => {
    const setters = {
      open: setIsExtrasModalOpen,
    };
    if (setters[param]) {
      setters[param](bool);
    }
  };

  // Fetch extras data for a given product ID
  const getExtras = async (productId, extrasId) => {
    try {
      const data_extras = await fetchExtrasGet(extrasId);

      // Store the entire response data for the product
      setExtrasData((prevData) => ({
        ...prevData,
        [productId]: data_extras || {
          name: "Belum ada varian untuk produk ini",
        },
      }));
    } catch (error) {
      console.error("Error fetching extras:", error);
      setExtrasData((prevData) => ({
        ...prevData,
        [productId]: { name: "Belum ada varian untuk produk ini" },
      }));
    }
  };
  // Fetch product list on component mount
  useEffect(() => {
    const fetching_requirement = async () => {
      const get_product_list = async () => {
        const data_product = await fetchProductsList(id_store, id_company);
        setProductList(data_product);
        setIsLoading(false);
      };
      get_product_list();
    };
    fetching_requirement();
  }, []);

  // Fetch extras data for all products once productList is populated
  useEffect(() => {
    if (productList.length > 0) {
      productList.forEach((product) => {
        if (product.id_extras != null && product.id_extras !== "") {
          getExtras(product._id, product.id_extras);
        } else {
          setExtrasData((prevData) => ({
            ...prevData,
            [product._id]: {
              name: "Belum ada varian untuk produk ini",
              deskripsi: "Belum ada varian untuk produk ini",
              _id: null,
            },
          }));
        }
      });
    }
  }, [productList]);

  const handleChangeExtras = (e) => {
    const { name, value } = e.target;
    setExtrasData((prev) => ({
      ...prev,
      [extraDataUpdate._id]: {
        ...prev[extraDataUpdate._id],
        [name]: value,
      },
    }));
  };
  const handleExtrasDetailsChange = (index, field, value) => {
    setExtrasData((prev) => {
      const updatedDetails = [
        ...(prev[extraDataUpdate._id]?.extrasDetails || []),
      ];
      updatedDetails[index][field] = value;
      return {
        ...prev,
        [extraDataUpdate._id]: {
          ...prev[extraDataUpdate._id],
          extrasDetails: updatedDetails,
        },
      };
    });
  };

  const handleUpdateData = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const currentExtras = extrasData[extraDataUpdate._id];

      // Validation: Ensure all required fields are filled
      if (
        !currentExtras?.name ||
        currentExtras?.name === "Belum ada varian untuk produk ini" ||
        !currentExtras?.deskripsi
      ) {
        alert("Semua field harus diisi!"); // Show an error message
        return; // Stop further execution
      }

      // Update extras
      await client.post(
        `/api/submit-extras`,
        {
          name: currentExtras.name,
          deskripsi: currentExtras.deskripsi,
          id_product: extraDataUpdate._id,
          extrasDetails: currentExtras.extrasDetails,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Extras updated successfully");
      window.location.reload(); // Refresh the page after successful update
    } catch (error) {
      console.error(
        "Error updating extras:",
        error.response?.data || error.message
      );
    }
  };

  const handleAddData = async (e) => {
    e.preventDefault();
    try {
      // Retrieve the token from localStorage
      const token = localStorage.getItem("token");

      // Extract the current extras data for the product being updated
      const currentExtras = extrasData[extraDataUpdate._id];

      // Validation: Ensure all required fields are filled
      if (
        !currentExtras?.name ||
        currentExtras?.name === "Belum ada varian untuk produk ini" ||
        !currentExtras?.deskripsi
      ) {
        alert("Semua field harus diisi!"); // Show an error message
        return; // Stop further execution
      }

      // API call to add the new extras
      await client.post(
        `/api/submit-extras`,
        {
          name: currentExtras.name,
          deskripsi: currentExtras.deskripsi,
          id_product: extraDataUpdate._id,
          extrasDetails: currentExtras.extrasDetails,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Extras added successfully");
      window.location.reload(); // Refresh the page after successful addition
    } catch (error) {
      console.error(
        "Error adding extras:",
        error.response?.data || error.message
      );
    }
  };

  const filteredProductList = productList.filter((product) =>
    product.name_product.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startIndex = currentPage * itemsPerPage;
  const selectedData = filteredProductList.slice(startIndex, startIndex + itemsPerPage);

  if (isLoading) {
    return (
      <div className="w-full h-screen pt-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // INFO

  const addExtrasDetail = () => {
    setExtrasData((prev) => {
      const currentDetails = prev[extraDataUpdate._id]?.extrasDetails || [];
      return {
        ...prev,
        [extraDataUpdate._id]: {
          ...prev[extraDataUpdate._id],
          extrasDetails: [...currentDetails, { name: "", deskripsi: "" }],
        },
      };
    });
  };

  const removeExtrasDetail = (index) => {
    setExtrasData((prev) => {
      const currentDetails = [
        ...(prev[extraDataUpdate._id]?.extrasDetails || []),
      ];
      currentDetails.splice(index, 1);
      return {
        ...prev,
        [extraDataUpdate._id]: {
          ...prev[extraDataUpdate._id],
          extrasDetails: currentDetails,
        },
      };
    });
  };
  const handleUpdateExtras = (product) => {
    setExtraDataUpdate(product);
    modalOpen("open", true);
  };

  // DETAILS

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
              placeholder="Cari varian..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 pr-4 py-2 border border-gray-300 rounded-md w-full max-w-xs bg-white"
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
          <div >
            {filteredProductList.length === 0 ? (
              <h1 className="text-center text-gray-500">
                Data Varian tidak ditemukan!
              </h1>
            ) : (
              <>
              <table className="table w-full border border-gray-300">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Product</th>
                    <th>Nama Varian</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedData.map((product, index) => (
                    <tr key={product._id}>
                      <td>{startIndex + index + 1}</td>
                      <td>
                        <b>{product.name_product}</b>
                      </td>
                      <td> {extrasData[product._id]?.name || "Loading..."}</td>
                      <td>
                        <button
                          className="p-3 rounded-lg text-2xl"
                          onClick={() => handleUpdateExtras(product)}
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

      {isExtrasModalOpen && (
        <Modal onClose={() => modalOpen("open", false)} title={"Varian Produk"}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (extraDataUpdate.id_extras) {
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

            {/* Variant Name */}
            <p className="font-semibold mt-4">Nama Varian</p>
            <input
              type="text"
              name="name"
              value={extrasData[extraDataUpdate._id]?.name || ""}
              onChange={handleChangeExtras}
              className="border rounded-md p-2 w-full bg-white"
              required
            />

            {/* Variant Description */}
            <p className="font-semibold mt-4">Deskripsi Varian</p>
            <textarea
              name="deskripsi"
              value={extrasData[extraDataUpdate._id]?.deskripsi || ""}
              onChange={handleChangeExtras}
              className="border rounded-md p-2 w-full bg-white"
              required
            />

            {/* Extras Details Section */}
            <div id="extrasDetailsContainer">
              <p className="font-bold mt-4 text-lg">Detail Varian</p>
              {extrasData[extraDataUpdate._id]?.extrasDetails?.map(
                (detail, index) => (
                  <div key={index} className="extras-detail mb-12">
                    <div className="form-group">
                      <label>Nama Detail</label>
                      <input
                        type="text"
                        name={`extrasDetails[${index}][name]`}
                        value={detail.name || ""}
                        onChange={(e) =>
                          handleExtrasDetailsChange(
                            index,
                            "name",
                            e.target.value
                          )
                        }
                        className="border rounded-md p-2 w-full bg-white"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Deskripsi</label>
                      <textarea
                        name={`extrasDetails[${index}][deskripsi]`}
                        value={detail.deskripsi || ""}
                        onChange={(e) =>
                          handleExtrasDetailsChange(
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
                      className="dangerBtn float-end"
                      onClick={() => removeExtrasDetail(index)}
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
              className="addBtn mt-3"
              onClick={addExtrasDetail}
            >
              Tambah Detail Varian
            </button>

            {/* Action Buttons */}
            <div className="flex justify-end mt-5">
              <button
                type="button"
                className="closeBtn"
                onClick={() => modalOpen("open", false)}
              >
                Batal
              </button>
              <button
                type="submit"
                className={` ${
                  extraDataUpdate.id_extras ? "submitBtn" : "addBtn"
                }`}
              >
                {extraDataUpdate.id_extras ? "Update" : "Tambah"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Extras;
