import React, { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import Image from "next/image";
import { MdKeyboardArrowDown } from "react-icons/md";
import client from "@/libs/axios";
import { HiDotsHorizontal } from "react-icons/hi";
import Swal from "sweetalert2";
import { MdDelete } from "react-icons/md";
import { FaInfoCircle } from "react-icons/fa";
import { Modal } from "@/components/Modal";
import { LiaCloudUploadAltSolid } from "react-icons/lia";
import {fetchPaymentList, fetchPaymentAdd} from "@/libs/fetching/payment"
import ReactPaginate from "react-paginate";

const Payment = () => {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentToUpdate, setPaymentToUpdate] = useState(null); // Untuk menyimpan Pembayaran yang akan diupdate

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState("");

  const [paymentDataAdd, setPaymentDataAdd] = useState({
    payment_method: "",
    keterangan: "",
  });

  const [paymentDataUpdate, setPaymentDataUpdate] = useState({
    id: "",
    payment_method: "",
    keterangan: "",
    paymentName: [], // Initialize as an empty array
  });

  // MODALS
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


  useEffect(() => {
    const fetching_requirement = async () => {
      const get_payment_list = async () => {
        const data_payment = await fetchPaymentList();
        setPayments(data_payment);
        setIsLoading(false)
      };
      get_payment_list();
    };
    fetching_requirement();
  }, []);

  // HANDLE
  const handleUpdatePayment = (payment) => {
    setPaymentToUpdate(payment); // Menyimpan Pembayaran yang dipilih
    setIsUpdateModalOpen(true);

    console.log(payment);
  };

  const deletePaymentById = async (id) => {
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
        const response = await client.delete(`/api/payment/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          Swal.fire("Berhasil", "Pembayaran berhasil dihapus!", "success");
          setPayments((prevPayments) =>
            prevPayments.filter((p) => p._id !== id)
          );
        }
      } catch (error) {
        console.error("Gagal menghapus Pembayaran:", error.message);
        Swal.fire("Gagal", "Pembayaran tidak dapat dihapus!", "error");
      }
    }
  };

  const handleChangeAdd = (e) => {
    const { name, value } = e.target;
    setPaymentDataAdd((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();

    try {
      // Ensure all required fields are filled
      if (!paymentDataAdd.payment_method || !paymentDataAdd.keterangan) {
        alert("Please fill all required fields.");
        return;
      }

      const response = await fetchPaymentAdd(paymentDataAdd.payment_method, paymentDataAdd.keterangan)

      console.log("Payment added:", response);
      Swal.fire("Berhasil", "Pembayaran berhasil ditambahkan!", "success");

      // Reload the page or update state
      closeModalAdd();
      window.location.reload();
    } catch (error) {
      console.error("Error adding payment:", error);
    }
  };

  // AUTO SETPAYMENT DATA
  useEffect(() => {
    if (paymentToUpdate) {
      setPaymentDataUpdate({
        id: paymentToUpdate._id || "",
        payment_method: paymentToUpdate.payment_method || "",
        keterangan: paymentToUpdate.keterangan || "",
        paymentName: paymentToUpdate.paymentName || "",
      });
    }
  }, [paymentToUpdate]);

  // HANDLE
  const handleChangeUpdate = (e) => {
    const { name, value } = e.target;
    setPaymentDataUpdate((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const updatedData = {
        payment_method: paymentDataUpdate.payment_method,
        keterangan: paymentDataUpdate.keterangan,
        paymentName: paymentDataUpdate.paymentName, // Include the paymentName array
      };

      const response = await client.put(
        `/api/payment/${paymentDataUpdate.id}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Payment updated successfully:", response.data);
      window.location.reload();
    } catch (error) {
      console.error("Error updating payment:", error);
    }
  };

  // UPLOADS
  const handleImageChangeUpdate = async (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);
      console.log("FormData:", formData);
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      try {
        const response = await client.post("/payment/upload", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Get the uploaded image URL
        const uploadedImageUrl = response.data.image;

        // Update the specific payment name entry with the uploaded image URL
        setPaymentDataUpdate((prevState) => {
          const updatedPaymentName = [...prevState.paymentName];
          updatedPaymentName[index] = {
            ...updatedPaymentName[index],
            image: uploadedImageUrl,
          };
          return { ...prevState, paymentName: updatedPaymentName };
        });

        console.log("Image uploaded successfully:", uploadedImageUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  // LOADER
  if (isLoading) {
    return (
      <div className="w-full h-screen pt-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  // CARA PEMBAYARAN
  // Function to handle changes in paymentName fields
  const handlePaymentNameChange = (index, field, value) => {
    setPaymentDataUpdate((prev) => {
      const updatedPaymentName = [...(prev.paymentName || [])]; // Ensure paymentName is an array
      updatedPaymentName[index] = {
        ...(updatedPaymentName[index] || {}), // Ensure the object at the given index exists
        [field]: value, // Update the specific field
      };
      return {
        ...prev,
        paymentName: updatedPaymentName, // Replace the old array with the updated one
      };
    });
  };

  // ADD PAYMENTS
  const addPaymentNameDetail = () => {
    setPaymentDataUpdate((prevState) => ({
      ...prevState,
      paymentName: [
        ...prevState.paymentName,
        { payment_name: "", payment_desc: "", image: "" }, // Add a new empty entry
      ],
    }));
  };

  // REMOVE PAYMENTS
  const removePaymentNameDetail = (index) => {
    setPaymentDataUpdate((prevState) => {
      const updatedPaymentName = prevState.paymentName.filter(
        (_, i) => i !== index
      );
      return { ...prevState, paymentName: updatedPaymentName };
    });
  };

  const filteredPaymentList = payments.filter((payment) =>
    payment.payment_method.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startIndex = currentPage * itemsPerPage;
  const selectedData = filteredPaymentList.slice(startIndex, startIndex + itemsPerPage);
  return (
    <div className="w-full h-screen pt-16">
      <div className="justify-between w-full bg-white shadow-lg p-4">
        <div className="flex flex-row justify-between">
          <div className="flex flex-col">
            <p className="text-2xl font-bold">Daftar Pembayaran</p>
            <p>Detail Daftar Pembayaran</p>
          </div>
          <div className="relative mt-2 flex flex-row space-x-4">
            <div className="relative">
            <input
              type="text"
              placeholder="Cari metode pembayaran..."
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
          <div>
            <button
              className="button bg-[#FDDC05] text-white p-2 rounded-lg font-bold"
              onClick={openModalAdd}
            >
              + Tambah Pembayaran
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          <div className="overflow-x-auto">
            {filteredPaymentList.length === 0 ? (
              <h1>Data Pembayaran tidak ditemukan!</h1>
            ) : (
              <>
              <table className="table w-full border border-gray-300">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Pembayaran</th>
                    <th>Keterangan</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedData.map((payment, index) => (
                    <tr key={payment._id}>
                      <td>{index + 1}</td>
                      <td>
                        <b>{payment.payment_method}</b>
                      </td>
                      <td>{payment.keterangan}</td>
                      <td>
                        <button
                          className=" p-3 rounded-lg text-2xl "
                          onClick={() => deletePaymentById(payment._id)}
                        >
                          <MdDelete />
                        </button>
                        <button
                          className=" p-3 rounded-lg text-2xl "
                          onClick={() => handleUpdatePayment(payment)}
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
                pageCount={Math.ceil(payments.length / itemsPerPage)}
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
        <Modal onClose={closeModalAdd} title={"Tambah Pembayaran"}>
          <form onSubmit={handleSubmitAdd}>
            <p className="font-semibold mt-4">Metode Pembayaran</p>
            <input
              type="text"
              name="payment_method"
              value={paymentDataAdd.payment_method}
              onChange={handleChangeAdd}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4">Keterangan</p>
            <textarea
              name="keterangan"
              value={paymentDataAdd.keterangan}
              onChange={handleChangeAdd}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
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
        <Modal onClose={closeModalUpdate} title={"Edit Pembayaran"}>
          <form onSubmit={handleSubmitUpdate}>
            {/* Payment Method Field */}
            <p className="font-semibold mt-4">Metode Pembayaran</p>
            <input
              type="text"
              name="payment_method"
              value={paymentDataUpdate.payment_method || ""}
              onChange={handleChangeUpdate}
              className="border rounded-md p-2 w-full bg-white"
              required
            />

            {/* Keterangan Field */}
            <p className="font-semibold mt-4">Keterangan Pembayaran</p>
            <textarea
              name="keterangan"
              value={paymentDataUpdate.keterangan || ""}
              onChange={handleChangeUpdate}
              className="border rounded-md p-2 w-full bg-white"
              required
            />

            {/* Payment Name Details Section */}
            <div id="paymentNameContainer">
              <p className="font-bold mt-4 text-lg">Cara Pembayaran</p>
              {(paymentDataUpdate.paymentName || []).map((detail, index) => (
                <div
                  key={index}
                  className="payment-name mb-3 p-3 shadow-lg border "
                >
                  {/* Payment Name Field */}
                  <p className="font-semibold">Gambar Pembayaran</p>
                  <div className="upload-container">
                    <label className="upload-label">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChangeUpdate(e, index)} // Pass the index
                        style={{ display: "none" }}
                      />
                      <div className="upload-content">
                        {detail.image ? (
                          <img
                            src={detail.image}
                            alt="Uploaded"
                            className="uploaded-image"
                            width={80}
                            height={80}
                          />
                        ) : (
                          <div className="bg-[#F8FAFC] w-28 rounded-lg p-3 flex flex-col items-center justify-center">
                            <div className="icon-container flex flex-col items-center">
                              <LiaCloudUploadAltSolid className="text-5xl text-[#FDDC05]" />
                              <p className="text-sm text-[#FDDC05]">
                                New Image
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                  <div className="form-group">
                    <label>Nama Pembayaran</label>
                    <input
                      type="text"
                      name={`paymentName[${index}][payment_name]`}
                      value={detail.payment_name || ""}
                      onChange={(e) =>
                        handlePaymentNameChange(
                          index,
                          "payment_name",
                          e.target.value
                        )
                      }
                      className="border rounded-md p-2 w-full bg-white"
                      required
                    />
                  </div>

                  {/* Payment Description Field */}
                  <div className="form-group">
                    <label>Deskripsi</label>
                    <textarea
                      name={`paymentName[${index}][payment_desc]`}
                      value={detail.payment_desc || ""}
                      onChange={(e) =>
                        handlePaymentNameChange(
                          index,
                          "payment_desc",
                          e.target.value
                        )
                      }
                      className="border rounded-md p-2 w-full bg-white"
                      required
                    />
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    className="bg-red-500 text-white p-2 rounded-lg mt-2"
                    onClick={() => removePaymentNameDetail(index)}
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>

            {/* Add Detail Button */}
            <button
              type="button"
              className="bg-green-500 text-white p-2 rounded-lg mt-3"
              onClick={addPaymentNameDetail}
            >
              Tambah Nama Pembayaran
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

export default Payment;
