import React, { useEffect, useState, useCallback } from "react";
import { MdDelete } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import { SubmitButton, CloseButton } from "@/components/form/button";
import Table from "@/components/form/table";
import { Modal } from "@/components/Modal";
import Header from "@/components/section/header";
import Loading from "@/components/loading";
import DateTimePicker from "@/components/DateTimePicker";
import {
  fetchItemCampaignList,
  addItemCampaign,
  updateItemCampaign,
  deleteItemCampaign,
} from "@/libs/fetching/itemCampaign";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import useUserStore from "@/stores/user-store";

// Separate FormContent component
const FormContent = React.memo(
  ({
    isUpdate,
    data,
    formErrors,
    handleChange,
    handleDateChange,
    handleSubmit,
    onClose,
  }) => {
    return (
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <p className="font-semibold">Nama Item Campaign</p>
            <input
              type="text"
              name="item_campaign_name"
              value={data.item_campaign_name}
              onChange={handleChange}
              className={`border rounded-md p-2 w-full bg-white ${
                formErrors.item_campaign_name ? "border-red-500" : ""
              }`}
            />
            {formErrors.item_campaign_name && (
              <p className="text-red-500 text-sm">
                {formErrors.item_campaign_name}
              </p>
            )}
          </div>
          <div>
            <p className="font-semibold">Rules</p>
            <input
              type="text"
              name="rules"
              value={data.rules}
              onChange={handleChange}
              className={`border rounded-md p-2 w-full bg-white ${
                formErrors.rules ? "border-red-500" : ""
              }`}
            />
            {formErrors.rules && (
              <p className="text-red-500 text-sm">{formErrors.rules}</p>
            )}
          </div>
          <div>
            <p className="font-semibold">Start Date</p>
            <DateTimePicker
              onChange={(date) => handleDateChange(date, "start_date")}
              value={new Date(data.start_date)}
              name="start_date"
              format="yyyy-MM-dd HH:mm"
              className={`border p-2 rounded bg-white w-full ${
                formErrors.start_date ? "border-red-500" : ""
              }`}
            />
            {formErrors.start_date && (
              <p className="text-red-500 text-sm">{formErrors.start_date}</p>
            )}
          </div>
          <div>
            <p className="font-semibold">End Date</p>
            <DateTimePicker
              onChange={(date) => handleDateChange(date, "end_date")}
              value={new Date(data.end_date)}
              minDate={new Date(data.start_date)}
              name="end_date"
              format="yyyy-MM-dd HH:mm"
              className={`border p-2 rounded bg-white w-full ${
                formErrors.end_date ? "border-red-500" : ""
              }`}
            />
            {formErrors.end_date && (
              <p className="text-red-500 text-sm">{formErrors.end_date}</p>
            )}
          </div>
          <div>
            <p className="font-semibold mb-2">Value</p>
            <div className="relative">
              <input
                type="number"
                name="value"
                value={data.value}
                onChange={handleChange}
                className={`border rounded-md p-2 pr-8 w-full bg-white ${
                  formErrors.value ? "border-red-500" : ""
                }`}
                max={99}
                min={1}
                step={1}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">
                %
              </span>
            </div>
            {formErrors.value && (
              <p className="text-red-500 text-sm">{formErrors.value}</p>
            )}
          </div>
        </div>
        <div className="flex justify-end mt-5 gap-2">
          <CloseButton onClick={onClose} />
          <SubmitButton />
        </div>
      </form>
    );
  }
);
FormContent.displayName = "FormContent";

