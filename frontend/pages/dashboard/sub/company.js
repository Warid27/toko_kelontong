import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";

// Icons
import { LiaCloudUploadAltSolid } from "react-icons/lia";
import { MdDelete } from "react-icons/md";
import { FaRegEdit, FaInfoCircle, FaImage } from "react-icons/fa";

// Components
const ExportData = dynamic(() => import("@/components/ExportData"), {
  ssr: false,
  loading: () => <span>Loading...</span>, // Indikator saat memuat
});

import { SubmitButton, CloseButton, AddButton } from "@/components/form/button";

import { SubmitMenu, CloseMenu, AddMenu } from "@/components/form/menu";

import ImageUpload from "@/components/form/uploadImage";

import {
  SubmitIcon,
  CloseIcon,
  AddIcon,
  DangerIcon,
} from "@/components/form/icon";

import { Modal } from "@/components/Modal";
import Header from "@/components/section/header";
import Loading from "@/components/loading";
import MapPicker from "@/components/MapPicker";

// Libraries
import { fetchTypeList } from "@/libs/fetching/type";
import { uploadImageCompress } from "@/libs/fetching/upload-service";
import {
  fetchCompanyList,
  updateCompany,
  addCompany,
  deleteCompany,
} from "@/libs/fetching/company";
import { validatePhoneNumber } from "@/utils/validatePhoneNumber";

// Packages
import { toast } from "react-toastify";
import ReactPaginate from "react-paginate";
import Select from "react-select";
import Swal from "sweetalert2";

