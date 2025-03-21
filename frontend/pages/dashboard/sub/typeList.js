import React, { useEffect, useState } from "react";
import client from "@/libs/axios";
import { Modal } from "@/components/Modal";
import { toast } from "react-toastify";
import Header from "@/components/section/header";
import { MdDelete } from "react-icons/md";
import { FaInfoCircle } from "react-icons/fa";
import {
  fetchTypeList,
  fetchTypeAdd,
  deleteType,
  updateType,
} from "@/libs/fetching/type";
import { SubmitButton, CloseButton } from "@/components/form/button";
import Table from "@/components/form/table";
import Loading from "@/components/loading"; // Assuming this exists based on CompanyData
import Swal from "sweetalert2";

const TypeList = () => {
  const [type, setType] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [typeToUpdate, setTypeToUpdate] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [typeDataAdd, setTypeDataAdd] = useState({
    type: "",
  });

  const [typeDataUpdate, setTypeDataUpdate] = useState({
    id: "",
    type: "",
  });

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
    const fetchData = async () => {
      try {
        const data = await fetchTypeList();
        setType(data);
      } catch (error) {
        toast.error("Failed to fetch type list");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateType = (typeItem) => {
    setTypeToUpdate(typeItem);
    modalOpen("update", true);
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
        const response = await deleteType(id);

        if (response.status === 200) {
          toast.success("Type deleted successfully");
          setType((prevTypes) => prevTypes.filter((t) => t._id !== id));
        }
      } catch (error) {
        toast.error("Failed to delete type");
        console.error("Error deleting type:", error.message);
      }
    }
  };

  const handleChangeAdd = (e) => {
    const { name, value } = e.target;
    setTypeDataAdd((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    if (!typeDataAdd.type) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const response = await fetchTypeAdd(typeDataAdd.type);
      if (response.status === 201) {
        toast.success("Type added successfully");
        setType((prevTypes) => [...prevTypes, response.data]);
        setTypeDataAdd({ type: "" });
        modalOpen("add", false);
      }
    } catch (error) {
      toast.error("Failed to add type");
      console.error("Error adding type:", error);
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

  const handleChangeUpdate = (e) => {
    const { name, value } = e.target;
    setTypeDataUpdate((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    if (!typeDataUpdate.type) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      reqBody = { type: typeDataUpdate.type };
      const response = await updateType(reqBody);

      if (response.status === 200) {
        toast.success("Type updated successfully");
        setType((prevTypes) =>
          prevTypes.map((t) =>
            t._id === typeDataUpdate.id ? response.data : t
          )
        );
        modalOpen("update", false);
      }
    } catch (error) {
      toast.error("Failed to update type");
      console.error("Error updating type:", error);
    }
  };

  const ExportHeaderTable = [
    { label: "No", key: "no" },
    { label: "ID", key: "_id" },
    { label: "Type Name", key: "type" },
  ];

  const HeaderTable = [
    { label: "ID", key: "_id" },
    { label: "Type Name", key: "type" },
  ];

  const actions = [
    {
      icon: <MdDelete size={20} />,
      onClick: (row) => deleteTypeById(row._id), // Use _id consistent with data
      className: "bg-red-500 hover:bg-red-600",
    },
    {
      icon: <FaInfoCircle size={20} />,
      onClick: (row) => handleUpdateType(row), // Fixed typo from handleTypeCompany
      className: "bg-blue-500 hover:bg-blue-600",
    },
  ];

  const filteredTypeList = type.filter((t) =>
    t.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dataForExport = filteredTypeList.map((item, index) => ({
    no: index + 1,
    id: item._id,
    type: item.type, // Fixed key name
  }));

  if (isLoading) {
    return <Loading />; // Use proper Loading component
  }

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
          {filteredTypeList.length === 0 ? (
            <h1>Data Tipe tidak ditemukan!</h1>
          ) : (
            <Table
              fileName="Data Tipe"
              ExportHeaderTable={ExportHeaderTable}
              columns={HeaderTable}
              data={filteredTypeList}
              actions={actions}
            />
          )}
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
        title="Edit Type" // Fixed title to reflect "Type" instead of "Perusahaan"
      >
        <form onSubmit={handleSubmitUpdate}>
          <p className="font-semibold mt-4">Nama Tipe</p>
          <input
            type="text"
            name="type"
            value={typeDataUpdate.type}
            onChange={handleChangeUpdate}
            className="border rounded-md p-2 w-full bg-white"
            required
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

export default TypeList;
