import React, { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import Image from "next/image";
import { MdKeyboardArrowDown } from "react-icons/md";
import client from "@/libs/axios";
import Swal from "sweetalert2"; // Import sweetalert2
import { MdDelete } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import { Modal } from "@/components/Modal";
import { LiaCloudUploadAltSolid } from "react-icons/lia";
import axios from "axios";

const Menu = () => {
  const [Menu, setMenu] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [MenuToUpdate, setMenuToUpdate] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [store, setStore] = useState([]);
  const [company, setCompany] = useState([]);
  const [extras, setExtras] = useState([]);
  const [size, setSize] = useState([]);
  const [categoryProduct, setcategoryProduct] = useState([]);
  const [itemCampaign, setItemCampaign] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const status = [
    { id: 0, name: "Active" },
    { id: 1, name: "Non-Active" },
    { id: 2, name: "Pending" },
  ];

  const [MenuData, setMenuData] = useState({
    id: "",
    name_product: "",
    stock: "",
    sell_price: "",
    image: "",
    buy_price: "",
    product_code: "",
    barcode: "",
    deskripsi: "",
    status: "",

    id_store: "",
    id_item_campaign: "",
    id_company: "",
    id_extras: "",
    id_size: "",
    id_category_product: "",
  });

  console.log("Current MenuData before submit:", MenuData);

  const [storeData, SetStoreData] = useState({
    id_store: "",
  });
  const [companyData, SetCompanyData] = useState({
    id_company: "",
  });
  const [extrasData, SetExtrasData] = useState({
    id_extras: "",
  });
  const [sizeData, SetSizeData] = useState({
    id_size: "",
  });
  const [categoryProductData, SetCategoryProductData] = useState({
    id_category_product: "",
  });
  const [itemCampaignData, SetItemCampaignData] = useState({
    id_item_campaign: "",
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await client.get(
          "/api/product",

          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // API mengembalikan status dalam string ("active"/"inactive"), tidak perlu dikonversi ke integer
        setMenu(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching Menu:", error);
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, []);
  useEffect(() => {
    const fetchStore = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await client.get(
          "/api/store",

          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // API mengembalikan status dalam string ("active"/"inactive"), tidak perlu dikonversi ke integer
        setStore(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching Menu:", error);
        setIsLoading(false);
      }
    };

    fetchStore();
  }, []);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await client.get(
          "/api/company",

          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // API mengembalikan status dalam string ("active"/"inactive"), tidak perlu dikonversi ke integer
        setCompany(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching Menu:", error);
        setIsLoading(false);
      }
    };

    fetchCompany();
  }, []);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await client.get(
          "/api/item_campaign",

          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // API mengembalikan status dalam string ("active"/"inactive"), tidak perlu dikonversi ke integer
        setItemCampaign(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching Menu:", error);
        setIsLoading(false);
      }
    };

    fetchCampaign();
  }, []);

  useEffect(() => {
    const fetchExtras = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await client.get(
          "/api/extras",

          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // API mengembalikan status dalam string ("active"/"inactive"), tidak perlu dikonversi ke integer
        setExtras(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching Menu:", error);
        setIsLoading(false);
      }
    };

    fetchExtras();
  }, []);

  useEffect(() => {
    const fetchSize = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await client.get(
          "/api/size",

          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // API mengembalikan status dalam string ("active"/"inactive"), tidak perlu dikonversi ke integer
        setSize(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching Menu:", error);
        setIsLoading(false);
      }
    };

    fetchSize();
  }, []);
  useEffect(() => {
    const fetchCategoryProduct = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await client.get(
          "/api/category_product",

          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // API mengembalikan status dalam string ("active"/"inactive"), tidak perlu dikonversi ke integer
        setcategoryProduct(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching Menu:", error);
        setIsLoading(false);
      }
    };

    fetchCategoryProduct();
  }, []);

  useEffect(() => {
    if (MenuToUpdate) {
      SetStoreData({
        id_store: MenuToUpdate.id_store || "",
      });
    }
  }, [MenuToUpdate]);
  useEffect(() => {
    if (MenuToUpdate) {
      SetCompanyData({
        id_company: MenuToUpdate.id_company || "",
      });
    }
  }, [MenuToUpdate]);
  useEffect(() => {
    if (MenuToUpdate) {
      SetExtrasData({
        id_extras: MenuToUpdate.id_extras || "",
      });
    }
  }, [MenuToUpdate]);
  useEffect(() => {
    if (MenuToUpdate) {
      SetSizeData({
        id_size: MenuToUpdate.id_size || "",
      });
    }
  }, [MenuToUpdate]);
  useEffect(() => {
    if (MenuToUpdate) {
      SetCategoryProductData({
        id_category_product: MenuToUpdate.id_category_product || "",
      });
    }
  }, [MenuToUpdate]);
  useEffect(() => {
    if (MenuToUpdate) {
      SetItemCampaignData({
        id_item_campaign: MenuToUpdate.id_item_campaign || "",
      });
    }
  }, [MenuToUpdate]);

  const addNewMenu = (newMenu) => {
    setMenu((prevMenu) => [...prevMenu, newMenu]);
  };

  const handleAddMenu = () => {
    setMenuData({
      id: "",
      name_product: "",
      stock: "",
      sell_price: "",
      image: "",
      buy_price: "",
      product_code: "",
      barcode: "",
      deskripsi: "",
      status: "0",

      id_store: "",
      id_item_campaign: "",
      id_company: "",
      id_extras: "",
      id_size: "",
      id_category_product: "",
    });
    setIsModalOpen(true);
  };

  const handleUpdateProduct = (Menu) => {
    setMenuData({
      id: Menu.id || "",
      name_product: Menu.name_product || "",
      stock: Menu.stock || "",
      sell_price: Menu.sell_price || "",
      image:
        "https://akcdn.detik.net.id/community/media/visual/2022/02/02/foto-lucu.jpeg?w=770&q=90",
      buy_price: Menu.buy_price || "",
      product_code: Menu.product_code || "",
      barcode: Menu.barcode || "",
      deskripsi: Menu.deskripsi || "",
      id_store: Menu.id_store || "",
      id_item_campaign: Menu.id_item_campaign || "",
      id_company: Menu.id_company || "",
      id_extras: Menu.id_extras || "",
      id_size: Menu.id_size || "",
      id_category_product: Menu.id_category_product || "",
    });

    SetStoreData({
      id_store: Menu.id_store || "",
    });
    SetCompanyData({
      id_company: Menu.id_company || "",
    });
    SetExtrasData({
      id_order: Menu.id_order || "",
    });
    SetSizeData({
      id_size: Menu.id_size || "",
    });
    SetCategoryProductData({
      id_category_product: Menu.id_category_product || "",
    });
    SetItemCampaignData({
      id_item_campaign: Menu.id_item_campaign || "",
    });

    setIsUpdateModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMenuData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const handleChangeStore = (event) => {
    const { value } = event.target;
    SetStoreData((prevData) => ({
      ...prevData,
      id_store: value,
    }));
  };
  const handleItemCampaign = (event) => {
    const { value } = event.target;
    SetItemCampaignData((prevData) => ({
      ...prevData,
      id_item_campaign: value,
    }));
  };
  const handleChangeCompany = (event) => {
    const { value } = event.target;
    SetCompanyData((prevData) => ({
      ...prevData,
      id_company: value,
    }));
  };
  const handleChangeExtras = (event) => {
    const { value } = event.target;
    SetExtrasData((prevData) => ({
      ...prevData,
      id_extras: value,
    }));
  };
  const handleChangeSIze = (event) => {
    const { value } = event.target;
    SetSizeData((prevData) => ({
      ...prevData,
      id_size: value,
    }));
  };
  const handleCategoryProduct = (event) => {
    const { value } = event.target;
    SetCategoryProductData((prevData) => ({
      ...prevData,
      id_category_product: value,
    }));
  };

  const handleStatus = async (productID, newStatus) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await client.put(
        `/api/product/${productID}`,
        {
          status: newStatus, // Kirim status baru
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Response from API:", response.data);

      setMenu((prevItem_campaign) =>
        prevItem_campaign.map((item) =>
          item.id === productID ? { ...item, status: newStatus } : item
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    const username = localStorage.getItem("username");
    const id_user = localStorage.getItem("id");

    formData.append("file", file);
    formData.append("username", username);
    formData.append("id_user", id_user);

    try {
      const token = localStorage.getItem("token");
      const response = await client.post("/upload", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Upload Response:", response.data); // Cek hasil dari API upload

      // Ambil URL gambar dari metadata
      const uploadedImageUrl = response.data.metadata.fileUrl;
      if (!uploadedImageUrl) {
        console.error("Error: API tidak mengembalikan URL gambar!");
        return;
      }

      const longUrl = response.data.metadata.fileUrl;

      setMenuData((prevState) => ({
        ...prevState,
        image: longUrl,
      }));

      console.log("Updated MenuData:", shortUrl); // Pastikan URL gambar tersimpan
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleImageChangeUpdate = async (e) => {
    const file = e.target.files[0];

    if (file) {
      const formData = new FormData();
      const companyName = localStorage.getItem("username");
      const id = localStorage.getItem("id");

      console.log(id);

      formData.append("username", companyName);
      formData.append("id_user", id);
      formData.append("file", file);

      try {
        const token = localStorage.getItem("token");
        const response = await client.post("/upload", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Ambil URL dari respons API
        const uploadedImageUrl = response.data.metadata.fileUrl;

        setMenuToUpdate((prevState) => ({
          ...prevState,
          image: uploadedImageUrl, // Simpan URL, bukan File
        }));

        console.log("Image uploaded successfully:", uploadedImageUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await client.post(
        "/api/product",
        {
          name_product: MenuData.name_product || "",
          stock: MenuData.stock || "",
          sell_price: parseFloat(MenuData.sell_price || "0"),
          image: MenuData.image || "",
          buy_price: parseFloat(MenuData.buy_price || "0"),
          product_code: MenuData.product_code || "",
          barcode: parseInt(MenuData.barcode || "0", 10),
          deskripsi: MenuData.deskripsi || "",

          id_store: parseInt(storeData.id_store || "0", 10),
          id_item_campaign: parseInt(
            itemCampaignData.id_item_campaign || "0",
            10
          ),
          id_company: parseInt(companyData.id_company || "0", 10),
          id_extras: parseInt(extrasData.id_extras || "0", 10),
          id_size: parseInt(sizeData.id_size || "0", 10),
          id_category_product: parseInt(
            categoryProductData.id_category_product || "0",
            10
          ),
          created_at: new Date()
            .toLocaleString("sv-SE", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
            .replace(",", ""),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Menu added:", response.data);
      Swal.fire("Menu created successfully:", response.data);

      // Tambahkan reload atau update state agar data muncul

      closeModal();
      window.location.reload();
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    for (const key in MenuData) {
      formData.append(key, MenuData[key]);
    }

    try {
      const token = localStorage.getItem("token");
      const response = await client.put(
        `/api/product/${MenuData.id}`,
        {
          name_product: MenuData.name_product || "",
          stock: MenuData.stock || "",
          sell_price: parseFloat(MenuData.sell_price || "0"),
          image: MenuData.image || null,
          buy_price: parseFloat(MenuData.buy_price || "0"),
          product_code: MenuData.product_code || "",
          barcode: parseInt(MenuData.barcode || "0", 10),
          deskripsi: MenuData.deskripsi || "",

          id_store: parseInt(storeData.id_store || "0", 10),
          id_item_campaign: parseInt(
            itemCampaignData.id_item_campaign || "0",
            10
          ),
          id_company: parseInt(companyData.id_company || "0", 10),
          id_extras: parseInt(extrasData.id_extras || "0", 10),
          id_size: parseInt(sizeData.id_size || "0", 10),
          id_category_product: parseInt(
            categoryProductData.id_category_product || "0",
            10
          ),
          created_at: new Date()
            .toLocaleString("sv-SE", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
            .replace(",", ""),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Menu updated successfully:", response.data);
      Swal.fire("Menu updated successfully:", response.data);
      closeModal();
      window.location.reload();
    } catch (error) {
      console.error("Error updating Menu:", error);
      Swal.fire("Error mengupdate data:", error);
    }
  };

  const deleteMenuById = async (id) => {
    const result = await Swal.fire({
      title: "apakah kamu yakin?",
      text: "anda akan menghapus produk ini!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
    });
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        const response = await client.delete(`/api/product/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          Swal.fire("Berhasil", "Menu berhasil dihapus!", "success");
          setMenu((prevMenu) => prevMenu.filter((p) => p.id !== id));
        }
      } catch (error) {
        console.error("Gagal menghapus Menu:", error.message);
        Swal.fire("Gagal", "Menu tidak dapat dihapus!", "error");
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  const closeModalUpdate = () => {
    setIsUpdateModalOpen(false);
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
            <p className="text-2xl font-bold">Daftar Menu</p>
            <p>Detail daftar Menu</p>
          </div>
          <div className="relative mt-2 flex flex-row space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search anything here"
                className="pl-10 h-10 pr-4 py-2 border border-gray-300 rounded-md w-full max-w-xs bg-white text-black outline-none focus:ring-2 focus:ring-blue-400"
              />
              <IoSearchOutline className="absolute left-2 top-2.5 text-xl text-gray-500" />
            </div>

            <div className="avatar">
              <div className="w-10 h-10 rounded-full">
                <Image
                  src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                  alt="avatar"
                  width={40}
                  height={40}
                />
              </div>
            </div>
            <button className="button btn-ghost btn-sm rounded-lg">
              <MdKeyboardArrowDown className="text-2xl mt-1" />
            </button>
          </div>
        </div>
        <div className="flex flex-row justify-between mt-8">
          <div>
            <select className="select w-full max-w-xs bg-white border-gray-300">
              <option disabled selected>
                Best sellers
              </option>
              <option>Makanan</option>
              <option>Minuman</option>
              <option>Snack</option>
            </select>
          </div>
          <div>
            <button
              className="button bg-[#FDDC05] text-white p-2 rounded-lg font-bold"
              onClick={handleAddMenu}
            >
              + Tambah Menu
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          <div className="overflow-x-auto">
            {Menu.length === 0 ? (
              <h1>Data Menu tidak ditemukan!</h1>
            ) : (
              <table className="table w-full border border-gray-300">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Product</th>
                    <th>Image</th>
                    <th>Stock</th>
                    <th>Harga Jual</th>
                    <th>Harga Beli</th>
                    <th>Product Code</th>
                    <th>Barcode</th>
                    <th>deskripsi</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {Menu.map((Menu, index) => (
                    <tr key={Menu.id}>
                      <td>{index + 1}</td>
                      <td>{Menu.name_product}</td>
                      <td>
                        <div className="avatar">
                          <div className="mask mask-squircle h-12 w-12">
                            <Image
                              src={
                                `${Menu.image}` ||
                                "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                              }
                              alt={Menu.name_product}
                              width={48}
                              height={48}
                            />
                          </div>
                        </div>
                      </td>
                      <td>{Menu.stock}</td>
                      <td>{Menu.sell_price}</td>
                      <td>{Menu.buy_price}</td>
                      <td>{Menu.product_code}</td>
                      <td>{Menu.barcode}</td>
                      <td>{Menu.deskripsi}</td>
                      <td>
                        <select
                          name="status"
                          id="status"
                          className="border rounded-md p-2 w-full bg-white"
                          onChange={(e) => {
                            const newStatus = e.target.value; // Ambil nilai dari dropdown
                            handleStatus(Menu.id, newStatus); // Panggil fungsi untuk mengupdate status
                          }}
                          value={Menu.status} // Pastikan ini sesuai dengan status saat ini
                          required
                        >
                          <option value="">--Select Status--</option>
                          {status.map((statusOption) => (
                            <option
                              key={statusOption.id}
                              value={statusOption.id}
                            >
                              {" "}
                              {/* Ubah ke lowercase untuk konsistensi */}
                              {statusOption.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="flex space-x-4">
                        {" "}
                        {/* Beri jarak antar tombol */}
                        <button
                          className=" p-3 rounded-lg text-2xl "
                          onClick={() => deleteMenuById(Menu.id)}
                        >
                          <MdDelete />
                        </button>
                        <button
                          className=" p-3 rounded-lg text-2xl "
                          onClick={() => handleUpdateProduct(Menu)}
                        >
                          <FaRegEdit />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <Modal onClose={closeModal}>
          <div>
            <form onSubmit={handleSubmit}>
              <p className="font-bold text-2xl mb-5">Tambah Menu</p>

              <p className="font-semibold">Gambar Menu</p>
              <p className="mb-2 text-sm text-slate-500">
                Image format .jpg .jpeg .png and minimum size 300 x 300px
              </p>
              <div className="upload-container">
                <label className="upload-label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                  <div className="upload-content">
                    {MenuData.image ? (
                      <Image
                        key={MenuData.image} // Tambahkan key biar Next.js render ulang
                        src={MenuData.image}
                        alt="Uploaded"
                        className="uploaded-image"
                        width={80}
                        height={80}
                      />
                    ) : (
                      <div className="bg-[#F8FAFC] w-28 rounded-lg p-3 flex flex-col items-center justify-center">
                        <div className="icon-container flex flex-col items-center">
                          <LiaCloudUploadAltSolid className="text-5xl text-[#FDDC05]" />
                          <p className="text-sm text-[#FDDC05]">New Image</p>
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              <p className="font-semibold mt-4">Nama Product</p>
              <p className="mb-2 text-sm text-slate-500">
                Include min. 10 characters to make it more interesting
              </p>
              <input
                type="text"
                name="name_product"
                value={MenuData.name_product}
                onChange={handleChange}
                className="border rounded-md p-2 w-full bg-white"
                required
                maxLength={100}
              />

              <p className="font-semibold mt-4">Stock</p>
              <p className="mb-2 text-sm text-slate-500">
                Include min. 10 characters to make it more interesting
              </p>
              <input
                type="text"
                name="stock"
                value={MenuData.stock}
                onChange={handleChange}
                className="border rounded-md p-2 w-full bg-white"
                required
              />

              <p className="font-semibold mt-4">Harga Jual</p>
              <p className="mb-2 text-sm text-slate-500">
                Include min. 10 characters to make it more interesting
              </p>
              <input
                type="text"
                name="sell_price"
                value={MenuData.sell_price}
                onChange={handleChange}
                className="border rounded-md p-2 w-full bg-white"
                required
              />
              <p className="font-semibold mt-4">Harga Beli</p>
              <p className="mb-2 text-sm text-slate-500">
                Include min. 10 characters to make it more interesting
              </p>
              <input
                type="number"
                name="total_discount"
                value={MenuData.total_discount}
                onChange={handleChange}
                className="border rounded-md p-2 w-full bg-white"
                required
              />
              <p className="font-semibold mt-4">Product Code</p>
              <p className="mb-2 text-sm text-slate-500">
                Include min. 10 characters to make it more interesting
              </p>
              <input
                type="text"
                name="product_code"
                value={MenuData.product_code}
                onChange={handleChange}
                className="border rounded-md p-2 w-full bg-white"
                required
              />
              <p className="font-semibold mt-4">Barcode</p>
              <p className="mb-2 text-sm text-slate-500">
                Include min. 10 characters to make it more interesting
              </p>
              <input
                type="text"
                name="barcode"
                value={MenuData.barcode}
                onChange={handleChange}
                className="border rounded-md p-2 w-full bg-white"
                required
              />
              <p className="font-semibold mt-4">deskripsi</p>
              <p className="mb-2 text-sm text-slate-500">
                Include min. 10 characters to make it more interesting
              </p>
              <textarea
                name="deskripsi"
                value={MenuData.deskripsi}
                onChange={handleChange}
                className="border rounded-md p-2 w-full bg-white"
                required
              />

              <p className="font-semibold mt-4 mb-2">Toko</p>
              <p className="mb-2 text-sm text-slate-500">Include Toko</p>

              <select
                name="store"
                id="store"
                className="border rounded-md p-2 w-full bg-white"
                onChange={handleChangeStore}
                value={storeData.id_store}
                required
              >
                <option value="">Belum Memilih Toko</option>
                {store.map((store, index) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>

              <p className="font-semibold mt-4 mb-2">Perusahaan</p>
              <p className="mb-2 text-sm text-slate-500">Include Perusahaan</p>

              <select
                name="Company"
                id="Company"
                className="border rounded-md p-2 w-full bg-white"
                onChange={handleChangeCompany}
                value={companyData.id_company}
                required
              >
                <option value="">Belum Memilih Perusahaan</option>
                {company.map((company, index) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>

              <p className="font-semibold mt-4 mb-2">Extras</p>
              <p className="mb-2 text-sm text-slate-500">Include Extras</p>

              <select
                name="extras"
                id="extras"
                className="border rounded-md p-2 w-full bg-white"
                onChange={handleChangeExtras}
                value={extrasData.id_extras}
                required
              >
                <option value="id_extras">Belum Memilih Extras</option>
                {extras.map((extras, index) => (
                  <option key={extras.id} value={extras.id}>
                    {extras.name}
                  </option>
                ))}
              </select>

              <p className="font-semibold mt-4 mb-2">Size</p>
              <p className="mb-2 text-sm text-slate-500">Include Size</p>

              <select
                name="size"
                id="size"
                className="border rounded-md p-2 w-full bg-white"
                onChange={handleChangeSIze}
                value={sizeData.id_size}
                required
              >
                <option value="id_size">Belum Memilih Size</option>
                {size.map((size, index) => (
                  <option key={size.id} value={size.id}>
                    {size.name}
                  </option>
                ))}
              </select>

              <p className="font-semibold mt-4 mb-2">Category</p>
              <p className="mb-2 text-sm text-slate-500">Include Category</p>

              <select
                name="size"
                id="size"
                className="border rounded-md p-2 w-full bg-white"
                onChange={handleCategoryProduct}
                value={categoryProductData.id_category_product}
                required
              >
                <option value="id_category_product">
                  Belum Memilih Category
                </option>
                {categoryProduct.map((cp, index) => (
                  <option key={cp.id} value={cp.id}>
                    {cp.name_category}
                  </option>
                ))}
              </select>

              <p className="font-semibold mt-4 mb-2">Item Campaign</p>
              <p className="mb-2 text-sm text-slate-500">Include Campaign</p>

              <select
                name="item_campaign"
                id="item_campaign"
                className="border rounded-md p-2 w-full bg-white"
                onChange={handleItemCampaign}
                value={itemCampaignData.id_item_campaign}
                required
              >
                <option value="id_item_campaign">
                  Belum Memilih Item Campaign
                </option>
                {itemCampaign.map((ic, index) => (
                  <option key={ic.id} value={ic.id}>
                    {ic.item_campaign_name}
                  </option>
                ))}
              </select>

              <div className="flex justify-end mt-5">
                <button type="button" className="mr-2" onClick={closeModal}>
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white p-2 rounded-lg"
                >
                  Kirim
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
      {isUpdateModalOpen && (
        <Modal onClose={closeModal}>
          <div>
            <form onSubmit={handleSubmitUpdate}>
              <p className="font-bold text-2xl mb-5">Tambah Menu</p>

              <p className="font-semibold">Gambar Produk</p>
              <p className="mb-2 text-sm text-slate-500">
                Format .jpg .jpeg .png dan minimal ukuran 300 x 300px
              </p>
              <div className="upload-container">
                <label className="upload-label">
                  <input
                    type="hidden"
                    name="_id"
                    value={MenuData._id}
                    onChange={handleChange}
                    className="border rounded-md p-2 w-full bg-white"
                    required
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    style={{ display: "none" }}
                  />
                  <div className="upload-content">
                    {MenuData.image ? (
                      <Image
                        src={MenuData.image}
                        alt="Uploaded Image"
                        width={80}
                        height={80}
                        className="uploaded-image"
                      />
                    ) : (
                      <div className="bg-[#F8FAFC] w-28 rounded-lg p-3 flex flex-col items-center justify-center">
                        <LiaCloudUploadAltSolid className="text-5xl text-[#FDDC05]" />
                        <p className="text-sm text-[#FDDC05]">New Image</p>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              <p className="font-semibold mt-4">Nama Product</p>
              <p className="mb-2 text-sm text-slate-500">
                Include min. 10 characters to make it more interesting
              </p>
              <input
                type="text"
                name="name_product"
                value={MenuData.name_product}
                onChange={handleChange}
                className="border rounded-md p-2 w-full bg-white"
                required
                maxLength={100}
              />

              <p className="font-semibold mt-4">Stock</p>
              <p className="mb-2 text-sm text-slate-500">
                Include min. 10 characters to make it more interesting
              </p>
              <input
                type="text"
                name="stock"
                value={MenuData.stock}
                onChange={handleChange}
                className="border rounded-md p-2 w-full bg-white"
                required
              />

              <p className="font-semibold mt-4">Harga Jual</p>
              <p className="mb-2 text-sm text-slate-500">
                Include min. 10 characters to make it more interesting
              </p>
              <input
                type="text"
                name="sell_price"
                value={MenuData.sell_price}
                onChange={handleChange}
                className="border rounded-md p-2 w-full bg-white"
                required
              />
              <p className="font-semibold mt-4">Harga Beli</p>
              <p className="mb-2 text-sm text-slate-500">
                Include min. 10 characters to make it more interesting
              </p>
              <input
                type="number"
                name="total_discount"
                value={MenuData.total_discount}
                onChange={handleChange}
                className="border rounded-md p-2 w-full bg-white"
                required
              />
              <p className="font-semibold mt-4">Product Code</p>
              <p className="mb-2 text-sm text-slate-500">
                Include min. 10 characters to make it more interesting
              </p>
              <input
                type="text"
                name="product_code"
                value={MenuData.product_code}
                onChange={handleChange}
                className="border rounded-md p-2 w-full bg-white"
                required
              />
              <p className="font-semibold mt-4">Barcode</p>
              <p className="mb-2 text-sm text-slate-500">
                Include min. 10 characters to make it more interesting
              </p>
              <input
                type="text"
                name="barcode"
                value={MenuData.barcode}
                onChange={handleChange}
                className="border rounded-md p-2 w-full bg-white"
                required
              />
              <p className="font-semibold mt-4">deskripsi</p>
              <p className="mb-2 text-sm text-slate-500">
                Include min. 10 characters to make it more interesting
              </p>
              <textarea
                name="deskripsi"
                value={MenuData.deskripsi}
                onChange={handleChange}
                className="border rounded-md p-2 w-full bg-white"
                required
              />

              <p className="font-semibold mt-4 mb-2">Toko</p>
              <p className="mb-2 text-sm text-slate-500">Include Toko</p>

              <select
                name="store"
                id="store"
                className="border rounded-md p-2 w-full bg-white"
                onChange={handleChangeStore}
                value={storeData.id_store}
                required
              >
                <option value="">Belum Memilih Toko</option>
                {store.map((store, index) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>

              <p className="font-semibold mt-4 mb-2">Perusahaan</p>
              <p className="mb-2 text-sm text-slate-500">Include Perusahaan</p>

              <select
                name="Company"
                id="Company"
                className="border rounded-md p-2 w-full bg-white"
                onChange={handleChangeCompany}
                value={companyData.id_company}
                required
              >
                <option value="">Belum Memilih Perusahaan</option>
                {company.map((company, index) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>

              <p className="font-semibold mt-4 mb-2">Extras</p>
              <p className="mb-2 text-sm text-slate-500">Include Extras</p>

              <select
                name="extras"
                id="extras"
                className="border rounded-md p-2 w-full bg-white"
                onChange={handleChangeExtras}
                value={extrasData.id_extras}
                required
              >
                <option value="id_extras">Belum Memilih Extras</option>
                {extras.map((extras, index) => (
                  <option key={extras.id} value={extras.id}>
                    {extras.name}
                  </option>
                ))}
              </select>

              <p className="font-semibold mt-4 mb-2">Size</p>
              <p className="mb-2 text-sm text-slate-500">Include Size</p>

              <select
                name="size"
                id="size"
                className="border rounded-md p-2 w-full bg-white"
                onChange={handleChangeSIze}
                value={sizeData.id_size}
                required
              >
                <option value="id_size">Belum Memilih Size</option>
                {size.map((size, index) => (
                  <option key={size.id} value={size.id}>
                    {size.name}
                  </option>
                ))}
              </select>

              <p className="font-semibold mt-4 mb-2">Category</p>
              <p className="mb-2 text-sm text-slate-500">Include Category</p>

              <select
                name="size"
                id="size"
                className="border rounded-md p-2 w-full bg-white"
                onChange={handleCategoryProduct}
                value={categoryProductData.id_category_product}
                required
              >
                <option value="id_category_product">
                  Belum Memilih Category
                </option>
                {categoryProduct.map((cp, index) => (
                  <option key={cp.id} value={cp.id}>
                    {cp.name_category}
                  </option>
                ))}
              </select>

              <p className="font-semibold mt-4 mb-2">Item Campaign</p>
              <p className="mb-2 text-sm text-slate-500">Include Campaign</p>

              <select
                name="item_campaign"
                id="item_campaign"
                className="border rounded-md p-2 w-full bg-white"
                onChange={handleItemCampaign}
                value={itemCampaignData.id_item_campaign}
                required
              >
                <option value="id_item_campaign">
                  Belum Memilih Item Campaign
                </option>
                {itemCampaign.map((ic, index) => (
                  <option key={ic.id} value={ic.id}>
                    {ic.item_campaign_name}
                  </option>
                ))}
              </select>

              <div className="flex justify-end mt-5">
                <button type="button" className="mr-2" onClick={closeModal}>
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white p-2 rounded-lg"
                >
                  Kirim
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Menu;
