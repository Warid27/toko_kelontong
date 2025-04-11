import React, { useEffect, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { toast } from "react-toastify";

// Components
import { SubmitButton, CloseButton } from "@/components/form/button";
import Table from "@/components/form/table";
import { Modal } from "@/components/Modal";
import Header from "@/components/section/header";
import Loading from "@/components/loading";

// API Functions
import { fetchProductsList } from "@/libs/fetching/product";
import { fetchExtrasGet, updateExtras } from "@/libs/fetching/extras";
import useUserStore from "@/stores/user-store";

const Extras = () => {
  // State Declarations
  const [extrasData, setExtrasData] = useState({});
  const [productList, setProductList] = useState([]);
  const [isExtrasModalOpen, setIsExtrasModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [extraDataUpdate, setExtraDataUpdate] = useState({
    id: "",
    name: "",
    deskripsi: "",
    id_product: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  // Constants
  const { userData } = useUserStore();
  const id_store = userData?.id_store;
  const id_company = userData?.id_company;

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
      render: (_, row) => extrasData[row._id]?.name || "Loading",
    },
  ];

  const actions = [
    {
      icon: <FaInfoCircle size={20} />,
      onClick: (row) => handleUpdateExtras(row),
      className: "bg-gray-500 hover:bg-gray-600",
    },
  ];

  // Data Fetching
  useEffect(() => {
    const fetchRequirements = async () => {
      const products = await fetchProductsList(id_store, id_company);
      setProductList(products);
      setIsLoading(false);
    };
    fetchRequirements();
  }, [id_store, id_company]);

  useEffect(() => {
    productList.forEach((product) => {
      if (product.id_extras) {
        getExtras(product._id, product.id_extras);
      } else {
        setExtrasData((prev) => ({
          ...prev,
          [product._id]: {
            name: "Belum ada varian untuk produk ini",
            deskripsi: "Belum ada varian untuk produk ini",
            _id: null,
          },
        }));
      }
    });
  }, [productList]);

  // API Calls
  const getExtras = async (productId, extrasId) => {
    try {
      const data = await fetchExtrasGet(extrasId);
      setExtrasData((prev) => ({
        ...prev,
        [productId]: data || { name: "Belum ada varian untuk produk ini" },
      }));
    } catch (error) {
      setExtrasData((prev) => ({
        ...prev,
        [productId]: { name: "Belum ada varian untuk produk ini" },
      }));
    }
  };

  // Handlers
  const modalOpen = (param, bool) => {
    setIsExtrasModalOpen(bool);
  };

  const handleUpdateExtras = (product) => {
    setExtraDataUpdate(product);
    modalOpen("open", true);
  };

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

  const addExtrasDetail = () => {
    setExtrasData((prev) => ({
      ...prev,
      [extraDataUpdate._id]: {
        ...prev[extraDataUpdate._id],
        extrasDetails: [
          ...(prev[extraDataUpdate._id]?.extrasDetails || []),
          { name: "", deskripsi: "" },
        ],
      },
    }));
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

  const handleSubmit = async (e, isUpdate) => {
    e.preventDefault();
    setLoading(true);
    try {
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
        toast.success(
          `Varian berhasil ${isUpdate ? "diupdate" : "ditambahkan"}!`
        );
        setExtrasData((prev) => ({
          ...prev,
          [extraDataUpdate._id]: response.data.data,
        }));
        if (!isUpdate) {
          setProductList((prev) =>
            prev.map((p) =>
              p._id === extraDataUpdate._id
                ? { ...p, id_extras: response.data._id }
                : p
            )
          );
        }
      } else {
        toast.error("Gagal: " + response.error);
      }
    } catch (error) {
      toast.error(
        `Error ${isUpdate ? "updating" : "adding"} extras: ${error.message}`
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
    extras_name: extrasData[item._id]?.name || "Belum ada varian",
  }));

  // Render
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
            <h1 className="text-center text-gray-500">
              Data Varian tidak ditemukan!
            </h1>
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

      <Modal
        isOpen={isExtrasModalOpen}
        onClose={() => modalOpen("open", false)}
        title="Varian Produk"
        width="large"
      >
        <form onSubmit={(e) => handleSubmit(e, !!extraDataUpdate.id_extras)}>
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
              <p className="font-semibold">Nama Varian</p>
              <input
                type="text"
                name="name"
                value={extrasData[extraDataUpdate._id]?.name || ""}
                onChange={handleChangeExtras}
                className="border rounded-md p-2 w-full bg-white"
                required
              />
            </div>

            <div>
              <p className="font-semibold">Deskripsi Varian</p>
              <textarea
                name="deskripsi"
                value={extrasData[extraDataUpdate._id]?.deskripsi || ""}
                onChange={handleChangeExtras}
                className="border rounded-md p-2 w-full bg-white"
                required
              />
            </div>

            <div>
              <p className="font-bold text-lg">Detail Varian</p>
              {extrasData[extraDataUpdate._id]?.extrasDetails?.map(
                (detail, index) => (
                  <div key={index} className="mb-6 space-y-2">
                    <div>
                      <label className="block">Nama Detail</label>
                      <input
                        type="text"
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
                    <div>
                      <label className="block">Deskripsi</label>
                      <textarea
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
                      className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                      onClick={() => removeExtrasDetail(index)}
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
              onClick={addExtrasDetail}
            >
              Tambah Detail Varian
            </button>
          </div>

          <div className="flex justify-end mt-5 space-x-2">
            <CloseButton onClick={() => modalOpen("open", false)} />
            <SubmitButton
              label={extraDataUpdate.id_extras ? "Update" : "Tambah"}
              disabled={loading}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Extras;