const ItemCampaign = () => {
  const { userData } = useUserStore();
  const id_store = userData.id_store;
  const id_user = userData.id;
  const id_company = userData.id_company;

  const [itemCampaign, setItemCampaign] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formErrors, setFormErrors] = useState({});
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

  const ExportHeaderTable = [
    { label: "No", key: "no" },
    { label: "Nama Promo", key: "item_campaign_name" },
    { label: "Rules", key: "rules" },
    { label: "Tanggal Mulai", key: "start_date" },
    { label: "Tanggal Berakhir", key: "end_date" },
    {
      label: "Nilai Promo",
      key: "value",
      render: (value) => `${value * 100}%`,
    },
  ];
  const HeaderTable = [
    { label: "Nama Promo", key: "item_campaign_name" },
    { label: "Rules", key: "rules" },
    { label: "Tanggal Mulai", key: "start_date" },
    { label: "Tanggal Berakhir", key: "end_date" },
    {
      label: "Nilai Promo",
      key: "value",
      render: (value) => `${value * 100}%`,
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
      onClick: (row) => handleUpdate(row),
      className: "bg-blue-500 hover:bg-blue-600",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const campaigns = await fetchItemCampaignList();
        setItemCampaign(campaigns);
      } catch (error) {
        toast.error("Failed to load data: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const validateForm = (data) => {
    const errors = {};
    if (!data.item_campaign_name)
      errors.item_campaign_name = "Name is required";
    if (!data.rules) errors.rules = "Rules are required";
    if (!data.value || isNaN(data.value) || data.value <= 0 || data.value > 99)
      errors.value = "Value must be a percentage between 1% and 99%.";
    if (!data.start_date) errors.start_date = "Start date is required";
    if (!data.end_date) errors.end_date = "End date is required";
    if (new Date(data.start_date) >= new Date(data.end_date))
      errors.end_date = "End date must be after start date";
    return errors;
  };

  const handleChangeAdd = useCallback((e) => {
    const { name, value } = e.target;
    setItemCampaignDataAdd((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: null }));
  }, []);

  const handleChangeUpdate = useCallback((e) => {
    const { name, value } = e.target;
    setItemCampaignDataUpdate((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: null }));
  }, []);

  const handleDateChangeAdd = useCallback((date, name) => {
    setItemCampaignDataAdd((prev) => ({
      ...prev,
      [name]: date,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: null }));
  }, []);

  const handleDateChangeUpdate = useCallback((date, name) => {
    setItemCampaignDataUpdate((prev) => ({
      ...prev,
      [name]: date,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: null }));
  }, []);

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    const errors = validateForm(itemCampaignDataAdd);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      const reqBody = {
        ...itemCampaignDataAdd,
        value: parseFloat(itemCampaignDataAdd.value) / 100,
        id_store: id_store,
        id_user: id_user,
        id_company: id_company,
      };

      const response = await addItemCampaign(reqBody);
      if (response.status === 201) {
        setItemCampaign((prev) => [...prev, response.data]);
        setIsModalOpen(false);
        setItemCampaignDataAdd({
          item_campaign_name: "",
          rules: "",
          value: "",
          start_date: new Date(),
          end_date: new Date(),
        });
        toast.success("Item Campaign added successfully!");
      }
    } catch (error) {
      toast.error("Error adding Item Campaign: " + error.message);
    }
  };

  const handleUpdate = (item) => {
    setItemCampaignDataUpdate({
      id: item._id,
      item_campaign_name: item.item_campaign_name,
      rules: item.rules,
      value: item.value * 100,
      start_date: new Date(item.start_date),
      end_date: new Date(item.end_date),
    });
    setIsUpdateModalOpen(true);
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    const errors = validateForm(itemCampaignDataUpdate);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      const reqBody = {
        ...itemCampaignDataUpdate,
        value: parseFloat(itemCampaignDataUpdate.value) / 100,
        id_user: id_user,
        id_store: id_store,
        id_company: id_company,
      };
      const response = await updateItemCampaign(
        itemCampaignDataUpdate.id,
        reqBody
      );
      if (response.status === 200) {
        setItemCampaign((prev) =>
          prev.map((item) =>
            item._id === itemCampaignDataUpdate.id ? response.data : item
          )
        );
        setIsUpdateModalOpen(false);
        toast.success("Item Campaign updated successfully!");
      }
    } catch (error) {
      toast.error("Error updating Item Campaign: " + error.message);
    }
  };

  const deleteItemCampaignById = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      confirmButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      try {
        await deleteItemCampaign(id);
        setItemCampaign((prev) => prev.filter((p) => p._id !== id));
        toast.success("Item Campaign deleted successfully!");
      } catch (error) {
        toast.error("Error deleting Item Campaign: " + error.message);
      }
    }
  };

  const filteredItems = itemCampaign.filter((item) => {
    const query = searchQuery.toLowerCase();

    return (
      item.item_campaign_name.toLowerCase().includes(query) ||
      item.rules.toLowerCase().includes(query) ||
      item.value.toString().includes(query) || // Convert number to string
      item.start_date.toLowerCase().includes(query) ||
      item.end_date.toLowerCase().includes(query)
    );
  });

  if (isLoading) return <Loading />;

  return (
    <div className="w-full h-screen pt-16">
      <Header
        title="Daftar Item Campaign"
        subtitle="Detail Daftar Item Campaign"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        modalOpen={(type, value) =>
          type === "add" ? setIsModalOpen(value) : setIsUpdateModalOpen(value)
        }
        isSearch={true}
        isAdd={true}
      />
      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          {filteredItems.length === 0 ? (
            <h1>Data campaign tidak ditemukan!</h1>
          ) : (
            <Table
              columns={HeaderTable}
              data={filteredItems}
              actions={actions}
              fileName="Data Promo Produk"
              ExportHeaderTable={ExportHeaderTable}
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Item Campaign"
        width="large"
      >
        <FormContent
          isUpdate={false}
          data={itemCampaignDataAdd}
          formErrors={formErrors}
          handleChange={handleChangeAdd}
          handleDateChange={handleDateChangeAdd}
          handleSubmit={handleSubmitAdd}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Edit Item Campaign"
        width="large"
      >
        <FormContent
          isUpdate={true}
          data={itemCampaignDataUpdate}
          formErrors={formErrors}
          handleChange={handleChangeUpdate}
          handleDateChange={handleDateChangeUpdate}
          handleSubmit={handleSubmitUpdate}
          onClose={() => setIsUpdateModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default ItemCampaign;
