// CONTOH LINK: http://localhost:8000/menu/67c1799ec5fc83617945eddd
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

import { fetchGetProducts } from "@/libs/fetching/product";
export default function Home() {
  const [productData, setProductData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    const { id_product } = router.query;
    if (!id_product) {
      setIsLoading(false);
      return;
    }

    const getProduct = async () => {
      try {
        const data_product = await fetchGetProducts(id_product, "all");
        setProductData(data_product);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getProduct();
  }, [router.isReady, router.query]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-4 border-gray-200 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500">
            Fetching product data, please wait...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F7F7] min-h-screen flex justify-center items-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl w-full relative">
        {/* Out of Stock Banner */}
        {/* {productData.amount - productData.orderQty <= 0 && (
          <h1
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
      text-red-500 font-extrabold text-6xl lg:text-9xl 
      rotate-12 whitespace-nowrap opacity-70"
          >
            PRODUK HABIS
          </h1>
        )} */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-64 max-h-64">
          {/* Product Image */}
          <div className="w-full max-h-64 rounded-xl flex justify-center p-3 border border-slate-300">
            <Image
              src={productData.image}
              alt={productData.name_product}
              width={100}
              height={100}
              className="object-cover w-full"
            />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">
              {productData.name_product}
            </h2>
            <p className="text-gray-600 text-lg">{productData.deskripsi}</p>

            {/* Category & Stock */}
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="bg-gray-100 text-gray-700 px-4 py-1 rounded-full">
                {productData.categoryName}
              </span>
              <span
                className={`px-4 py-1 rounded-full font-medium ${
                  productData.amount - productData.orderQty > 0
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                Stok: {productData.amount - productData.orderQty}
              </span>
              <span
                className={`px-4 py-1 rounded-full font-medium ${
                  productData.amount - productData.orderQty > 0
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {productData.amount - productData.orderQty > 0
                  ? "TERSEDIA"
                  : "HABIS"}
              </span>
            </div>

            {/* Pricing */}
            <div className="flex items-center gap-4">
              <p className="relative text-xl font-semibold text-gray-800">
                {productData.discount > 0 && (
                  <span className="absolute text-red-500 text-sm line-through -top-4 -left-3">
                    Rp{" "}
                    {Number(
                      (
                        productData.sell_price *
                        (1 - productData.discount)
                      ).toFixed(0)
                    ).toLocaleString("id-ID")}
                  </span>
                )}
                <span className="text-2xl font-bold">
                  Rp {productData.sell_price.toLocaleString("id-ID")}
                </span>
              </p>
              {productData.discount > 0 && (
                <span className="text-sm font-medium text-red-600 bg-red-100 px-3 py-1 rounded-full">
                  Diskon: {productData.discount * 100}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Extras & Sizes - Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Extras */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-lg text-gray-900 mb-2">Varian</h3>
            <div className="flex flex-wrap gap-2">
              {productData.id_extras &&
              productData.id_extras.extrasDetails.length > 0 ? (
                productData.id_extras.extrasDetails.map((extra) => (
                  <div
                    key={extra._id}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-medium"
                  >
                    {extra.name}:{" "}
                    <span className="text-gray-700">{extra.deskripsi}</span>
                  </div>
                ))
              ) : (
                <span className="text-gray-700">Belum Tersedia</span>
              )}
            </div>
          </div>

          {/* Sizes */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-lg text-gray-900 mb-2">Sizes</h3>
            <div className="flex flex-wrap gap-2">
              {productData.id_size &&
              productData.id_size.sizeDetails.length > 0 ? (
                productData.id_size.sizeDetails.map((size) => (
                  <div
                    key={size._id}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-sm font-medium"
                  >
                    {size.name}:{" "}
                    <span className="text-gray-700">{size.deskripsi}</span>
                  </div>
                ))
              ) : (
                <span className="text-gray-700">Belum Tersedia</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
