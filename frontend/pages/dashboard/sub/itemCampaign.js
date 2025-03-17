import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Icons
import { IoSearchOutline } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";

// Components
import { SubmitButton, CloseButton } from "@/components/form/button";
import Table from "@/components/form/table";
import { Modal } from "@/components/Modal";
import Header from "@/components/section/header";
import Loading from "@/components/loading";
import DateTimePicker from "@/components/DateTimePicker";

// Libraries
import { fetchCompanyList } from "@/libs/fetching/company";
import { fetchUserList } from "@/libs/fetching/user";
import { fetchStoreList } from "@/libs/fetching/store";
import { fetchItemCampaignList, addItemCampaign, updateItemCampaign, deleteItemCampaign } from "@/libs/fetching/itemCampaign";
import client from "@/libs/axios";

// Packages
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const ItemCampaign = () => {
  const [itemCampaign, setItemCampaign] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [itemCampaignToUpdate, setItemCampaignToUpdate] = useState(null);

  const [storeList, setStoreList] = useState([]);
  const [companyList, setCompanyList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [itemCampaignDataAdd, setItemCampaignDataAdd] = useState({
    item_campaign_name: "",
    rules: "",
    value: "",
    start_date: new Date(),
    end_date: new Date(),
  });

  const [itemCampaignDataUpdate, setItemCampaignDataUpdate] = useState({
    id: "",
    item_campaign_name: "",
    rules: "",
    value: "",
    start_date: new Date(),
    end_date: new Date(),
  });

  const id_store = localStorage.getItem("id_store") === "undefined" ? null : localStorage.getItem("id_store");
  const id_company = localStorage.getItem("id_company") === "undefined" ? null : localStorage.getItem("id_company");
  const id_user = localStorage.getItem("id_user") === "undefined" ? null : localStorage.getItem("id_user");
  const token = localStorage.getItem("token");

  // Header Table
  const ExportHeaderTable = [
    { label: "No", key: "no" },
    { label: "Nama Item Campaign", key: "item_campaign_name" },
    { label: "Rules", key: "rules" },
    { label: "Start Date", key: "start_date" },
    { label: "End Date", key: "end_date" },
    { label: "Value", key: "value" },
  ];

  const HeaderTable = [
    { label: "Nama Item Campaign", key: "item_campaign_name" },
    { label: "Rules", key: "rules" },
    { label: "Start Date", key: "start_date" },
    { label: "End Date", key: "end_date" },
    { 
      label: "Value", 
      key: "value",
      render: (value) => `${(value * 100)}%`, // Tampilkan value sebagai persentase
    },
  ];

  const actions = [
    {
      icon: <MdDelete size={20} />,
      onClick: (row) => deleteItemCampaignById(row._id),
      className: "bg-red-500 hover:bg-red-600",
    },
    {
      icon: <FaRegEdit size={20} />,
      onClick: (row) => handleUpdateItemCampaign(row),
      className: "bg-blue-500 hover:bg-blue-600",
    },
  ];

  // --- Functions
  const modalOpen = (param, bool) => {
    const setters = { add: setIsModalOpen, update: setIsUpdateModalOpen };
    if (setters[param]) setters[param](bool);
  };

  useEffect(() => {
    const fetching_requirement = async () => {
      const get_user_list = async () => { const data = await fetchUserList(); setUserList(data); };
      const get_company_list = async () => { const data = await fetchCompanyList(); setCompanyList(data); };
      const get_store_list = async () => { const data = await fetchStoreList(); setStoreList(data); };
      const get_itemCampaign_list = async () => { const data = await fetchItemCampaignList(); setItemCampaign(data); };
      await Promise.all([get_user_list(), get_company_list(), get_store_list(), get_itemCampaign_list()]);
      setIsLoading(false);
    };
    fetching_requirement();
  }, []);

  const handleUpdateItemCampaign = (itemCampaign) => {
    setItemCampaignToUpdate(itemCampaign);
    modalOpen("update", true);
  };

  const deleteItemCampaignById = async (id) => {
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
          const response = await deleteItemCampaign(id);
          if (response.status === 200) {
            toast.success("Item Campaign berhasil dihapus!");
            setItemCampaign((prev) => prev.filter((p) => p._id !== id));
          }
        } catch (error) {
          toast.error("Gagal menghapus Item Campaign: " + error.message);
        }
      }
    });
  };

  const handleChangeAdd = (value, name) => {
    setItemCampaignDataAdd((prevState) => ({
      ...prevState,
      [name]: value instanceof Date ? value.toISOString() : value,
    }));
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      if (
        !itemCampaignDataAdd.item_campaign_name ||
        !itemCampaignDataAdd.rules ||
        !itemCampaignDataAdd.value ||
        !itemCampaignDataAdd.start_date ||
        !itemCampaignDataAdd.end_date
      ) {
        toast.error("Please fill all required fields.");
        return;
      }
      const value = parseFloat(itemCampaignDataAdd.value) / 100; // Konversi persentase ke desimal
      const reqBody = {
        item_campaign_name: itemCampaignDataAdd.item_campaign_name,
        rules: itemCampaignDataAdd.rules,
        value: value,
        start_date: itemCampaignDataAdd.start_date,
        end_date: itemCampaignDataAdd.end_date,
        id_store: id_store,
        id_company: id_company,
        id_user: id_user,
      };
      const response = await addItemCampaign(reqBody);
      if (response.status === 201) {
        modalOpen("add", false);
        toast.success("Item Campaign berhasil ditambahkan!");
        setItemCampaignDataAdd({
          item_campaign_name: "",
          rules: "",
          value: "",
          start_date: new Date(),
          end_date: new Date(),
        });
        setItemCampaign((prev) => [...prev, response.data]);
      } else {
        toast.error("Gagal: " + response.error);
      }
    } catch (error) {
      toast.error("Error adding Item Campaign: " + error.message);
    }
  };

  useEffect(() => {
    if (itemCampaignToUpdate) {
      setItemCampaignDataUpdate({
        id: itemCampaignToUpdate._id || "",
        item_campaign_name: itemCampaignToUpdate.item_campaign_name || "",
        rules: itemCampaignToUpdate.rules || "",
        value: (itemCampaignToUpdate.value * 100) || "", // Konversi desimal ke persentase
        start_date: itemCampaignToUpdate.start_date ? new Date(itemCampaignToUpdate.start_date) : new Date(),
        end_date: itemCampaignToUpdate.end_date ? new Date(itemCampaignToUpdate.end_date) : new Date(),
      });
    }
  }, [itemCampaignToUpdate]);

  const handleChangeUpdate = (value, name) => {
    setItemCampaignDataUpdate((prevState) => ({
      ...prevState,
      [name]: value instanceof Date ? value.toISOString() : value,
    }));
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const value = parseFloat(itemCampaignDataUpdate.value) / 100; // Konversi persentase ke desimal
      const reqBody = {
        item_campaign_name: itemCampaignDataUpdate.item_campaign_name,
        rules: itemCampaignDataUpdate.rules,
        value: value,
        start_date: itemCampaignDataUpdate.start_date,
        end_date: itemCampaignDataUpdate.end_date,
        id_store: id_store,
        id_company: id_company,
        id_user: id_user,
      };
      const response = await updateItemCampaign(itemCampaignDataUpdate.id, reqBody);
      if (response.status === 200) {
        modalOpen("update", false);
        toast.success("Item Campaign berhasil diupdate!");
        setItemCampaign((prev) =>
          prev.map((item) => (item._id === itemCampaignDataUpdate.id ? response.data : item))
        );
      } else {
        toast.error("Gagal: " + response.error);
      }
    } catch (error) {
      toast.error("Error updating Item Campaign: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredItemCampaignList = itemCampaign.filter((item) =>
    item.item_campaign_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dataForExport = filteredItemCampaignList.map((item, index) => ({
    no: index + 1,
    item_campaign_name: item.item_campaign_name,
    rules: item.rules,
    start_date: item.start_date,
    end_date: item.end_date,
    value: `${(item.value * 100)}%`,
  }));

  if (isLoading) return <Loading />;

  return (
    <div className="w-full h-screen pt-16 relative">
      <Header
        title="Daftar Item Campaign"
        subtitle="Detail Daftar Item Campaign"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        modalOpen={modalOpen}
        isSearch={true}
        isAdd={true}
      />

      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          {filteredItemCampaignList.length === 0 ? (
            <h1>Data campaign tidak ditemukan!</h1>
          ) : (
            <Table
              fileName="Data Item Campaign"
              ExportHeaderTable={ExportHeaderTable}
              columns={HeaderTable}
              data={filteredItemCampaignList}
              actions={actions}
            />
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => modalOpen("add", false)} title="Tambah Item Campaign" width="large">
        <form onSubmit={handleSubmitAdd}>
          <p className="font-semibold mt-4">Nama Item Campaign</p>
          <input
            type="text"
            name="item_campaign_name"
            value={itemCampaignDataAdd.item_campaign_name}
            onChange={(e) => handleChangeAdd(e.target.value, e.target.name)}
            className="border rounded-md p-2 w-full bg-white"
            required
          />
          <p className="font-semibold mt-4">Rules</p>
          <input
            type="text"
            name="rules"
            value={itemCampaignDataAdd.rules}
            onChange={(e) => handleChangeAdd(e.target.value, e.target.name)}
            className="border rounded-md p-2 w-full bg-white"
            required
          />
          <p className="font-semibold mt-4">Start Date</p>
          <DateTimePicker
            onChange={(date) => handleChangeAdd(date, "start_date")}
            value={itemCampaignDataAdd.start_date ? new Date(itemCampaignDataAdd.start_date) : null}
            name="start_date"
            format="yyyy-MM-dd HH:mm"
            className="border p-2 rounded bg-white w-full"
          />
          <p className="font-semibold mt-4">End Date</p>
          <DateTimePicker
            onChange={(date) => handleChangeAdd(date, "end_date")}
            value={itemCampaignDataAdd.end_date ? new Date(itemCampaignDataAdd.end_date) : null}
            minDate={itemCampaignDataAdd.start_date ? new Date(itemCampaignDataAdd.start_date) : null}
            name="end_date"
            format="yyyy-MM-dd HH:mm"
            className="border p-2 rounded bg-white w-full"
          />
          <p className="font-semibold mt-4 mb-2">Value</p>
          <div className="relative">
            <input
              type="number"
              name="value"
              value={itemCampaignDataAdd.value}
              onChange={(e) => handleChangeAdd(e.target.value, e.target.name)}
              className="border rounded-md p-2 pr-8 w-full bg-white"
              required
              max={99}
              min={1}
              step={1}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 pointer-events-none">
              %
            </span>
          </div>
          <div className="flex justify-end mt-5">
            <CloseButton onClick={() => modalOpen("add", false)} />
            <SubmitButton />
          </div>
        </form>
      </Modal>

      <Modal isOpen={isUpdateModalOpen} onClose={() => modalOpen("update", false)} title="Edit Item Campaign" width="large">
        <form onSubmit={handleSubmitUpdate}>
          <p className="font-semibold mt-4">Nama Item Campaign</p>
          <input
            type="text"
            name="item_campaign_name"
            value={itemCampaignDataUpdate.item_campaign_name}
            onChange={(e) => handleChangeUpdate(e.target.value, e.target.name)}
            className="border rounded-md p-2 w-full bg-white"
            required
          />
          <p className="font-semibold mt-4">Rules</p>
          <input
            type="text"
            name="rules"
            value={itemCampaignDataUpdate.rules}
            onChange={(e) => handleChangeUpdate(e.target.value, e.target.name)}
            className="border rounded-md p-2 w-full bg-white"
            required
          />
          <p className="font-semibold mt-4">Start Date</p>
          <DateTimePicker
            onChange={(date) => handleChangeUpdate(date, "start_date")}
            value={itemCampaignDataUpdate.start_date ? new Date(itemCampaignDataUpdate.start_date) : null}
            name="start_date"
            format="yyyy-MM-dd HH:mm"
            className="border p-2 rounded bg-white w-full"
          />
          <p className="font-semibold mt-4">End Date</p>
          <DateTimePicker
            onChange={(date) => handleChangeUpdate(date, "end_date")}
            value={itemCampaignDataUpdate.end_date ? new Date(itemCampaignDataUpdate.end_date) : null}
            minDate={itemCampaignDataUpdate.start_date ? new Date(itemCampaignDataUpdate.start_date) : null}
            name="end_date"
            format="yyyy-MM-dd HH:mm"
            className="border p-2 rounded bg-white w-full"
          />
          <p className="font-semibold mt-4 mb-2">Value</p>
          <div className="relative">
            <input
              type="number"
              name="value"
              value={itemCampaignDataUpdate.value}
              onChange={(e) => handleChangeUpdate(e.target.value, e.target.name)}
              className="border rounded-md p-2 pr-8 w-full bg-white"
              required
              max={99}
              min={1}
              step={1}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 pointer-events-none">
              %
            </span>
          </div>
          <div className="flex justify-end mt-5">
            <CloseButton onClick={() => modalOpen("update", false)} />
            <SubmitButton />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ItemCampaign;