import React, { useEffect, useState } from "react";

// Icon
import { IoSearchOutline } from "react-icons/io5";
import { LiaCloudUploadAltSolid } from "react-icons/lia";
import { MdDelete } from "react-icons/md";
import { FaRegEdit, FaInfoCircle, FaImage } from "react-icons/fa";
// Components
import { Modal } from "@/components/Modal";
import { fetchTypeList } from "@/libs/fetching/type";
import { uploadImageCompress } from "@/libs/fetching/upload-service";
import {
  fetchCompanyList,
  updateCompany,
  addCompany,
  deleteCompany,
} from "@/libs/fetching/company";
import { validatePhoneNumber } from "@/utils/validatePhoneNumber";

// Package
import ReactPaginate from "react-paginate";
import Select from "react-select";
import Swal from "sweetalert2";
import Image from "next/image";
import MapPicker from "@/components/MapPicker";

const CompanyData = () => {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companyToUpdate, setCompanyToUpdate] = useState(null); // Untuk menyimpan produk yang akan diupdate
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); // Untuk mengontrol tampilan modal update
  const [loading, setLoading] = useState(false); // Untuk loading saat update status
  const [typeList, setTypeList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenu, setOpenMenu] = useState("Info");

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
        setIsLoading(false);
      };
      const get_company_list = async () => {
        const data_company = await fetchCompanyList();
        setCompanies(data_company);
        setIsLoading(false);
      };
      get_type_list();
      get_company_list();
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
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    });

    if (result.isConfirmed) {
      try {
        const response = await deleteCompany(id);

        if (response.status === 200) {
          Swal.fire("Berhasil", "Company berhasil dihapus!", "success");
          setCompanies((prevCompanys) =>
            prevCompanys.filter((p) => p._id !== id)
          );
        }
      } catch (error) {
        console.error("Gagal menghapus Company:", error.message);
        Swal.fire("Gagal", "Company tidak dapat dihapus!", "error");
      }
    }
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
        return Swal.fire("Gagal", validation.message, "error");
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
        Swal.fire("Berhasil", "Company berhasil ditambahkan!", "success");
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
        Swal.fire("Gagal", response.error, "error");
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
          return Swal.fire("Gagal", validation.message, "error");
        }
      }

      const response = await updateCompany(companiesDataUpdate.id, reqBody);

      if (response.status == 200) {
        modalOpen("update", false);
        Swal.fire("Berhasil", "Company berhasil diupdate!", "success");

        setCompanies((prevCompanies) =>
          prevCompanies.map((companies) =>
            companies._id === companiesDataUpdate.id ? response.data : companies
          )
        );
      } else {
        Swal.fire("Error", response.error, "error");
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

  if (isLoading) {
    return (
      <div className="w-full h-screen pt-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen pt-16">
      <div className="justify-between w-full bg-white shadow-lg p-4">
        <div className="flex flex-row justify-between">
          <div className="flex flex-col">
            <p className="text-2xl font-bold">Daftar Perusahaan</p>
            <p>Detail Daftar Perusahaan</p>
          </div>
          <div className="relative mt-2 flex flex-row space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari perusahaan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 pr-4 py-2 border border-gray-300 rounded-md w-full max-w-xs bg-white"
              />
              <IoSearchOutline className="absolute left-2 top-2.5 text-xl text-gray-500" />
            </div>
          </div>
        </div>
        <div className="flex flex-row justify-end mt-8">
          <div>
            <button className="addBtn" onClick={() => modalOpen("add", true)}>
              + Tambah Company
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          <div>
            {filteredCompanyList.length === 0 ? (
              <h1>Data produk tidak ditemukan!</h1>
            ) : (
              <>
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
                            {/* Tambahkan opsi lain jika diperlukan di masa depan */}
                          </select>
                        </td>
                        <td>
                          <button
                            className="iconBtn iconDangerBtn"
                            onClick={() => deleteCompanyById(company._id)}
                          >
                            <MdDelete />
                          </button>
                          <button
                            className="iconBtn iconInfoBtn"
                            onClick={() =>
                              handleUpdateCompany(company, "update")
                            }
                          >
                            <FaInfoCircle />
                          </button>
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

      {isModalOpen && (
        <Modal
          onClose={() => modalOpen("add", false)}
          title={"Tambah Perusahaan"}
        >
          <form onSubmit={handleSubmitAdd}>
            <p className="font-semibold mt-4">Logo Perusahaan</p>
            <div className="upload-container">
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
            </div>
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
              <button
                type="button"
                className="closeBtn"
                onClick={() => modalOpen("add", false)}
              >
                Batal
              </button>
              <button type="submit" className="submitBtn">
                Tambah
              </button>
            </div>
          </form>
        </Modal>
      )}
      {isUpdateModalOpen && (
        <Modal
          onClose={() => modalOpen("update", false)}
          title={`Edit Perusahaan - ${openMenu}`}
        >
          <div className="flex flex-row mb-5">
            <button
              className={`${
                openMenu == "Info" ? "addBtn mr-2" : "closeBtn"
              } w-12 h-12 flex items-center justify-center`}
              onClick={() => setOpenMenu("Info")}
            >
              <FaRegEdit className="text-2xl" />
            </button>
            <button
              className={`${
                openMenu == "Header" ? "addBtn mr-2" : "closeBtn"
              } w-12 h-12 flex items-center justify-center`}
              onClick={() => setOpenMenu("Header")}
            >
              <FaImage />
            </button>
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
                    <p className="font-semibold mt-4 mb-2">
                      Address Perusahaan
                    </p>
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
                      <button
                        type="button"
                        className="closeBtn"
                        onClick={() => modalOpen("update", false)}
                      >
                        Batal
                      </button>
                      <button type="submit" className="submitBtn">
                        Simpan
                      </button>
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
                              <p className="text-sm text-[#FDDC05]">
                                New Image
                              </p>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                    <div className="flex justify-end mt-5">
                      <button
                        type="button"
                        className="closeBtn"
                        onClick={() => modalOpen("update", false)}
                      >
                        Batal
                      </button>
                      <button type="submit" className="submitBtn">
                        Edit
                      </button>
                    </div>
                  </form>
                );
              default:
                return null;
            }
          })()}
        </Modal>
      )}
    </div>
  );
};

export default CompanyData;
