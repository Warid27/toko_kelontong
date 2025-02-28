const handleReserve = async (params, id_product, amount) => {
  try {
    const response = await client.put("/api/reserve", {
      action: params,
      id_product: id_product,
      quantity: amount,
    });
  } catch (error) {
    console.error("Error fetching product details:", error);
  }
};
