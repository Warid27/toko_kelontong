import React, { useEffect, useState, useCallback } from "react";
import { MdDelete } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import { SubmitButton, CloseButton } from "@/components/form/button";
import Table from "@/components/form/table";
import { Modal } from "@/components/Modal";
import Header from "@/components/section/header";
import Loading from "@/components/loading";
import DateTimePicker from "@/components/DateTimePicker";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  fetchSalesCampaignList,
  addSalesCampaign,
  updateSalesCampaign,
} from "@/libs/fetching/salesCampaign";

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
            <p className="font-semibold">Nama Sales Campaign</p>
            <input
              type="text"
              name="campaign_name"
              value={data.campaign_name}
              onChange={handleChange}
              className={`border rounded-md p-2 w-full bg-white ${
                formErrors.campaign_name ? "border-red-500" : ""
              }`}
            />
            {formErrors.campaign_name && (
              <p className="text-red-500 text-sm">{formErrors.campaign_name}</p>
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

const SalesCampaign = () => {
  const [salesCampaign, setSalesCampaign] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const [salesCampaignDataAdd, setSalesCampaignDataAdd] = useState({
    campaign_name: "",
    rules: "",
    start_date: new Date(),
    end_date: new Date(),
    value: "",
  });

  const [salesCampaignDataUpdate, setSalesCampaignDataUpdate] = useState({
    id: "",
    campaign_name: "",
    rules: "",
    start_date: new Date(),
    end_date: new Date(),
    value: "",
  });

  const ExportHeaderTable = [
    { label: "No", key: "no" },
    { label: "Nama Sales Campaign", key: "campaign_name" },
    { label: "Rules", key: "rules" },
    { label: "Start Date", key: "start_date" },
    { label: "End Date", key: "end_date" },
    { label: "Value", key: "value", render: (value) => `${value}%` },
  ];

  const HeaderTable = [
    { label: "Nama Sales Campaign", key: "campaign_name" },
    { label: "Rules", key: "rules" },
    { label: "Start Date", key: "start_date" },
    { label: "End Date", key: "end_date" },
    { label: "Value", key: "value", render: (value) => `${value}%` },
  ];

  const actions = [
    {
      icon: <MdDelete size={20} />,
      onClick: (row) => deleteSalesCampaignById(row._id),
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
        const campaigns = await fetchSalesCampaignList();
        setSalesCampaign(campaigns);
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
    if (!data.campaign_name) errors.campaign_name = "Name is required";
    if (!data.rules) errors.rules = "Rules are required";
    if (!data.value || isNaN(data.value) || data.value <= 0 || data.value > 99)
      errors.value = "Value must be a percentage between 1% and 99%";
    if (!data.start_date) errors.start_date = "Start date is required";
    if (!data.end_date) errors.end_date = "End date is required";
    if (new Date(data.start_date) >= new Date(data.end_date))
      errors.end_date = "End date must be after start date";
    return errors;
  };

  const handleChangeAdd = useCallback((e) => {
    const { name, value } = e.target;
    setSalesCampaignDataAdd((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: null }));
  }, []);

  const handleChangeUpdate = useCallback((e) => {
    const { name, value } = e.target;
    setSalesCampaignDataUpdate((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: null }));
  }, []);

  const handleDateChangeAdd = useCallback((date, name) => {
    setSalesCampaignDataAdd((prev) => ({
      ...prev,
      [name]: date,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: null }));
  }, []);

  const handleDateChangeUpdate = useCallback((date, name) => {
    setSalesCampaignDataUpdate((prev) => ({
      ...prev,
      [name]: date,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: null }));
  }, []);

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    const errors = validateForm(salesCampaignDataAdd);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      const reqBody = {
        ...salesCampaignDataAdd,
        value: parseFloat(salesCampaignDataAdd.value),
      };
      const response = await addSalesCampaign(reqBody);
      if (response.status === 201) {
        setSalesCampaign((prev) => [...prev, response.data]);
        setIsModalOpen(false);
        setSalesCampaignDataAdd({
          campaign_name: "",
          rules: "",
          start_date: new Date(),
          end_date: new Date(),
          value: "",
        });
        toast.success("Sales Campaign added successfully!");
      }
    } catch (error) {
      toast.error("Error adding Sales Campaign: " + error.message);
    }
  };

  const handleUpdate = (item) => {
    setSalesCampaignDataUpdate({
      id: item._id,
      campaign_name: item.campaign_name,
      rules: item.rules,
      start_date: new Date(item.start_date),
      end_date: new Date(item.end_date),
      value: item.value,
    });
    setIsUpdateModalOpen(true);
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    const errors = validateForm(salesCampaignDataUpdate);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      const reqBody = {
        ...salesCampaignDataUpdate,
        value: parseFloat(salesCampaignDataUpdate.value),
      };
      const response = await updateSalesCampaign(
        salesCampaignDataUpdate.id,
        reqBody
      );
      if (response.status === 200) {
        setSalesCampaign((prev) =>
          prev.map((item) =>
            item._id === salesCampaignDataUpdate.id ? response.data : item
          )
        );
        setIsUpdateModalOpen(false);
        toast.success("Sales Campaign updated successfully!");
      }
    } catch (error) {
      toast.error("Error updating Sales Campaign: " + error.message);
    }
  };

  const deleteSalesCampaignById = async (id) => {
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
        await deleteSalesCampaign(id);
        setSalesCampaign((prev) => prev.filter((p) => p._id !== id));
        toast.success("Sales Campaign deleted successfully!");
      } catch (error) {
        toast.error("Error deleting Sales Campaign: " + error.message);
      }
    }
  };

  const filteredSalesCampaign = salesCampaign.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.campaign_name.toLowerCase().includes(query) ||
      item.rules.toLowerCase().includes(query) ||
      item.value.toString().includes(query) ||
      item.start_date.toLowerCase().includes(query) ||
      item.end_date.toLowerCase().includes(query)
    );
  });

  if (isLoading) return <Loading />;

  return (
    <div className="w-full h-screen pt-16">
      <Header
        title="Daftar Sales Campaign"
        subtitle="Detail Daftar Sales Campaign"
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
          {filteredSalesCampaign.length === 0 ? (
            <h1>Data promo sales tidak ditemukan!</h1>
          ) : (
            <Table
              columns={HeaderTable}
              data={filteredSalesCampaign}
              actions={actions}
              fileName="Data Promo Penjualan"
              ExportHeaderTable={ExportHeaderTable}
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Sales Campaign"
        width="large"
      >
        <FormContent
          isUpdate={false}
          data={salesCampaignDataAdd}
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
        title="Edit Sales Campaign"
        width="large"
      >
        <FormContent
          isUpdate={true}
          data={salesCampaignDataUpdate}
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

export default SalesCampaign;
