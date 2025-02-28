export const fetchWithCache = async (url) => {
  const cacheKey = `cache:${url}`;

  // If WebSocket has updated, force fresh fetch
  if (globalThis.webSocketUpdated) {
    globalThis.webSocketUpdated = false; // Reset flag
    await localforage.removeItem(cacheKey); // Invalidate cache
  }

  const cachedData = await localforage.getItem(cacheKey);
  if (cachedData) return cachedData; // Use cache if available

  try {
    const token = localStorage.getItem("token");
    const response = await client.post(
      url,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = response.data;

    if (!Array.isArray(data)) return [];

    await localforage.setItem(cacheKey, data);
    return data;
  } catch (error) {
    console.error("❌ Error fetching data:", url, error);
    throw error;
  }
};
