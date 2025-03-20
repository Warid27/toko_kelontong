import React, { useEffect, useState } from "react";

// Icons
import { MdDelete } from "react-icons/md";
import { FaInfoCircle } from "react-icons/fa";

// Components
import { SubmitButton, CloseButton } from "@/components/form/button";
import Table from "@/components/form/table";
import { Modal } from "@/components/Modal";
import Header from "@/components/section/header";
import Loading from "@/components/loading";
import Toggle from "@/components/form/toggle"

// Libraries
import {
  fetchRuleList,
  updateRule,
  addRule,
  deleteRule,
} from "@/libs/fetching/rule";
import { fetchCollectionList } from "@/libs/fetching/collections";

// Packages
import { toast } from "react-toastify";
import Select from "react-select";
import Swal from "sweetalert2";

const RuleAccessData = () => {
  const [rules, setRules] = useState([]);
  const [tableList, setTableList] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [ruleToUpdate, setRuleToUpdate] = useState(null);
  const [filterBy, setFilterBy] = useState("1");

  const [searchQuery, setSearchQuery] = useState("");

  const [ruleDataAdd, setRuleDataAdd] = useState({
    rule: 0,
    table_name: "",
    can_create: 0,
    can_read: 0,
    can_update: 0,
    can_delete: 0
  });

  const [ruleDataUpdate, setRuleDataUpdate] = useState({
    id: "",
    rule: 0,
    table_name: "",
    can_create: 0,
    can_read: 0,
    can_update: 0,
    can_delete: 0
  });

  useEffect(() => {
    const fetchTable = async () => {
      try {
        const tableData = await fetchCollectionList()
        setTableList(tableData.data);
        console.log("tablenya", tableData.data)
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching collection data:", error);
        toast.error("Failed to load collection data");
        setIsLoading(false);
      }
    };
    fetchTable();
  }, []);

  const ruleOptions = [
    { value: 1, label: "Superadmin" },
    { value: 2, label: "Admin" },
    { value: 3, label: "Manager" },
    { value: 4, label: "Cashier" },
    { value: 5, label: "Customer" },
  ];


  const ExportHeaderTable = [
    { label: "No", key: "no" },
    { label: "Rule", key: "rule" },
    { label: "Table Name", key: "table_name" },
    { label: "Create", key: "can_create" },
    { label: "Read", key: "can_read" },
    { label: "Update", key: "can_update" },
    { label: "Delete", key: "can_delete" },
  ];

  const HeaderTable = [
    { label: "Rule", key: "rule",
        render: (value, row) => (
            <div className="relative">
              {ruleOptions.find(ro => ro.value === value).label}
            </div>
          ),
     },
    {
      key: "table_name",
      label: "Table Name",
      render: (value, row) => (
        <div className="relative">
          <select
            className="bg-white border border-green-300 p-2 rounded-lg shadow-xl focus:ring focus:ring-green-300 w-full cursor-pointer"
            value={value}
            onChange={(e) => handleTableSelect(row._id, e.target.value)}
          >
            {tableList.map((option) => (
              <option key={option.name} value={option.name}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
      ),
    },
    {
      key: "can_create",
      label: "Create",
      render: (value, row) => (
        <Toggle
            isChecked={value === 1}
            onChange={() => {
                const newValue = value === 1 ? 0 : 1;
                handlePermissionChange(row._id, "can_create", newValue);
              }}
            name="can_create"
        />
      ),
    },
    {
      key: "can_read",
      label: "Read",
      render: (value, row) => (
        <Toggle
            isChecked={value === 1}
            onChange={() => {
                const newValue = value === 1 ? 0 : 1;
                handlePermissionChange(row._id, "can_read", newValue);
              }}
            name="can_read"
        />
      ),
    },
    {
      key: "can_update",
      label: "Update",
      render: (value, row) => (
        <Toggle
            isChecked={value === 1}
            onChange={() => {
                const newValue = value === 1 ? 0 : 1;
                handlePermissionChange(row._id, "can_update", newValue);
              }}
            name="can_update"
        />
      ),
    },
    {
      key: "can_delete",
      label: "Delete",
      render: (value, row) => (
        <Toggle
            isChecked={value === 1}
            onChange={() => {
                const newValue = value === 1 ? 0 : 1;
                handlePermissionChange(row._id, "can_delete", newValue);
              }}
            name="can_delete"
        />
      ),
    },
  ];

  const actions = [
    {
      icon: <MdDelete size={20} />,
      onClick: (row) => deleteRuleById(row._id),
      className: "bg-red-500 hover:bg-red-600",
    }
  ];

  // --- Function
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
        const ruleData = await fetchRuleList();
        
        setRules(ruleData.filter(rd => filterBy != "" ? rd.rule == filterBy : rd));
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching rule data:", error);
        toast.error("Failed to load rule data");
        setIsLoading(false);
      }
    };
    fetchData();
  }, [filterBy]);

  const handleTableSelect = async (ruleId, selectedTable) => {
    try {
      setLoading(true);
      const reqBody = {
        table_name: selectedTable,
      };
      const response = await updateRule(ruleId, reqBody);
      if (response.status === 200) {
        setRules((prevRules) =>
          prevRules.map((rule) =>
            rule._id === ruleId
              ? { ...rule, table_name: selectedTable }
              : rule
          )
        );
        toast.success("table updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update table");
      console.error("Error updating table:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = async (ruleId, permission, value) => {
    try {
      setLoading(true);
      const reqBody = {
        [permission]: value,
      };
      const response = await updateRule(ruleId, reqBody);
      if (response.status === 200) {
        setRules((prevRules) =>
          prevRules.map((rule) =>
            rule._id === ruleId
              ? { ...rule, [permission]: value }
              : rule
          )
        );
        toast.success(`${permission.replace('can_', '')} permission updated`);
      }
    } catch (error) {
      toast.error("Failed to update permission");
      console.error("Error updating permission:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRule = (rule, params) => {
    setRuleToUpdate(rule);
    modalOpen(params, true);
  };

  const deleteRuleById = async (id) => {
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
          const response = await deleteRule(id);
          if (response.status === 200) {
            toast.success("Rule access berhasil dihapus!");
            setRules((prevRules) =>
              prevRules.filter((p) => p._id !== id)
            );
          }
        } catch (error) {
          toast.error("Error:" + error);
        }
      }
    });
  };

  const handleChangeAdd = (e) => {
    const { name, value } = e.target;
    setRuleDataAdd((prevState) => ({
      ...prevState,
      [name]: name.startsWith('can_') ? Number(value) : value,
    }));
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    console.log("data add", ruleDataAdd)

    try {
      if (!ruleDataAdd.table_name) {
        alert("Please select a table name.");
        return;
      }
      
      const reqBody = {
        rule: Number(ruleDataAdd.rule),
        table_name: ruleDataAdd.table_name,
        can_create: Number(ruleDataAdd.can_create),
        can_read: Number(ruleDataAdd.can_read),
        can_update: Number(ruleDataAdd.can_update),
        can_delete: Number(ruleDataAdd.can_delete),
      };
      
      const response = await addRule(reqBody);
      if (response.status === 201) {
        modalOpen("add", false);
        toast.success("Rule access berhasil ditambahkan!");
        setRuleDataAdd({
          rule: 0,
          table_name: "",
          can_create: 0,
          can_read: 0,
          can_update: 0,
          can_delete: 0
        });
        setRules((prevRules) => [...prevRules, response.data]);
      } else {
        toast.error("GAGAL: " + response.error);
      }
    } catch (error) {
      console.error("Error adding Rule Access:", error);
      toast.error("Failed to add rule access");
    }
  };

  const handleChangeUpdate = (e) => {
    const { name, value } = e.target;
    setRuleDataAdd((prevState) => ({
      ...prevState,
      [name]: name.startsWith('can_') ? Number(value) : value,
    }));
  };

  const getRuleLabel = (ruleValue) => {
    const option = ruleOptions.find(opt => opt.value === ruleValue);
    console.log("rule", option)
    return option ? option.label : 'Unknown';
  };

  const filteredRuleList = rules.filter(
    (rule) =>
      rule.table_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getRuleLabel(rule.rule).toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading === true) {
    return <Loading />;
  }

  return (
    <div className="w-full h-screen pt-16 relative">
      <Header
        title="Rule Access Management"
        subtitle="Management of table and rule access permissions"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        modalOpen={modalOpen}
        isSearch={true}
        isAdd={true}
      />

      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          <div>
          <select
              className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent shadow-sm"
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
            >
              <option value="">All</option>
              <option value="1">Superadmin</option>
              <option value="2">Admin</option>
              <option value="3">Manager</option>
              <option value="4">Cashier</option>
              <option value="5">Costumer</option>
            </select>
            {filteredRuleList.length === 0 ? (
              <h1>Data rule access tidak ditemukan!</h1>
            ) : (
              <>
                <Table
                  fileName="Rule Access Data"
                  ExportHeaderTable={ExportHeaderTable}
                  columns={HeaderTable}
                  data={filteredRuleList}
                  actions={actions}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => modalOpen("add", false)}
        title="Tambah Rule Access"
        width="large"
      >
        <form onSubmit={handleSubmitAdd}>
        <p className="font-semibold mt-4 mb-2">Rule</p>
          <Select
            id="rule"
            className="basic-single"
            options={ruleOptions}
            value={
              ruleOptions.find((opt) => opt.value === ruleDataAdd.rule) || null
            }
            onChange={(selectedOption) =>
              setRuleDataAdd((prevState) => ({
                ...prevState,
                rule: selectedOption ? selectedOption.value : 0,
              }))
            }
            isSearchable
            required
            placeholder="Select Rule..."
            noOptionsMessage={() => "No rules available"}
          />
          <p className="font-semibold mt-4 mb-2">Table Name</p>
          <Select
            id="table_name"
            className="basic-single"
            options={tableList.map((table) => ({
                label: table.name, 
                value: table.name
            }))} // Konversi objek agar react-select bisa membaca
            value={
                tableList
                .map((table) => ({ label: table.name, value: table.name })) // Konversi format yang sama
                .find((option) => option.value === ruleDataAdd.table_name) || null
            }
            onChange={(selectedOption) =>
                setRuleDataAdd((prevState) => ({
                ...prevState,
                table_name: selectedOption ? selectedOption.value : "",
                }))
            }
            isSearchable
            required
            placeholder="Select Table..."
            noOptionsMessage={() => "No tables available"}
            />



          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
            <Toggle
                isChecked={ruleDataAdd.can_create === 1}
                onChange={handleChangeAdd}
                label="Create Permission"
                name="can_create"
                />
            </div>

            <div>
            <Toggle
                isChecked={ruleDataAdd.can_read === 1}
                onChange={handleChangeAdd}
                label="Read Permission"
                name="can_read"
                />
            </div>

            <div>
            <Toggle
                isChecked={ruleDataAdd.can_update === 1}
                onChange={handleChangeAdd}
                label="Update Permission"
                name="can_update"
                />
            </div>

            <div>
            <Toggle
                isChecked={ruleDataAdd.can_delete === 1}
                onChange={handleChangeAdd}
                label="Delete Permission"
                name="can_delete"
                />
            </div>
          </div>

          <div className="flex justify-end mt-5">
            <CloseButton onClick={() => modalOpen("add", false)} />
            <SubmitButton />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RuleAccessData;