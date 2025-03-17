import React, { useEffect, useState } from "react";

// Icons

import { FaRegEdit, FaInfoCircle } from "react-icons/fa";

// Components
import { SubmitButton, CloseButton } from "@/components/form/button";
import Table from "@/components/form/table";
import { Modal } from "@/components/Modal";
import Header from "@/components/section/header";
import Loading from "@/components/loading";

// Libraries
import { fetchProductsList } from "@/libs/fetching/product";
import { fetchExtrasGet, addExtras, updateExtras } from "@/libs/fetching/extras";

// Packages
import { toast } from "react-toastify";

const Extras = () => {
  const [extrasData, setExtrasData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [productList, setProductList] = useState([]);
  const [isExtrasModalOpen, setIsExtrasModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [extraDataUpdate, setExtraDataUpdate] = useState({
    id: "",
    name: "",
    deskripsi: "",
    id_product: "",
  });

  const id_store = localStorage.getItem("id_store") === "undefined" ? null : localStorage.getItem("id_store");
  const id_company = localStorage.getItem("id_company") === "undefined" ? null : localStorage.getItem("id_company");
  const token = localStorage.getItem("token");

  // Header Table
  const ExportHeaderTable = [
    { label: "No", key: "no" },
    { label: "Nama Produk", key: "name_product" },
    { label: "Nama Varian", key: "extras_name" },
  ];

  const HeaderTable = [
    { label: "Nama Produk", key: "name_product" },
    {
      label: "Nama Varian",
      key: "extras_name",
      render: (_, row) => extrasData[row._id]?.name || "Loading...",
    },
  ];

  const actions = [
    {
      icon: <FaInfoCircle size={20} />,
      onClick: (row) => handleUpdateExtras(row),
      className: "bg-gray-500 hover:bg-gray-600",
    },
  ];

  // --- Functions
  const modalOpen = (param, bool) => {
    const setters = { open: setIsExtrasModalOpen };
    if (setters[param]) setters[param](bool);
  };

  const getExtras = async (productId, extrasId) => {
    try {
      const data_extras = await fetchExtrasGet(extrasId);
      setExtrasData((prevData) => ({
        ...prevData,
        [productId]: data_extras || { name: "Belum ada varian untuk produk ini" },
      }));
    } catch (error) {
      setExtrasData((prevData) => ({
        ...prevData,
        [productId]: { name: "Belum ada varian untuk produk ini" },
      }));
    }
  };

  useEffect(() => {
    const fetching_requirement = async () => {
      const data_product = await fetchProductsList(id_store, id_company);
      setProductList(data_product);
      setIsLoading(false);
    };
    fetching_requirement();
  }, []);

  useEffect(() => {
    if (productList.length > 0) {
      productList.forEach((product) => {
        if (product.id_extras && product.id_extras !== "") {
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
      const updatedDetails = [...(prev[extraDataUpdate._id]?.extrasDetails || [])];
      updatedDetails[index] = { ...updatedDetails[index], [field]: value };
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
      setLoading(true);
      const currentExtras = extrasData[extraDataUpdate._id];
      if (!currentExtras?.name || !currentExtras?.deskripsi) {
        toast.error("Semua field harus diisi!");
        return;
      }
      const reqBody = {
        name: currentExtras.name,
        deskripsi: currentExtras.deskripsi,
        id_product: extraDataUpdate._id,
        extrasDetails: currentExtras.extrasDetails || [],
      };
      const response = await updateExtras(reqBody);
      if (response.status === 200) {
        modalOpen("open", false);
        toast.success("Varian berhasil diupdate!");
        setExtrasData((prev) => ({
          ...prev,
          [extraDataUpdate._id]: response.data.data,
        }));
      } else {
        toast.error("Gagal: " + response.error);
      }
    } catch (error) {
      toast.error("Error updating extras: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddData = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const currentExtras = extrasData[extraDataUpdate._id];
      if (!currentExtras?.name || !currentExtras?.deskripsi) {
        toast.error("Semua field harus diisi!");
        return;
      }
      const reqBody = {
        name: currentExtras.name,
        deskripsi: currentExtras.deskripsi,
        id_product: extraDataUpdate._id,
        extrasDetails: currentExtras.extrasDetails || [],
      };
      console.log("reqqq", reqBody)
      const response = await updateExtras(reqBody);
      if (response.status === 200) {
        modalOpen("open", false);
        toast.success("Varian berhasil ditambahkan!");
        setExtrasData((prev) => ({
          ...prev,
          [extraDataUpdate._id]: response.data.data,
        }));
        setProductList((prev) =>
          prev.map((p) => (p._id === extraDataUpdate._id ? { ...p, id_extras: response.data._id } : p))
        );
      } else {
        toast.error("Gagal: " + response.error);
      }
    } catch (error) {
      toast.error("Error adding extras: " + error.message);
    } finally {
      setLoading(false);
    }
  };

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
      const currentDetails = [...(prev[extraDataUpdate._id]?.extrasDetails || [])];
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

  const filteredProductList = productList.filter((product) =>
    product.name_product.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dataForExport = filteredProductList.map((item, index) => ({
    no: index + 1,
    name_product: item.name_product,
    extras_name: extrasData[item._id]?.name || "Belum ada varian",
  }));

  if (isLoading) return <Loading />;

  return (
    <div className="w-full h-screen pt-16 relative">
      <Header
        title="Daftar Varian"
        subtitle="Detail Daftar Varian"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        modalOpen={modalOpen}
        isSearch={true}
        isAdd={false}
      />

      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          {filteredProductList.length === 0 ? (
            <h1 className="text-center text-gray-500">Data Varian tidak ditemukan!</h1>
          ) : (
            <Table
              fileName="Data Varian"
              ExportHeaderTable={ExportHeaderTable}
              columns={HeaderTable}
              data={filteredProductList}
              actions={actions}
            />
          )}
        </div>
      </div>

      <Modal isOpen={isExtrasModalOpen} onClose={() => modalOpen("open", false)} title="Varian Produk" width="large">
        <form onSubmit={(e) => (extraDataUpdate.id_extras ? handleUpdateData(e) : handleAddData(e))}>
          <p className="font-semibold mt-4">Nama Produk</p>
          <input
            type="text"
            name="name_product"
            value={extraDataUpdate.name_product || ""}
            className="border rounded-md p-2 w-full bg-gray-100"
            disabled
          />
          <p className="font-semibold mt-4">Nama Varian</p>
          <input
            type="text"
            name="name"
            value={extrasData[extraDataUpdate._id]?.name || ""}
            onChange={handleChangeExtras}
            className="border rounded-md p-2 w-full bg-white"
            required
          />
          <p className="font-semibold mt-4">Deskripsi Varian</p>
          <textarea
            name="deskripsi"
            value={extrasData[extraDataUpdate._id]?.deskripsi || ""}
            onChange={handleChangeExtras}
            className="border rounded-md p-2 w-full bg-white"
            required
          />
          <div id="extrasDetailsContainer">
            <p className="font-bold mt-4 text-lg">Detail Varian</p>
            {extrasData[extraDataUpdate._id]?.extrasDetails?.map((detail, index) => (
              <div key={index} className="extras-detail mb-12">
                <div className="form-group">
                  <label>Nama Detail</label>
                  <input
                    type="text"
                    value={detail.name || ""}
                    onChange={(e) => handleExtrasDetailsChange(index, "name", e.target.value)}
                    className="border rounded-md p-2 w-full bg-white"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Deskripsi</label>
                  <textarea
                    value={detail.deskripsi || ""}
                    onChange={(e) => handleExtrasDetailsChange(index, "deskripsi", e.target.value)}
                    className="border rounded-md p-2 w-full bg-white"
                    required
                  />
                </div>
                <button
                  type="button"
                  className="bg-red-500 text-white p-2 rounded-lg mt-2 hover:bg-red-600"
                  onClick={() => removeExtrasDetail(index)}
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="bg-blue-500 text-white p-2 rounded-lg mt-3 hover:bg-blue-600"
            onClick={addExtrasDetail}
          >
            Tambah Detail Varian
          </button>
          <div className="flex justify-end mt-5">
            <CloseButton onClick={() => modalOpen("open", false)} />
            <SubmitButton label={extraDataUpdate.id_extras ? "Update" : "Tambah"} />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Extras;