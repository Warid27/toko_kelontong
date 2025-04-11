router.post("/upload", async (c) => {
  try {
    // Parse the form data
    const formData = await c.req.formData();
    const file = formData.get("file");

    // Validate the file
    if (!file || !(file instanceof File)) {
      return c.json({ error: "Image is required" }, 400);
    }

    // Define the upload directory
    const uploadsDir = path.join(process.cwd(), "uploads", "product");

    // Ensure the upload directory exists
    try {
      await fs.mkdir(uploadsDir, { recursive: true });
    } catch (mkdirError) {
      console.error("Failed to create upload directory:", mkdirError);
      return c.json(
        {
          error: "Failed to create upload directory",
          details: mkdirError.message,
        },
        500
      );
    }

    // Generate a unique file name
    const ext = path.extname(file.name); // Get the file extension
    const fileName = `${crypto.randomUUID()}${ext}`; // Create a unique file name
    const filePath = path.join(uploadsDir, fileName); // Full path to save the file

    // Read the file buffer and save it to the server
    const fileBuffer = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(fileBuffer));

    // Construct the image URL
    const imageUrl = `https://tokokube.parisada.id/uploads/product/${fileName}`;

    // Return success response
    return c.json({ success: true, image: imageUrl }, 201);
  } catch (error) {
    console.error("Error uploading image:", error);
    return c.json(
      { error: "Failed to upload image", details: error.message },
      500
    );
  }
});
