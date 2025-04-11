import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Components
import { Modal } from "@/components/Modal";
import Header from "@/components/section/header";
import Table from "@/components/form/table";
import Loading from "@/components/loading";

// API Functions
import { fetchOrderList } from "@/libs/fetching/order";
import { fetchProductsList } from "@/libs/fetching/product";
import { fetchTableList } from "@/libs/fetching/table";
import { fetchItemCampaignList } from "@/libs/fetching/itemCampaign";

const OrderCust = ({ setSelectedLink, userData }) => {
  const [listOrder, setListOrder] = useState([]);
  const [productList, setProductList] = useState([]);
  const [tableList, setTableList] = useState([]);
  const [itemCampaignList, setItemCampaignList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const id_store = userData?.id_store;

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const getItemCampaignList = async () => {
          const data = await fetchItemCampaignList(id_store);
          setItemCampaignList(data);
        };
        const getProductList = async () => {
          const data = await fetchProductsList(id_store, null, null, "order");
          setProductList(data);
        };
        const getTableList = async () => {
          const data = await fetchTableList();
          setTableList(data);
        };
        const getOrderList = async () => {
          const data = await fetchOrderList(id_store);
          setListOrder(data);
        };

        await Promise.all([
          getItemCampaignList(),
          getProductList(),
          getTableList(),
          getOrderList(),
        ]);
      } catch (error) {
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id_store]);

  // Process order and navigate to kasir
  const handleProcessOrder = (order) => {
    const { __reactFiber$ihwx534u59, __reactProps, ...safeOrder } = order;
    const orderFormat = safeOrder.orderDetails.map((od) => {
      const quantity = od.quantity || 1;
      const selectedProduct = productList.find(
        (pl) => pl._id === od.id_product?._id
      );
      const today = new Date().toISOString().split("T")[0];
      const campaign = itemCampaignList.find(
        (icl) =>
          icl._id === selectedProduct?.id_item_campaign &&
          icl.start_date <= today &&
          icl.end_date >= today
      );
      const discountValue = campaign?.value || 0;

      return {
        informasi: {
          id_order: order._id,
          code: order.code,
          id_table_cust: order.id_table_cust,
          person_name: order.person_name,
          keterangan: order.keterangan,
        },
        product: {
          id: selectedProduct?._id || null,
          id_company: selectedProduct?.id_company || null,
          id_store: selectedProduct?.id_store || null,
          id_item_campaign: selectedProduct?.id_item_campaign || null,
          name: selectedProduct?.name_product || "Unknown",
          image: selectedProduct?.image || "",
          price: selectedProduct?.sell_price || 0,
          product_code: selectedProduct?.product_code || "",
          diskon: discountValue,
          amount: selectedProduct?.id_stock?.amount,
          orderQty: selectedProduct?.orderQty,
          priceAfterDiscount: selectedProduct?.sell_price * (1 - discountValue),
        },
        quantity,
        qty_before: quantity,
        selectedExtra: od.id_extrasDetails
          ? {
              _id: od.id_extrasDetails,
              name:
                selectedProduct?.id_extras?.extrasDetails.find(
                  (extra) => extra._id === od.id_extrasDetails
                )?.name || "Unknown Extra",
            }
          : null,
        selectedSize: od.id_sizeDetails
          ? {
              _id: od.id_sizeDetails,
              name:
                selectedProduct?.id_size?.sizeDetails.find(
                  (size) => size._id === od.id_sizeDetails
                )?.name || "Unknown Size",
            }
          : null,
      };
    });

    localStorage.setItem("kasirItems", JSON.stringify(orderFormat));
    setSelectedLink("kasir");
    toast.success("Order processed and navigated to kasir");
  };

  // Table configuration
  const ExportHeaderTable = [
    { label: "No", key: "no" },
    { label: "Nama Pelanggan", key: "person_name" },
    { label: "No Meja", key: "table_name" },
    { label: "Jumlah Pesanan", key: "order_count" },
    { label: "Total Harga", key: "total_price" },
  ];

  const HeaderTable = [
    { label: "Nama Pelanggan", key: "person_name" },
    {
      label: "No Meja",
      key: "table_name",
      render: (_, row) =>
        tableList.find((tl) => tl._id === row.id_table_cust)?.name || "Unknown",
    },
    {
      label: "Jumlah Pesanan",
      key: "order_count",
      render: (_, row) => row.orderDetails.length,
    },
    {
      label: "Total Harga",
      key: "total_price",
      render: (_, row) =>
        new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
        }).format(
          row.orderDetails.reduce((acc, curr) => acc + curr.total_price, 0)
        ),
    },
  ];

  const actions = [
    {
      icon: <span className="text-white">Process</span>,
      onClick: (row) => handleProcessOrder(row),
      className: "bg-green-500 hover:bg-green-600",
    },
  ];

  // Filter orders based on search query
  const filteredOrderList = listOrder.filter(
    (order) =>
      order.person_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tableList
        .find((tl) => tl._id === order.id_table_cust)
        ?.name.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <Loading />;

  return (
    <div className="w-full h-screen pt-16 relative">
      <Header
        title="Pesanan Masuk"
        subtitle="Detail Pesanan Masuk"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSearch={true}
      />

      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          {filteredOrderList.length === 0 ? (
            <h1 className="p-4 text-center">Pesanan tidak ditemukan!</h1>
          ) : (
            <Table
              fileName="Pesanan Masuk"
              ExportHeaderTable={ExportHeaderTable}
              columns={HeaderTable}
              data={filteredOrderList.map((order, index) => ({
                ...order,
                no: index + 1,
              }))}
              actions={actions}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCust;
