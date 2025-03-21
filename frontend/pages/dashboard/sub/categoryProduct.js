import React, { useEffect, useState } from "react";

// Icons
import { MdDelete } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";

// Components
import { SubmitButton, CloseButton } from "@/components/form/button";
import Table from "@/components/form/table";
import { Modal } from "@/components/Modal";
import Header from "@/components/section/header";
import Loading from "@/components/loading";

// Libraries
import {
  fetchCategoryList,
  fetchCategoryAdd,
  updateCategory,
  deleteCategory,
} from "@/libs/fetching/category";

// Packages
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const CategoryProduct = ({ userData }) => {
  const id_store = userData?.id_store;
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [categoryProductToUpdate, setCategoryProductToUpdate] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [categoryProductDataAdd, setCategoryProductDataAdd] = useState({
    name_category: "",
    id_store: "",
  });

  const [categoryProductDataUpdate, setCategoryProductDataUpdate] = useState({
    id: "",
    name_category: "",
    id_store: "",
  });

  // Header Table
  const ExportHeaderTable = [
    { label: "No", key: "no" },
    { label: "Nama Kategori", key: "name_category" },
  ];

  const HeaderTable = [{ label: "Nama Kategori", key: "name_category" }];

  const actions = [
    {
      icon: <MdDelete size={20} />,
      onClick: (row) => deleteCategoryProductById(row._id),
      className: "bg-red-500 hover:bg-red-600",
    },
    {
      icon: <FaRegEdit size={20} />,
      onClick: (row) => handleUpdateCategoryProduct(row, "update"),
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
      const data_category = await fetchCategoryList(id_store);
      setCategoryProduct(data_category);
      setIsLoading(false);
    };
    fetching_requirement();
  }, [id_store]);

  const handleUpdateCategoryProduct = (categoryProduct, params) => {
    setCategoryProductToUpdate(categoryProduct);
    modalOpen(params, true);
  };

  const deleteCategoryProductById = async (id) => {
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
          const response = await deleteCategory(id); // Gunakan fungsi deleteCategory
          if (response.status === 200) {
            toast.success("Kategori berhasil dihapus!");
            setCategoryProduct((prev) => prev.filter((p) => p._id !== id));
          }
        } catch (error) {
          toast.error("Gagal menghapus kategori: " + error.message);
        }
      }
    });
  };

  const handleChangeAdd = (e) => {
    const { name, value } = e.target;
    setCategoryProductDataAdd((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      if (!categoryProductDataAdd.name_category) {
        toast.error("Please fill all required fields.");
        return;
      }
      const response = await fetchCategoryAdd(
        categoryProductDataAdd.name_category
      );
      if (response.status === 201) {
        modalOpen("add", false);
        toast.success("Kategori berhasil ditambahkan!");
        setCategoryProductDataAdd({ name_category: "", id_store: "" });
        setCategoryProduct((prev) => [...prev, response.data]);
      } else {
        toast.error("Gagal: " + response.error);
      }
    } catch (error) {
      toast.error("Error adding category: " + error.message);
    }
  };

  useEffect(() => {
    if (categoryProductToUpdate) {
      setCategoryProductDataUpdate({
        id: categoryProductToUpdate._id || "",
        name_category: categoryProductToUpdate.name_category || "",
        id_store: categoryProductToUpdate.id_store || "",
      });
    }
  }, [categoryProductToUpdate]);

  const handleChangeUpdate = (e) => {
    const { name, value } = e.target;
    setCategoryProductDataUpdate((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const reqBody = {
        name_category: categoryProductDataUpdate.name_category,
        id_store: categoryProductDataUpdate.id_store,
      };
      const response = await updateCategory(
        categoryProductDataUpdate.id,
        reqBody
      );
      if (response.status === 200) {
        modalOpen("update", false);
        toast.success("Kategori berhasil diupdate!");
        setCategoryProduct((prev) =>
          prev.map((category) =>
            category._id === categoryProductDataUpdate.id
              ? response.data
              : category
          )
        );
      } else {
        toast.error("Gagal: " + response.error);
      }
    } catch (error) {
      toast.error("Error updating category: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategoryList = categoryProduct.filter((category) =>
    category.name_category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dataForExport = filteredCategoryList.map((item, index) => ({
    no: index + 1,
    name_category: item.name_category,
  }));

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="w-full h-screen pt-16 relative">
      <Header
        title="Daftar Kategori Produk"
        subtitle="Detail Daftar Kategori Produk"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        modalOpen={modalOpen}
        isSearch={true}
        isAdd={true}
      />

      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          {filteredCategoryList.length === 0 ? (
            <h1>Data Kategori Produk tidak ditemukan!</h1>
          ) : (
            <Table
              fileName="Data Kategori Produk"
              ExportHeaderTable={ExportHeaderTable}
              columns={HeaderTable}
              data={filteredCategoryList}
              actions={actions}
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => modalOpen("add", false)}
        title="Tambah Kategori Produk"
        width="large"
      >
        <form onSubmit={handleSubmitAdd}>
          <p className="font-semibold mt-4">Nama Kategori Produk</p>
          <input
            type="text"
            name="name_category"
            value={categoryProductDataAdd.name_category}
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
        title="Edit Kategori Produk"
        width="large"
      >
        <form onSubmit={handleSubmitUpdate}>
          <p className="font-semibold mt-4">Nama Kategori Produk</p>
          <input
            type="text"
            name="name_category"
            value={categoryProductDataUpdate.name_category}
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

export default CategoryProduct;
