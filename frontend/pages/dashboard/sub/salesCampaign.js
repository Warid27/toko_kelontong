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
import Select from "react-select";

// Libraries
import { fetchUserList } from "@/libs/fetching/user";
import { fetchStoreList } from "@/libs/fetching/store";
import { fetchCompanyList } from "@/libs/fetching/company";
import { fetchSalesCampaignList, addSalesCampaign, updateSalesCampaign, deleteSalesCampaign } from "@/libs/fetching/salesCampaign";
import client from "@/libs/axios";

// Packages
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const SalesCampaign = () => {
  const [salesCampaign, setSalesCampaign] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [salesCampaignToUpdate, setSalesCampaignToUpdate] = useState(null);

  const [storeList, setStoreList] = useState([]);
  const [companyList, setCompanyList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const id_company = localStorage.getItem('id_company')

  const [salesCampaignDataAdd, setSalesCampaignDataAdd] = useState({
    campaign_name: "",
    rules: "",
    start_date: new Date(),
    end_date: new Date(),
    id_store: "",
    id_company: id_company,
    id_user: "",
    value: "",
  });

  const [salesCampaignDataUpdate, setSalesCampaignDataUpdate] = useState({
    id: "",
    campaign_name: "",
    rules: "",
    start_date: new Date(),
    end_date: new Date(),
    id_store: "",
    id_company: id_company,
    id_user: "",
    value: "",
  });

  const token = localStorage.getItem("token");

  // Header Table
  const ExportHeaderTable = [
    { label: "No", key: "no" },
    { label: "Nama Sales Campaign", key: "campaign_name" },
    { label: "Rules", key: "rules" },
    { label: "Start Date", key: "start_date" },
    { label: "End Date", key: "end_date" },
    { label: "Value", key: "value" },
  ];

  const HeaderTable = [
    { label: "Nama Sales Campaign", key: "campaign_name" },
    { label: "Rules", key: "rules" },
    { label: "Start Date", key: "start_date" },
    { label: "End Date", key: "end_date" },
    { label: "Value", key: "value" },
  ];

  const actions = [
    {
      icon: <MdDelete size={20} />,
      onClick: (row) => deleteSalesCampaignById(row._id),
      className: "bg-red-500 hover:bg-red-600",
    },
    {
      icon: <FaRegEdit size={20} />,
      onClick: (row) => handleUpdateSalesCampaign(row),
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
      const get_salesCampaign_list = async () => { const data = await fetchSalesCampaignList(); setSalesCampaign(data); };
      await Promise.all([get_user_list(), get_company_list(), get_store_list(), get_salesCampaign_list()]);
      setIsLoading(false);
    };
    fetching_requirement();
  }, []);

  const handleUpdateSalesCampaign = (salesCampaign) => {
    setSalesCampaignToUpdate(salesCampaign);
    modalOpen("update", true);
  };

  const deleteSalesCampaignById = async (id) => {
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
          const response = await deleteSalesCampaign(id);
          if (response.status === 200) {
            toast.success("Sales Campaign berhasil dihapus!");
            setSalesCampaign((prev) => prev.filter((p) => p._id !== id));
          }
        } catch (error) {
          toast.error("Gagal menghapus Sales Campaign: " + error.message);
        }
      }
    });
  };

  const handleChangeAdd = (value, name) => {
    setSalesCampaignDataAdd((prevState) => ({
      ...prevState,
      [name]: value instanceof Date ? value.toISOString() : value,
    }));
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      if (
        !salesCampaignDataAdd.campaign_name ||
        !salesCampaignDataAdd.rules ||
        !salesCampaignDataAdd.start_date ||
        !salesCampaignDataAdd.end_date ||
        !salesCampaignDataAdd.id_store ||
        !salesCampaignDataAdd.id_company ||
        !salesCampaignDataAdd.id_user ||
        !salesCampaignDataAdd.value
      ) {
        toast.error("Please fill all required fields.");
        return;
      }
      const reqBody = {
        campaign_name: salesCampaignDataAdd.campaign_name,
        rules: salesCampaignDataAdd.rules,
        start_date: salesCampaignDataAdd.start_date,
        end_date: salesCampaignDataAdd.end_date,
        id_store: salesCampaignDataAdd.id_store,
        id_company: salesCampaignDataAdd.id_company,
        id_user: salesCampaignDataAdd.id_user,
        value: salesCampaignDataAdd.value,
      };
      const response = await addSalesCampaign(reqBody);
      if (response.status === 201) {
        modalOpen("add", false);
        toast.success("Sales Campaign berhasil ditambahkan!");
        setSalesCampaignDataAdd({
          campaign_name: "",
          rules: "",
          start_date: new Date(),
          end_date: new Date(),
          id_store: "",
          id_company: "",
          id_user: "",
          value: "",
        });
        setSalesCampaign((prev) => [...prev, response.data]);
      } else {
        toast.error("Gagal: " + response.error);
      }
    } catch (error) {
      toast.error("Error adding Sales Campaign: " + error.message);
    }
  };

  useEffect(() => {
    if (salesCampaignToUpdate) {
      setSalesCampaignDataUpdate({
        id: salesCampaignToUpdate._id || "",
        campaign_name: salesCampaignToUpdate.campaign_name || "",
        rules: salesCampaignToUpdate.rules || "",
        start_date: salesCampaignToUpdate.start_date ? new Date(salesCampaignToUpdate.start_date) : new Date(),
        end_date: salesCampaignToUpdate.end_date ? new Date(salesCampaignToUpdate.end_date) : new Date(),
        id_store: salesCampaignToUpdate.id_store || "",
        id_company: salesCampaignToUpdate.id_company || "",
        id_user: salesCampaignToUpdate.id_user || "",
        value: salesCampaignToUpdate.value || "",
      });
    }
  }, [salesCampaignToUpdate]);

  const handleChangeUpdate = (value, name) => {
    setSalesCampaignDataUpdate((prevState) => ({
      ...prevState,
      [name]: value instanceof Date ? value.toISOString() : value,
    }));
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const reqBody = {
        campaign_name: salesCampaignDataUpdate.campaign_name,
        rules: salesCampaignDataUpdate.rules,
        start_date: salesCampaignDataUpdate.start_date,
        end_date: salesCampaignDataUpdate.end_date,
        id_store: salesCampaignDataUpdate.id_store,
        id_company: salesCampaignDataUpdate.id_company,
        id_user: salesCampaignDataUpdate.id_user,
        value: salesCampaignDataUpdate.value,
      };
      const response = await updateSalesCampaign(salesCampaignDataUpdate.id, reqBody);
      if (response.status === 200) {
        modalOpen("update", false);
        toast.success("Sales Campaign berhasil diupdate!");
        setSalesCampaign((prev) =>
          prev.map((item) => (item._id === salesCampaignDataUpdate.id ? response.data : item))
        );
      } else {
        toast.error("Gagal: " + response.error);
      }
    } catch (error) {
      toast.error("Error updating Sales Campaign: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredSalesCampaignList = salesCampaign.filter((sales) =>
    sales.campaign_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dataForExport = filteredSalesCampaignList.map((item, index) => ({
    no: index + 1,
    campaign_name: item.campaign_name,
    rules: item.rules,
    start_date: item.start_date,
    end_date: item.end_date,
    value: item.value,
  }));

  if (isLoading) return <Loading />;

  return (
    <div className="w-full h-screen pt-16 relative">
      <Header
        title="Daftar Sales Campaign"
        subtitle="Detail Daftar Sales Campaign"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        modalOpen={modalOpen}
        isSearch={true}
        isAdd={true}
      />

      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          {filteredSalesCampaignList.length === 0 ? (
            <h1>Data promo sales tidak ditemukan!</h1>
          ) : (
            <Table
              fileName="Data Sales Campaign"
              ExportHeaderTable={ExportHeaderTable}
              columns={HeaderTable}
              data={filteredSalesCampaignList}
              actions={actions}
            />
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => modalOpen("add", false)} title="Tambah Sales Campaign" width="large">
        <form onSubmit={handleSubmitAdd}>
          <p className="font-semibold mt-4">Nama Sales Campaign</p>
          <input
            type="text"
            name="campaign_name"
            value={salesCampaignDataAdd.campaign_name}
            onChange={(e) => handleChangeAdd(e.target.value, e.target.name)}
            className="border rounded-md p-2 w-full bg-white"
            required
          />
          <p className="font-semibold mt-4">Rules</p>
          <input
            type="text"
            name="rules"
            value={salesCampaignDataAdd.rules}
            onChange={(e) => handleChangeAdd(e.target.value, e.target.name)}
            className="border rounded-md p-2 w-full bg-white"
            required
          />
          <p className="font-semibold mt-4">Start Date</p>
          <DateTimePicker
            onChange={(date) => handleChangeAdd(date, "start_date")}
            value={salesCampaignDataAdd.start_date ? new Date(salesCampaignDataAdd.start_date) : null}
            name="start_date"
            format="yyyy-MM-dd HH:mm"
            className="border p-2 rounded bg-white w-full"
          />
          <p className="font-semibold mt-4">End Date</p>
          <DateTimePicker
            onChange={(date) => handleChangeAdd(date, "end_date")}
            value={salesCampaignDataAdd.end_date ? new Date(salesCampaignDataAdd.end_date) : null}
            minDate={salesCampaignDataAdd.start_date ? new Date(salesCampaignDataAdd.start_date) : null}
            name="end_date"
            format="yyyy-MM-dd HH:mm"
            className="border p-2 rounded bg-white w-full"
          />
          <p className="font-semibold mt-4 mb-2">Store</p>
          <Select
            id="store"
            className="basic-single"
            options={storeList.map((c) => ({ value: c._id, label: c.name }))}
            value={storeList.map((c) => ({ value: c._id, label: c.name })).find((opt) => opt.value === salesCampaignDataAdd.id_store) || null}
            onChange={(selectedOption) => setSalesCampaignDataAdd((prev) => ({ ...prev, id_store: selectedOption ? selectedOption.value : "" }))}
            isSearchable
            required
            placeholder="Pilih Store..."
            noOptionsMessage={() => "No Store available"}
          />
          {/* <p className="font-semibold mt-4 mb-2">Company</p>
          <Select
            id="company"
            className="basic-single"
            options={companyList.map((c) => ({ value: c._id, label: c.name }))}
            value={companyList.map((c) => ({ value: c._id, label: c.name })).find((opt) => opt.value === salesCampaignDataAdd.id_company) || null}
            onChange={(selectedOption) => setSalesCampaignDataAdd((prev) => ({ ...prev, id_company: selectedOption ? selectedOption.value : "" }))}
            isSearchable
            required
            placeholder="Pilih Company..."
            noOptionsMessage={() => "No Company available"}
          /> */}
          <p className="font-semibold mt-4 mb-2">User</p>
          <Select
            id="user"
            className="basic-single"
            options={userList.map((c) => ({ value: c._id, label: c.username }))}
            value={userList.map((c) => ({ value: c._id, label: c.username })).find((opt) => opt.value === salesCampaignDataAdd.id_user) || null}
            onChange={(selectedOption) => setSalesCampaignDataAdd((prev) => ({ ...prev, id_user: selectedOption ? selectedOption.value : "" }))}
            isSearchable
            required
            placeholder="Pilih User..."
            noOptionsMessage={() => "No User available"}
          />
          <p className="font-semibold mt-4 mb-2">Value</p>
          <input
            type="text"
            name="value"
            value={salesCampaignDataAdd.value}
            onChange={(e) => handleChangeAdd(e.target.value, e.target.name)}
            className="border rounded-md p-2 w-full bg-white"
            required
          />
          <div className="flex justify-end mt-5">
            <CloseButton onClick={() => modalOpen("add", false)} />
            <SubmitButton />
          </div>
        </form>
      </Modal>

      <Modal isOpen={isUpdateModalOpen} onClose={() => modalOpen("update", false)} title="Edit Sales Campaign" width="large">
        <form onSubmit={handleSubmitUpdate}>
          <p className="font-semibold mt-4">Nama Sales Campaign</p>
          <input
            type="text"
            name="campaign_name"
            value={salesCampaignDataUpdate.campaign_name}
            onChange={(e) => handleChangeUpdate(e.target.value, e.target.name)}
            className="border rounded-md p-2 w-full bg-white"
            required
          />
          <p className="font-semibold mt-4">Rules</p>
          <input
            type="text"
            name="rules"
            value={salesCampaignDataUpdate.rules}
            onChange={(e) => handleChangeUpdate(e.target.value, e.target.name)}
            className="border rounded-md p-2 w-full bg-white"
            required
          />
          <p className="font-semibold mt-4">Start Date</p>
          <DateTimePicker
            onChange={(date) => handleChangeUpdate(date, "start_date")}
            value={salesCampaignDataUpdate.start_date ? new Date(salesCampaignDataUpdate.start_date) : null}
            name="start_date"
            format="yyyy-MM-dd HH:mm"
            className="border p-2 rounded bg-white w-full"
          />
          <p className="font-semibold mt-4">End Date</p>
          <DateTimePicker
            onChange={(date) => handleChangeUpdate(date, "end_date")}
            value={salesCampaignDataUpdate.end_date ? new Date(salesCampaignDataUpdate.end_date) : null}
            minDate={salesCampaignDataUpdate.start_date ? new Date(salesCampaignDataUpdate.start_date) : null}
            name="end_date"
            format="yyyy-MM-dd HH:mm"
            className="border p-2 rounded bg-white w-full"
          />
          <p className="font-semibold mt-4 mb-2">Store</p>
          <Select
            id="store"
            className="basic-single"
            options={storeList.map((c) => ({ value: c._id, label: c.name }))}
            value={storeList.map((c) => ({ value: c._id, label: c.name })).find((opt) => opt.value === salesCampaignDataUpdate.id_store) || null}
            onChange={(selectedOption) => setSalesCampaignDataUpdate((prev) => ({ ...prev, id_store: selectedOption ? selectedOption.value : "" }))}
            isSearchable
            required
            placeholder="Pilih Store..."
            noOptionsMessage={() => "No Store available"}
          />
          {/* <p className="font-semibold mt-4 mb-2">Company</p>
          <Select
            id="company"
            className="basic-single"
            options={companyList.map((c) => ({ value: c._id, label: c.name }))}
            value={companyList.map((c) => ({ value: c._id, label: c.name })).find((opt) => opt.value === salesCampaignDataUpdate.id_company) || null}
            onChange={(selectedOption) => setSalesCampaignDataUpdate((prev) => ({ ...prev, id_company: selectedOption ? selectedOption.value : "" }))}
            isSearchable
            required
            placeholder="Pilih Company..."
            noOptionsMessage={() => "No Company available"}
          /> */}
          <p className="font-semibold mt-4 mb-2">User</p>
          <Select
            id="user"
            className="basic-single"
            options={userList.map((c) => ({ value: c._id, label: c.username }))}
            value={userList.map((c) => ({ value: c._id, label: c.username })).find((opt) => opt.value === salesCampaignDataUpdate.id_user) || null}
            onChange={(selectedOption) => setSalesCampaignDataUpdate((prev) => ({ ...prev, id_user: selectedOption ? selectedOption.value : "" }))}
            isSearchable
            required
            placeholder="Pilih User..."
            noOptionsMessage={() => "No User available"}
          />
          <p className="font-semibold mt-4 mb-2">Value</p>
          <input
            type="text"
            name="value"
            value={salesCampaignDataUpdate.value}
            onChange={(e) => handleChangeUpdate(e.target.value, e.target.name)}
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

export default SalesCampaign;