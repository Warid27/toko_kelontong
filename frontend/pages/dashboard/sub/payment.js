import React, { useEffect, useState } from "react";
import Image from "next/image";

// Icons
import { LiaCloudUploadAltSolid } from "react-icons/lia";
import { MdDelete } from "react-icons/md";
import { FaInfoCircle } from "react-icons/fa";
import { IoSearchOutline } from "react-icons/io5";

// Components
import {
  SubmitButton,
  CloseButton,
  AddButton,
  DangerButton,
} from "@/components/form/button";
import Table from "@/components/form/table"; // Tambahkan komponen Table
import ImageUpload from "@/components/form/uploadImage"; // Tambahkan komponen ImageUpload
import { Modal } from "@/components/Modal";
import Header from "@/components/section/header";
import Loading from "@/components/loading";

// Libraries
import { fetchPaymentList, fetchPaymentAdd } from "@/libs/fetching/payment";
import { uploadImageCompress } from "@/libs/fetching/upload-service";
import { updatePayment, deletePayment } from "@/libs/fetching/payment";
import useUserStore from "@/stores/user-store";

// Packages
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const Payment = () => {
  const { userData } = useUserStore();
  const id_user = userData?.id_user;

  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [paymentToUpdate, setPaymentToUpdate] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [paymentDataAdd, setPaymentDataAdd] = useState({
    payment_method: "",
    keterangan: "",
  });

  const [paymentDataUpdate, setPaymentDataUpdate] = useState({
    id: "",
    payment_method: "",
    keterangan: "",
    paymentName: [],
  });

  // Header Table
  const ExportHeaderTable = [
    { label: "No", key: "no" },
    { label: "Metode Pembayaran", key: "payment_method" },
    { label: "Keterangan", key: "keterangan" },
  ];

  const HeaderTable = [
    { label: "Metode Pembayaran", key: "payment_method" },
    { label: "Keterangan", key: "keterangan" },
  ];

  const actions = [
    {
      icon: <MdDelete size={20} />,
      onClick: (row) => deletePaymentById(row._id),
      className: "bg-red-500 hover:bg-red-600",
    },
    {
      icon: <FaInfoCircle size={20} />,
      onClick: (row) => handleUpdatePayment(row),
      className: "bg-blue-500 hover:bg-blue-600",
    },
  ];

  // --- Functions
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
      const data_payment = await fetchPaymentList();
      setPayments(data_payment);
      setIsLoading(false);
    };
    fetching_requirement();
  }, []);

  const handleUpdatePayment = (payment) => {
    setPaymentToUpdate(payment);
    modalOpen("update", true);
  };

  const deletePaymentById = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await deletePayment(id);
          if (response.status === 200) {
            toast.success("Pembayaran berhasil dihapus!");
            setPayments((prevPayments) =>
              prevPayments.filter((p) => p._id !== id)
            );
          }
        } catch (error) {
          toast.error("Gagal menghapus Pembayaran:", error.message);
        }
      }
    });
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
      if (!paymentDataAdd.payment_method || !paymentDataAdd.keterangan) {
        toast.error("Please fill all required fields.");
        return;
      }
      const response = await fetchPaymentAdd(
        paymentDataAdd.payment_method,
        paymentDataAdd.keterangan
      );
      if (response.status === 201) {
        modalOpen("add", false);
        toast.success("Pembayaran berhasil ditambahkan!");
        setPaymentDataAdd({ payment_method: "", keterangan: "" });
        setPayments((prevPayments) => [...prevPayments, response.data.data]);
      } else {
        toast.error("Gagal:", response.error);
      }
    } catch (error) {
      toast.error("Error adding payment:", error);
    }
  };

  useEffect(() => {
    if (paymentToUpdate) {
      setPaymentDataUpdate({
        id: paymentToUpdate._id || "",
        payment_method: paymentToUpdate.payment_method || "",
        keterangan: paymentToUpdate.keterangan || "",
        paymentName: paymentToUpdate.paymentName || [],
      });
    }
  }, [paymentToUpdate]);

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
      setLoading(true);
      const reqBody = {
        payment_method: paymentDataUpdate.payment_method,
        keterangan: paymentDataUpdate.keterangan,
        paymentName: paymentDataUpdate.paymentName,
      };
      const response = await updatePayment(paymentDataUpdate.id, reqBody);
      if (response.status === 200) {
        modalOpen("update", false);
        toast.success("Pembayaran berhasil diupdate!");
        setPayments((prevPayments) =>
          prevPayments.map((payment) =>
            payment._id === paymentDataUpdate.id ? response.data.data : payment
          )
        );
      } else {
        toast.error("Gagal:", response.error);
      }
    } catch (error) {
      toast.error("Error updating payment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChangeUpdate = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const response = await uploadImageCompress(
        file,
        "payment",
        "payment/images",
        id_user
      );
      const uploadedImageUrl = response.data.metadata.fileUrl;
      if (response.status === 201) {
        setPaymentDataUpdate((prevState) => {
          const updatedPaymentName = [...prevState.paymentName];
          updatedPaymentName[index] = {
            ...updatedPaymentName[index],
            image: uploadedImageUrl,
          };
          return { ...prevState, paymentName: updatedPaymentName };
        });
      } else {
        toast.error(`Upload Failed: ${response.error}`);
      }
    } catch (error) {
      toast.error("Compression or upload failed:", error);
    }
  };

  const handlePaymentNameChange = (index, field, value) => {
    setPaymentDataUpdate((prev) => {
      const updatedPaymentName = [...(prev.paymentName || [])];
      updatedPaymentName[index] = {
        ...(updatedPaymentName[index] || {}),
        [field]: value,
      };
      return { ...prev, paymentName: updatedPaymentName };
    });
  };

  const addPaymentNameDetail = () => {
    setPaymentDataUpdate((prevState) => ({
      ...prevState,
      paymentName: [
        ...prevState.paymentName,
        { payment_name: "", payment_desc: "", image: "" },
      ],
    }));
  };

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

  const dataForExport = filteredPaymentList.map((item, index) => ({
    no: index + 1,
    payment_method: item.payment_method,
    keterangan: item.keterangan,
  }));

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="w-full h-screen pt-16 relative">
      <Header
        title="Daftar Pembayaran"
        subtitle="Detail Daftar Pembayaran"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        modalOpen={modalOpen}
        isSearch={true}
        isAdd={true}
      />

      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          {filteredPaymentList.length === 0 ? (
            <h1>Data Pembayaran tidak ditemukan!</h1>
          ) : (
            <Table
              fileName="Data Pembayaran"
              ExportHeaderTable={ExportHeaderTable}
              columns={HeaderTable}
              data={filteredPaymentList}
              actions={actions}
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => modalOpen("add", false)}
        title="Tambah Pembayaran"
        width="large"
      >
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
            <CloseButton onClick={() => modalOpen("add", false)} />
            <SubmitButton />
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => modalOpen("update", false)}
        title="Edit Pembayaran"
        width="large"
      >
        <form onSubmit={handleSubmitUpdate}>
          <p className="font-semibold mt-4">Metode Pembayaran</p>
          <input
            type="text"
            name="payment_method"
            value={paymentDataUpdate.payment_method || ""}
            onChange={handleChangeUpdate}
            className="border rounded-md p-2 w-full bg-white"
            required
          />
          <p className="font-semibold mt-4">Keterangan Pembayaran</p>
          <textarea
            name="keterangan"
            value={paymentDataUpdate.keterangan || ""}
            onChange={handleChangeUpdate}
            className="border rounded-md p-2 w-full bg-white"
            required
          />
          <p className="font-bold mt-4 text-lg">Cara Pembayaran</p>
          {(paymentDataUpdate.paymentName || []).map((detail, index) => (
            <div key={index} className="mb-3 p-3 shadow-lg border">
              <p className="font-semibold">Gambar Pembayaran</p>
              <ImageUpload
                image={detail.image}
                onImageChange={(e) => handleImageChangeUpdate(e, index)}
                params="payment"
                name={`paymentName[${index}][image]`}
                value={detail.image}
              />
              <p className="font-semibold mt-2">Nama Pembayaran</p>
              <input
                type="text"
                name={`paymentName[${index}][payment_name]`}
                value={detail.payment_name || ""}
                onChange={(e) =>
                  handlePaymentNameChange(index, "payment_name", e.target.value)
                }
                className="border rounded-md p-2 w-full bg-white"
                required
              />
              <p className="font-semibold mt-2">Deskripsi</p>
              <textarea
                name={`paymentName[${index}][payment_desc]`}
                value={detail.payment_desc || ""}
                onChange={(e) =>
                  handlePaymentNameChange(index, "payment_desc", e.target.value)
                }
                className="border rounded-md p-2 w-full bg-white"
                required
              />
              <DangerButton
                onClick={() => removePaymentNameDetail(index)}
                content="Hapus"
              />
            </div>
          ))}
          <AddButton
            onClick={addPaymentNameDetail}
            content="Tambah Nama Pembayaran"
          />
          <div className="flex justify-end mt-5">
            <CloseButton onClick={() => modalOpen("update", false)} />
            <SubmitButton />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Payment;
