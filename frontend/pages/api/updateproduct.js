app.post("/updateproduct", async (req, res) => {
    const { id, status } = req.body;
    const statusInt = status === "active" ? 1 : 0; // Ubah string ke integer
    
    // Proses update ke database dengan statusInt
});