const CompanyData = () => {
  const [companies, setCompanies] = useState([]);
  const [typeList, setTypeList] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false); // Untuk loading saat update status

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); // Untuk mengontrol tampilan modal update
  const [companyToUpdate, setCompanyToUpdate] = useState(null); // Untuk menyimpan produk yang akan diupdate

  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenu, setOpenMenu] = useState("Info");

  const itemsPerPage = 10;

  const [companiesDataAdd, setCompaniesDataAdd] = useState({
    name: "",
    address: "",
    id_type: "",
    status: "",
    phone: "",
    email: "",
    logo: "",
    header: "",
  });

  const [companiesDataUpdate, setCompaniesDataUpdate] = useState({
    id: "",
    name: "",
    address: "",
    id_type: "",
    status: "",
    phone: "",
    email: "",
    logo: "",
    header: "",
  });

  const columns = [
    { label: "No", key: "no" },
    { label: "Nama Perusahaan", key: "name" },
    { label: "Alamat", key: "address" },
    { label: "Status", key: "status" },
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
    const fetching_requirement = async () => {
      const get_type_list = async () => {
        const data_type = await fetchTypeList();
        setTypeList(data_type);
      };
      const get_company_list = async () => {
        const data_company = await fetchCompanyList();
        setCompanies(data_company);
      };
      get_type_list();
      get_company_list();
      setIsLoading(false);
    };
    fetching_requirement();
  }, []);

  const handleStatusSelect = async (companyId, selectedStatus) => {
    try {
      setLoading(true);
      const reqBody = {
        status: selectedStatus,
      };
      const response = await updateCompany(companyId, reqBody);
      console.log("RESP", response);
      setCompanies((prevCompanies) =>
        prevCompanies.map((company) =>
          company._id === companyId
            ? { ...company, status: selectedStatus }
            : company
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCompany = (company, params) => {
    setCompanyToUpdate(company); // Menyimpan produk yang dipilih
    modalOpen(params, true);
  };

  const deleteCompanyById = async (id) => {
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
          const response = await deleteCompany(id);
          if (response.status === 200) {
            toast.success("Company berhasil dihapus!");
            setCompanies((prevCompanies) =>
              prevCompanies.filter((p) => p._id !== id)
            );
          }
        } catch (error) {
          toast.error("Error:", error);
        }
      }
    });
  };

  const handleChangeAdd = (e) => {
    const { name, value } = e.target;
    setCompaniesDataAdd((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();

    try {
      // Ensure all required fields are filled
      console.log("ini data adede", companiesDataAdd);
      if (
        !companiesDataAdd.name ||
        !companiesDataAdd.address ||
        !companiesDataAdd.phone ||
        !companiesDataAdd.email
      ) {
        alert("Please fill all required fields.");
        return;
      }
      const validation = validatePhoneNumber(companiesDataAdd.phone);
      if (!validation.isValid) {
        return toast.error("GAGAL:", validation.message);
      }

      // Send product data to the backend
      const reqBody = {
        name: companiesDataAdd.name,
        address: companiesDataAdd.address,
        id_type: companiesDataAdd.id_type,
        status: 1,
        phone: companiesDataAdd.phone,
        email: companiesDataAdd.email,
      };
      const response = await addCompany(reqBody);
      if (response.status == 201) {
        modalOpen("add", false);
        toast.success("Company berhasil ditambahkan!");

        setCompaniesDataAdd({
          name: "",
          address: "",
          id_type: "",
          status: "",
          phone: "",
          email: "",
          logo: "",
          header: "",
        });
        setCompanies((prevCompanies) => [...prevCompanies, response.data]);
      } else {
        toast.error("GAGAL:", response.error);
      }
    } catch (error) {
      console.error("Error adding Company:", error);
    }
  };

  useEffect(() => {
    if (companyToUpdate) {
      setCompaniesDataUpdate({
        id: companyToUpdate._id || "",
        name: companyToUpdate.name || "", // Menyimpan URL gambar lama
        address: companyToUpdate.address || "",
        id_type: companyToUpdate.id_type || "",
        phone: companyToUpdate.phone || "",
        email: companyToUpdate.email || "",
        logo: companyToUpdate.logo || "",
        header: companyToUpdate.header || "",
      });
    }
  }, [companyToUpdate]);

  const handleChangeUpdate = (e) => {
    const { name, value } = e.target;
    setCompaniesDataUpdate((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmitUpdate = async (e, params) => {
    e.preventDefault();

    const formData = new FormData();
    for (const key in companiesDataUpdate) {
      formData.append(key, companiesDataUpdate[key]);
    }

    try {
      const reqBody = {
        name: companiesDataUpdate.name,
        address: companiesDataUpdate.address,
        id_type: companiesDataUpdate.id_type,
        phone: companiesDataUpdate.phone,
        email: companiesDataUpdate.email,
        logo: companiesDataUpdate.logo,
        header: companiesDataUpdate.header,
      };

      if (params != "image") {
        const validation = validatePhoneNumber(companiesDataUpdate.phone);
        if (!validation.isValid) {
          return toast.error("Gagal:", validation.message);
        }
      }

      const response = await updateCompany(companiesDataUpdate.id, reqBody);

      if (response.status == 200) {
        modalOpen("update", false);
        toast.success("Company berhasil diupdate!");

        setCompanies((prevCompanies) =>
          prevCompanies.map((companies) =>
            companies._id === companiesDataUpdate.id ? response.data : companies
          )
        );
      } else {
        toast.error("Error:", response.error);
      }
    } catch (error) {
      console.error("Error updating Company:", error);
    }
  };

  const statusLabels = {
    0: "active",
    1: "inactive",
    2: "bankrupt",
  };

  const filteredCompanyList = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      statusLabels[company.status]
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const startIndex = currentPage * itemsPerPage;

  const selectedData = filteredCompanyList.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const dataForExport = selectedData.map((company, index) => ({
    no: index + 1,
    name: company.name,
    address: company.address,
    status:
      company.status === 0
        ? "Active"
        : company.status === 1
        ? "Inactive"
        : "Bankrupt",
  }));

  // UPLOADS
  const handleImageChange = async (e, params) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      let pathPrefix = "";
      switch (params) {
        case "add":
        case "update":
          pathPrefix = "company/logo";
          break;
        case "header":
          pathPrefix = "company/header";
          break;
        default:
          console.error(`Invalid params value: ${params}`);
          return;
      }

      const response = await uploadImageCompress(file, params, pathPrefix);
      const uploadedImageUrl = response.data.metadata.shortenedUrl;
      if (response.status == 201) {
        // 🔹 Update state based on `params`
        if (params === "add" || params === "update") {
          const stateUpdater =
            params === "add" ? setCompaniesDataAdd : setCompaniesDataUpdate;
          stateUpdater((prevState) => ({
            ...prevState,
            logo: uploadedImageUrl,
          }));
        } else if (["header"].includes(params)) {
          setCompaniesDataUpdate((prevState) => ({
            ...prevState,
            [params]: uploadedImageUrl,
          }));
        }

        console.log(`✅ Image uploaded successfully: ${uploadedImageUrl}`);
      } else {
        console.log(`❌ Upload Failed: ${response.error}`);
      }
    } catch (error) {
      console.error("❌ Compression or upload failed:", error);
    }
  };

  if (isLoading === true) {
    return <Loading />;
  }

  return (
    <div className="w-full h-screen pt-16 relative">
      <Header
        title="Daftar Perusahaan"
        subtitle="Detail Daftar Perusahaan"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        modalOpen={modalOpen}
        isSearch={true}
        isAdd={true}
      />

      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          <div>
            {filteredCompanyList.length === 0 ? (
              <h1>Data perusahaan tidak ditemukan!</h1>
            ) : (
              <>
                <h1 className="flex flex-row gap-3">
                  <span>Export To:</span>
                  <ExportData
                    data={dataForExport}
                    columns={columns}
                    fileName="Perusahaan"
                  />
                </h1>
                <table className="table w-full border border-gray-300">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Nama Perusahaan</th>
                      <th>Alamat</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedData.map((company, index) => (
                      <tr key={company._id}>
                        <td>{startIndex + index + 1}</td>
                        <td>{company.name}</td>
                        <td>{company.address}</td>
                        <td>
                          <select
                            className="select bg-white"
                            value={company.status}
                            onChange={(e) =>
                              handleStatusSelect(
                                company._id,
                                Number(e.target.value)
                              )
                            }
                          >
                            <option value={0}>Active</option>
                            <option value={1}>Inactive</option>
                            <option value={2}>Bankrupt</option>
                          </select>
                        </td>
                        <td>
                          <div className="flex flex-row items-center justify-center gap-1">
                            <DangerIcon
                              onClick={() => deleteCompanyById(company._id)}
                              content={<MdDelete />}
                            />
                            <SubmitIcon
                              onClick={() =>
                                handleUpdateCompany(company, "update")
                              }
                              content={<FaInfoCircle />}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <ReactPaginate
                  previousLabel={"← Prev"}
                  nextLabel={"Next →"}
                  pageCount={Math.ceil(selectedData.length / itemsPerPage)}
                  onPageChange={({ selected }) => setCurrentPage(selected)}
                  containerClassName={"flex gap-2 justify-center mt-4"}
                  pageLinkClassName={"border px-3 py-1"}
                  previousLinkClassName={"border px-3 py-1"}
                  nextLinkClassName={"border px-3 py-1"}
                  activeClassName={"bg-blue-500 text-white"}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => modalOpen("add", false)}
        title="Tambah Perusahaan"
        width="large"
      >
        <form onSubmit={handleSubmitAdd}>
          <p className="font-semibold mt-4">Logo Perusahaan</p>
          {/* <div className="upload-container">
            <label className="upload-label">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, "add")}
                style={{ display: "none" }}
              />
              <div className="upload-content cursor-pointer w-fit">
                {companiesDataAdd.logo ? (
                  <Image
                    src={companiesDataAdd.logo}
                    alt="Uploaded"
                    className="uploaded-image"
                    width={80}
                    height={80}
                  />
                ) : (
                  <div className="border-2 border-slate-500 w-28 rounded-lg p-3 flex flex-col items-center justify-center">
                    <div className="icon-container flex flex-col items-center">
                      <LiaCloudUploadAltSolid className="text-5xl text-[#FDDC05]" />
                      <p className="text-sm text-[#FDDC05]">New Image</p>
                    </div>
                  </div>
                )}
              </div>
            </label>
          </div> */}
          <ImageUpload
            image={companiesDataAdd.logo}
            onImageChange={handleImageChange}
            params="add"
            name="_id"
            value={companiesDataAdd._id}
            onValueChange={handleChangeUpdate}
          />
          <p className="font-semibold mt-4">Nama Perusahaan</p>
          <input
            type="text"
            name="name"
            value={companiesDataAdd.name}
            onChange={handleChangeAdd}
            className="border rounded-md p-2 w-full bg-white"
            required
          />
          <p className="font-semibold mt-4">Address</p>
          <MapPicker name="address" onChange={handleChangeAdd} />
          <p className="font-semibold mt-4 mb-2">Type</p>
          <Select
            id="type"
            className="basic-single"
            options={typeList.map((c) => ({
              value: c._id,
              label: c.type,
            }))}
            value={
              typeList
                .map((c) => ({ value: c._id, label: c.type }))
                .find((opt) => opt.value === companiesDataAdd.id_type) || null
            }
            onChange={(selectedOption) =>
              setCompaniesDataAdd((prevState) => ({
                ...prevState,
                id_type: selectedOption ? selectedOption.value : "",
              }))
            }
            isSearchable
            required
            placeholder="Pilih Type..."
            noOptionsMessage={() => "No Type available"}
          />
          <p className="font-semibold mt-4 mb-2">Phone</p>
          <input
            type="text"
            name="phone"
            value={companiesDataAdd.phone}
            onChange={handleChangeAdd}
            className="border rounded-md p-2 w-full bg-white"
            required
          />
          <p className="font-semibold mt-4 mb-2">Email</p>
          <input
            type="email"
            name="email"
            value={companiesDataAdd.email}
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
        width="large"
        isOpen={isUpdateModalOpen}
        onClose={() => modalOpen("update", false)}
        title={`Edit Perusahaan - ${openMenu}`}
      >
        <div className="flex flex-row mb-5">
          <AddMenu
            onClick={() => setOpenMenu("Info")}
            content={<FaRegEdit />}
            isActive={openMenu === "Info"}
          />
          <AddMenu
            onClick={() => setOpenMenu("Header")}
            content={<FaImage />}
            isActive={openMenu === "Header"}
          />
        </div>
        {(() => {
          switch (openMenu) {
            case "Info":
              return (
                <form onSubmit={handleSubmitUpdate}>
                  <p className="font-semibold mt-4">Logo Perusahaan</p>
                  <div className="upload-container">
                    {console.log("DATA", companiesDataUpdate)}
                    <label className="upload-label">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, "update")}
                        style={{ display: "none" }}
                      />
                      <div className="upload-content cursor-pointer w-fit">
                        {companiesDataUpdate.logo ? (
                          <Image
                            src={companiesDataUpdate.logo}
                            alt="Uploaded"
                            className="uploaded-image"
                            width={80}
                            height={80}
                          />
                        ) : (
                          <div className="border-2 border-slate-500 w-28 rounded-lg p-3 flex flex-col items-center justify-center">
                            <div className="icon-container flex flex-col items-center">
                              <LiaCloudUploadAltSolid className="text-5xl text-[#FDDC05]" />
                              <p className="text-sm text-[#FDDC05]">
                                New Image
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                  <p className="font-semibold mt-4">Nama Perusahaan</p>
                  <input
                    type="text"
                    name="name"
                    value={companiesDataUpdate.name}
                    onChange={handleChangeUpdate}
                    className="border rounded-md p-2 w-full bg-white"
                    required
                  />
                  <p className="font-semibold mt-4 mb-2">Address Perusahaan</p>
                  {/* <input
                      type="text"
                      name="stock"
                      value={companiesDataUpdate.address}
                      onChange={handleChangeUpdate}
                      className="border rounded-md p-2 w-full bg-white"
                      required
                    /> */}
                  <MapPicker
                    name="address"
                    value={companiesDataUpdate.address}
                    onChange={handleChangeUpdate}
                  />
                  <p className="font-semibold mt-4 mb-2">Type</p>
                  <Select
                    id="type"
                    className="basic-single"
                    options={typeList.map((c) => ({
                      value: c._id,
                      label: c.type,
                    }))}
                    value={
                      typeList
                        .map((c) => ({ value: c._id, label: c.type }))
                        .find(
                          (opt) => opt.value === companiesDataUpdate.id_type
                        ) || null
                    }
                    onChange={(selectedOption) =>
                      setCompaniesDataAdd((prevState) => ({
                        ...prevState,
                        id_type: selectedOption ? selectedOption.value : "",
                      }))
                    }
                    isSearchable
                    required
                    placeholder="Pilih Type..."
                    noOptionsMessage={() => "No Type available"}
                  />
                  <p className="font-semibold mt-4 mb-2">Phone</p>
                  <input
                    type="text"
                    name="phone"
                    value={companiesDataUpdate.phone}
                    onChange={handleChangeUpdate}
                    className="border rounded-md p-2 w-full bg-white"
                    required
                  />
                  <p className="font-semibold mt-4 mb-2">Email</p>
                  <input
                    type="text"
                    name="email"
                    value={companiesDataUpdate.email}
                    onChange={handleChangeUpdate}
                    className="border rounded-md p-2 w-full bg-white"
                    required
                  />
                  <div className="flex justify-end mt-4">
                    <CloseButton onClick={() => modalOpen("update", false)} />
                    <SubmitButton />
                  </div>
                </form>
              );
            case "Header":
              return (
                <form onSubmit={(e) => handleSubmitUpdate(e, "image")}>
                  <div className="upload-container">
                    <label className="upload-label">
                      <input
                        type="hidden"
                        name="_id"
                        value={companiesDataUpdate._id}
                        onChange={handleChangeUpdate}
                        className="border rounded-md p-2 w-full bg-white"
                        required
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, "header")}
                        style={{ display: "none" }}
                      />
                      <div className="upload-content cursor-pointer min-h-48 max-h-48 flex relative overflow-hidden">
                        {companiesDataUpdate.header ? (
                          <Image
                            src={companiesDataUpdate.header}
                            alt="Uploaded Image"
                            width={100}
                            height={200}
                            className="uploaded-image object-cover w-full"
                          />
                        ) : (
                          <div className="w-full border-2 border-slate-500 rounded-lg p-3 flex flex-col items-center justify-center">
                            <LiaCloudUploadAltSolid className="text-5xl text-[#FDDC05]" />
                            <p className="text-sm text-[#FDDC05]">New Image</p>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                  <div className="flex justify-end mt-5">
                    <CloseButton onClick={() => modalOpen("update", false)} />
                    <SubmitButton />
                  </div>
                </form>
              );
            default:
              return null;
          }
        })()}
      </Modal>
    </div>
  );
};

export default CompanyData;
