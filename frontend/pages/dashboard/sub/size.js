import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Icons
import { FaInfoCircle } from "react-icons/fa";

// Components
import { SubmitButton, CloseButton } from "@/components/form/button";
import Table from "@/components/form/table";
import { Modal } from "@/components/Modal";
import Header from "@/components/section/header";
import Loading from "@/components/loading";

// Libraries
import { fetchProductsList } from "@/libs/fetching/product";
import { fetchSizeGet, updateSize } from "@/libs/fetching/size";
import useUserStore from "@/stores/user-store";

// Packages
import { toast } from "react-toastify";

const Size = () => {
  const [sizeData, setSizeData] = useState({});
  const [productList, setProductList] = useState([]);
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [extraDataUpdate, setExtraDataUpdate] = useState({
    id: "",
    name: "",
    deskripsi: "",
    id_product: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  // Extract id_store and id_company from userData
  const { userData } = useUserStore();
  const id_store = userData?.id_store;
  const id_company = userData?.id_company;

  // Header Table
  const ExportHeaderTable = [
    { label: "No", key: "no" },
    { label: "Nama Produk", key: "name_product" },
    { label: "Nama Ukuran", key: "size_name" },
  ];

  const HeaderTable = [
    { label: "Nama Produk", key: "name_product" },
    {
      label: "Nama Ukuran",
      key: "size_name",
      render: (_, row) => sizeData[row._id]?.name || "Loading",
    },
  ];

  const actions = [
    {
      icon: <FaInfoCircle size={20} />,
      onClick: (row) => handleUpdateSize(row),
      className: "bg-gray-500 hover:bg-gray-600",
    },
  ];

  // Functions
  const modalOpen = (param, bool) => {
    setIsSizeModalOpen(bool);
  };

  const getSize = async (productId, sizeId) => {
    try {
      const data_size = await fetchSizeGet(sizeId);
      setSizeData((prev) => ({
        ...prev,
        [productId]: data_size || { name: "Belum ada ukuran untuk produk ini" },
      }));
    } catch (error) {
      setSizeData((prev) => ({
        ...prev,
        [productId]: { name: "Belum ada ukuran untuk produk ini" },
      }));
    }
  };

  useEffect(() => {
    const fetchRequirements = async () => {
      if (!id_store || !id_company) {
        console.error("Missing id_store or id_company, aborting fetch");
        setProductList([]);
        setIsLoading(false);
        return;
      }
      const products = await fetchProductsList(id_store, id_company);
      setProductList(products);
      setIsLoading(false);
    };
    fetchRequirements();
  }, [id_store, id_company]);

  useEffect(() => {
    productList.forEach((product) => {
      if (product.id_size) {
        getSize(product._id, product.id_size);
      } else {
        setSizeData((prev) => ({
          ...prev,
          [product._id]: {
            name: "Belum ada ukuran untuk produk ini",
            deskripsi: "Belum ada ukuran untuk produk ini",
            _id: null,
          },
        }));
      }
    });
  }, [productList]);

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
      updatedDetails[index] = { ...updatedDetails[index], [field]: value };
      return {
        ...prev,
        [extraDataUpdate._id]: {
          ...prev[extraDataUpdate._id],
          sizeDetails: updatedDetails,
        },
      };
    });
  };

  const addSizeDetail = () => {
    setSizeData((prev) => ({
      ...prev,
      [extraDataUpdate._id]: {
        ...prev[extraDataUpdate._id],
        sizeDetails: [
          ...(prev[extraDataUpdate._id]?.sizeDetails || []),
          { name: "", deskripsi: "" },
        ],
      },
    }));
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
    modalOpen("open", true);
  };

  const handleSubmit = async (e, isUpdate) => {
    e.preventDefault();
    setLoading(true);
    try {
      const currentSize = sizeData[extraDataUpdate._id];
      if (!currentSize?.name || !currentSize?.deskripsi) {
        toast.error("Semua field harus diisi!");
        return;
      }

      const reqBody = {
        name: currentSize.name,
        deskripsi: currentSize.deskripsi,
        id_product: extraDataUpdate._id,
        sizeDetails: currentSize.sizeDetails || [],
      };

      const response = await updateSize(reqBody);
      if (response.status === 200) {
        modalOpen("open", false);
        toast.success(
          `Ukuran berhasil ${isUpdate ? "diupdate" : "ditambahkan"}!`
        );
        setSizeData((prev) => ({
          ...prev,
          [extraDataUpdate._id]: response.data.data,
        }));
        if (!isUpdate) {
          setProductList((prev) =>
            prev.map((p) =>
              p._id === extraDataUpdate._id
                ? { ...p, id_size: response.data._id }
                : p
            )
          );
        }
      } else {
        toast.error("Gagal: " + response.error);
      }
    } catch (error) {
      toast.error(
        `Error ${isUpdate ? "updating" : "adding"} size: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Data Preparation
  const filteredProductList = productList.filter((product) =>
    product.name_product.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dataForExport = filteredProductList.map((item, index) => ({
    no: index + 1,
    name_product: item.name_product,
    size_name: sizeData[item._id]?.name || "Belum ada ukuran",
  }));

  // Render
  if (isLoading) return <Loading />;

  return (
    <div className="w-full h-screen pt-16 relative">
      <Header
        title="Daftar Ukuran"
        subtitle="Detail Daftar Ukuran"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        modalOpen={modalOpen}
        isSearch={true}
        isAdd={false}
      />

      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          {filteredProductList.length === 0 ? (
            <h1 className="text-center text-gray-500">
              Data Ukuran tidak ditemukan!
            </h1>
          ) : (
            <Table
              fileName="Data Ukuran"
              ExportHeaderTable={ExportHeaderTable}
              columns={HeaderTable}
              data={filteredProductList}
              actions={actions}
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isSizeModalOpen}
        onClose={() => modalOpen("open", false)}
        title="Ukuran Produk"
        width="large"
      >
        <form onSubmit={(e) => handleSubmit(e, !!extraDataUpdate.id_size)}>
          <div className="space-y-4">
            <div>
              <p className="font-semibold">Nama Produk</p>
              <input
                type="text"
                name="name_product"
                value={extraDataUpdate.name_product || ""}
                className="border rounded-md p-2 w-full bg-gray-100"
                disabled
              />
            </div>

            <div>
              <p className="font-semibold">Nama Ukuran</p>
              <input
                type="text"
                name="name"
                value={sizeData[extraDataUpdate._id]?.name || ""}
                onChange={handleChangeSize}
                className="border rounded-md p-2 w-full bg-white"
                required
              />
            </div>

            <div>
              <p className="font-semibold">Deskripsi Ukuran</p>
              <textarea
                name="deskripsi"
                value={sizeData[extraDataUpdate._id]?.deskripsi || ""}
                onChange={handleChangeSize}
                className="border rounded-md p-2 w-full bg-white"
                required
              />
            </div>

            <div>
              <p className="font-bold text-lg">Detail Ukuran</p>
              {sizeData[extraDataUpdate._id]?.sizeDetails?.map(
                (detail, index) => (
                  <div key={index} className="mb-6 space-y-2">
                    <div>
                      <label className="block">Nama Detail</label>
                      <input
                        type="text"
                        value={detail.name || ""}
                        onChange={(e) =>
                          handleSizeDetailsChange(index, "name", e.target.value)
                        }
                        className="border rounded-md p-2 w-full bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block">Deskripsi</label>
                      <textarea
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
                      className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                      onClick={() => removeSizeDetail(index)}
                    >
                      Hapus
                    </button>
                  </div>
                )
              )}
            </div>

            <button
              type="button"
              className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
              onClick={addSizeDetail}
            >
              Tambah Detail Ukuran
            </button>
          </div>

          <div className="flex justify-end mt-5 space-x-2">
            <CloseButton onClick={() => modalOpen("open", false)} />
            <SubmitButton
              label={extraDataUpdate.id_size ? "Update" : "Tambah"}
              disabled={loading}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Size;
