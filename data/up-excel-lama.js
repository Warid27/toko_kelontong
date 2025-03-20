// router.post("/file", authenticate, async (c) => {
//   try {
//     // 📌 1. Get form data
//     const formData = await c.req.formData();
//     const excelFile = formData.get("file");
//     const images = formData.getAll("images");
//     const id_store = formData.get("id_store");
//     const id_company = formData.get("id_company");

//     if (!excelFile) {
//       console.error("❌ [ERROR] Excel file is missing!");
//       return c.json({ message: "Excel file is required!" }, 400);
//     }

//     // 📌 2. Create necessary folders
//     const uploadDir = join(process.cwd(), "public/uploads");
//     const excelDir = join(uploadDir, "excels");

//     await mkdir(excelDir, { recursive: true });

//     // 📌 3. Save the Excel file locally
//     const excelPath = join(excelDir, excelFile.name);
//     const excelBuffer = await excelFile.arrayBuffer();
//     await writeFile(excelPath, Buffer.from(excelBuffer));

//     // 📌 4. Read Excel File
//     const workbook = XLSX.readFile(excelPath);
//     const sheetName = workbook.SheetNames[0];
//     let data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

//     // 📌 5. Upload Images to MinIO and Get Public URLs
//     const imageURLs = {};
//     for (const image of images) {
//       const buffer = await image.arrayBuffer();
//       const ext = extname(image.name);
//       const uniqueFileName = `${crypto.randomUUID()}${ext}`;
//       const objectKey = `product/${uniqueFileName}`;

//       await minioClient.putObject(
//         MINIO_BUCKET_NAME,
//         objectKey,
//         Buffer.from(buffer),
//         image.size,
//         { "Content-Type": image.type }
//       );

//       const publicUrl = `${minioUrl}/${objectKey}`;
//       const shortKey = generateShortKey();
//       const shortenedUrl = `${BACKEND_URI}/api/image/${shortKey}`;

//       // Save file metadata
//       const fileMetadata = new fileMetadataModels({
//         bucketName: MINIO_BUCKET_NAME,
//         objectName: objectKey,
//         fileUrl: publicUrl,
//         shortenedUrl,
//         shortkey: shortKey,
//       });
//       await fileMetadata.save();

//       imageURLs[image.name.split("/").pop().trim().toLowerCase()] =
//         shortenedUrl;
//     }

//     // 📌 6. Create a new Excel file with updated image URLs
//     const newExcelData = data.map((row) => ({
//       ...row,
//       image_url:
//         imageURLs[row.image?.split("/").pop().trim().toLowerCase()] ||
//         "https://placehold.co/600x400",
//       id_store,
//       id_company,
//     }));

//     const newSheet = XLSX.utils.json_to_sheet(newExcelData);
//     const newWorkbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(newWorkbook, newSheet, sheetName);

//     const newExcelName = `updated_${excelFile.name}`;
//     const newExcelPath = join(excelDir, newExcelName);
//     XLSX.writeFile(newWorkbook, newExcelPath);

//     return c.json(newExcelData, 200);
//   } catch (error) {
//     console.error("❌ [ERROR] Upload failed:", error);
//     return c.json({ message: "Upload failed!", error: error.message }, 500);
//   }
// });

// router.post("/file", authenticate, async (c) => {
//   try {
//     console.log("📌 [INFO] Request received at /file endpoint");

//     // 📌 1. Get form data
//     const formData = await c.req.formData();
//     const excelFile = formData.get("file");
//     const images = formData.getAll("images");
//     const id_store = formData.get("id_store");
//     const id_company = formData.get("id_company");

//     if (!excelFile) {
//       console.error("❌ [ERROR] Excel file is missing!");
//       return c.json({ message: "Excel file is required!" }, 400);
//     }

//     // 📌 2. Generate a unique filename with date for the Excel file
//     const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
//     const safeFileName = excelFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
//     const uniqueExcelName = `excel/${
//       safeFileName.split(".")[0]
//     }-${currentDate}-${crypto.randomUUID().substring(0, 8)}.xlsx`;

//     // 📌 3. Upload the original Excel file to MinIO
//     const excelBuffer = await excelFile.arrayBuffer();
//     await minioClient.putObject(
//       MINIO_BUCKET_NAME,
//       uniqueExcelName,
//       Buffer.from(excelBuffer),
//       excelFile.size,
//       {
//         "Content-Type":
//           "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//       }
//     );

//     const excelUrl = `${minioUrl}/${uniqueExcelName}`;
//     console.log("📌 [INFO] Excel file uploaded to MinIO:", excelUrl);

//     // 📌 4. Create a temporary file for ExcelJS to use
//     const tempDir = join(process.cwd(), "temp");
//     await mkdir(tempDir, { recursive: true });
//     const tempFilePath = join(tempDir, `temp-${crypto.randomUUID()}.xlsx`);
//     await writeFile(tempFilePath, Buffer.from(excelBuffer));

//     // 📌 5. Read Excel File with ExcelJS
//     const workbook = new ExcelJS.Workbook();
//     await workbook.xlsx.readFile(tempFilePath);
//     console.log("📌 [INFO] Excel file read successfully");

//     // Get the first worksheet
//     const worksheet = workbook.getWorksheet(1);
//     const data = [];
//     const headers = [];

//     // Extract headers from the first row
//     worksheet.getRow(1).eachCell((cell, colNumber) => {
//       headers[colNumber - 1] = cell.value?.toString() || `Column${colNumber}`;
//     });
//     console.log("📌 [INFO] Extracted headers:", headers);

//     // Extract data from remaining rows
//     worksheet.eachRow((row, rowNumber) => {
//       if (rowNumber > 1) {
//         const rowData = {};
//         row.eachCell((cell, colNumber) => {
//           if (colNumber <= headers.length) {
//             rowData[headers[colNumber - 1]] = cell.value;
//           }
//         });
//         data.push(rowData);
//       }
//     });
//     console.log("📌 [INFO] Extracted data:", data.length, "rows");

//     // Clean up the temporary file
//     try {
//       await unlink(tempFilePath);
//       console.log("📌 [INFO] Temporary Excel file deleted");
//     } catch (unlinkError) {
//       console.warn("⚠️ [WARN] Could not delete temporary file:", unlinkError);
//     }

//     // 📌 6. Upload Images to MinIO and Get Public URLs
//     const imageURLs = {};
//     for (const image of images) {
//       console.log("📌 [INFO] Processing image:", image.name);
//       const buffer = await image.arrayBuffer();
//       const ext = extname(image.name);
//       const uniqueFileName = `${crypto.randomUUID()}${ext}`;
//       const objectKey = `product/${uniqueFileName}`;

//       await minioClient.putObject(
//         MINIO_BUCKET_NAME,
//         objectKey,
//         Buffer.from(buffer),
//         image.size,
//         { "Content-Type": image.type }
//       );

//       const publicUrl = `${minioUrl}/${objectKey}`;
//       const shortKey = generateShortKey();
//       const shortenedUrl = `${BACKEND_URI}/api/image/${shortKey}`;

//       console.log("📌 [INFO] Image uploaded to MinIO:", publicUrl);

//       // Save file metadata
//       const fileMetadata = new fileMetadataModels({
//         bucketName: MINIO_BUCKET_NAME,
//         objectName: objectKey,
//         fileUrl: publicUrl,
//         shortenedUrl,
//         shortkey: shortKey,
//       });
//       await fileMetadata.save();

//       // Store with the image name (without path) as lowercase for matching
//       const imageName = image.name.split("/").pop().trim().toLowerCase();
//       imageURLs[imageName] = shortenedUrl;
//     }
//     console.log("📌 [INFO] Image processing complete");

//     // 📌 7. Create data with updated image URLs
//     const processedData = data.map((row) => {
//       // Make sure to handle undefined image field
//       const imageName = row.image?.split("/").pop()?.trim().toLowerCase();
//       return {
//         ...row,
//         image_url:
//           imageName && imageURLs[imageName]
//             ? imageURLs[imageName]
//             : "https://placehold.co/600x400",
//         id_store,
//         id_company,
//       };
//     });
//     console.log("📌 [INFO] Created Excel data with image URLs");

//     // 📌 8. Create an updated Excel file with the processed data
//     const updatedWorkbook = new ExcelJS.Workbook();
//     const updatedWorksheet = updatedWorkbook.addWorksheet("Sheet1");

//     // Add headers
//     const allKeys = Array.from(
//       new Set(processedData.flatMap((obj) => Object.keys(obj)))
//     );
//     updatedWorksheet.columns = allKeys.map((key) => ({ header: key, key }));

//     // Add rows
//     updatedWorksheet.addRows(processedData);

//     // Write to a buffer
//     const updatedExcelBuffer = await updatedWorkbook.xlsx.writeBuffer();

//     // Upload the updated Excel to MinIO
//     const updatedExcelName = `excel/updated_${
//       safeFileName.split(".")[0]
//     }-${currentDate}.xlsx`;
//     await minioClient.putObject(
//       MINIO_BUCKET_NAME,
//       updatedExcelName,
//       updatedExcelBuffer,
//       updatedExcelBuffer.length,
//       {
//         "Content-Type":
//           "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//       }
//     );

//     const updatedExcelUrl = `${minioUrl}/${updatedExcelName}`;
//     console.log(
//       "📌 [INFO] Updated Excel file uploaded to MinIO:",
//       updatedExcelUrl
//     );

//     // 📌 9. Save the file metadata for the updated Excel
//     const updatedExcelMetadata = new fileMetadataModels({
//       bucketName: MINIO_BUCKET_NAME,
//       objectName: updatedExcelName,
//       fileUrl: updatedExcelUrl,
//       shortenedUrl: updatedExcelUrl,
//       shortkey: generateShortKey(),
//     });
//     await updatedExcelMetadata.save();

//     // Return both the data and file URLs
//     return c.json(
//       {
//         success: true,
//         data: processedData,
//         originalExcelUrl: excelUrl,
//         updatedExcelUrl: updatedExcelUrl,
//         count: processedData.length,
//       },
//       200
//     );
//   } catch (error) {
//     console.error("❌ [ERROR] Upload failed:", error);
//     return c.json({ message: "Upload failed!", error: error.message }, 500);
//   }
// });
// router.post("/file", authenticate, async (c) => {
//   try {
//     console.log("📌 [INFO] Request received at /file endpoint");

//     // 📌 1. Get form data
//     const formData = await c.req.formData();
//     const uploadedFile = formData.get("file");
//     const images = formData.getAll("images");
//     const id_store = formData.get("id_store");
//     const id_company = formData.get("id_company");

//     if (!uploadedFile) {
//       console.error("❌ [ERROR] File is missing!");
//       return c.json({ message: "File is required!" }, 400);
//     }

//     const originalFileName = uploadedFile.name;
//     const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
//     const safeFileName = originalFileName.replace(/[^a-zA-Z0-9._-]/g, "_");
//     const fileExt = originalFileName.split(".").pop().toLowerCase();

//     let convertedBuffer;
//     let fileType;
//     let finalFileName;

//     // 📌 2. Convert CSV to XLSX if necessary
//     if (fileExt === "csv") {
//       console.log("📌 [INFO] Converting CSV to XLSX");
//       const csvBuffer = await uploadedFile.arrayBuffer();
//       const csvData = csvBuffer.toString();
//       const workbook = new ExcelJS.Workbook();
//       const worksheet = workbook.addWorksheet("Sheet1");

//       csvData.split("\n").forEach((row, index) => {
//         worksheet.addRow(row.split(","));
//       });

//       convertedBuffer = await workbook.xlsx.writeBuffer();
//       fileType =
//         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
//       finalFileName = `excel/${safeFileName.split(".")[0]}-${currentDate}.xlsx`;
//     } else {
//       console.log("📌 [INFO] Processing original Excel file");
//       convertedBuffer = await uploadedFile.arrayBuffer();
//       fileType = uploadedFile.type;
//       finalFileName = `excel/${
//         safeFileName.split(".")[0]
//       }-${currentDate}-${crypto.randomUUID().substring(0, 8)}.xlsx`;
//     }

//     // 📌 3. Upload file to MinIO
//     await minioClient.putObject(
//       MINIO_BUCKET_NAME,
//       finalFileName,
//       Buffer.from(convertedBuffer),
//       convertedBuffer.length,
//       { "Content-Type": fileType }
//     );

//     const fileUrl = `${minioUrl}/${finalFileName}`;
//     console.log("📌 [INFO] File uploaded to MinIO:", fileUrl);

//     // 📌 4. Process Excel File
//     const workbook = new ExcelJS.Workbook();
//     await workbook.xlsx.load(convertedBuffer);
//     console.log("📌 [INFO] Excel file read successfully");
//     const worksheet = workbook.getWorksheet(1);
//     const data = [];
//     const headers = [];

//     worksheet.getRow(1).eachCell((cell, colNumber) => {
//       headers[colNumber - 1] = cell.value?.toString() || `Column${colNumber}`;
//     });
//     console.log("📌 [INFO] Extracted headers:", headers);

//     worksheet.eachRow((row, rowNumber) => {
//       if (rowNumber > 1) {
//         const rowData = {};
//         row.eachCell((cell, colNumber) => {
//           if (colNumber <= headers.length) {
//             rowData[headers[colNumber - 1]] = cell.value;
//           }
//         });
//         data.push(rowData);
//       }
//     });
//     console.log("📌 [INFO] Extracted data:", data.length, "rows");

//     // 📌 5. Upload Images to MinIO
//     const imageURLs = {};
//     for (const image of images) {
//       console.log("📌 [INFO] Processing image:", image.name);
//       const buffer = await image.arrayBuffer();
//       const ext = extname(image.name);
//       const uniqueFileName = `${crypto.randomUUID()}${ext}`;
//       const objectKey = `product/${uniqueFileName}`;

//       await minioClient.putObject(
//         MINIO_BUCKET_NAME,
//         objectKey,
//         Buffer.from(buffer),
//         image.size,
//         { "Content-Type": image.type }
//       );

//       const publicUrl = `${minioUrl}/${objectKey}`;
//       const shortKey = generateShortKey();
//       const shortenedUrl = `${BACKEND_URI}/api/image/${shortKey}`;

//       // Save file metadata
//       const fileMetadata = new fileMetadataModels({
//         bucketName: MINIO_BUCKET_NAME,
//         objectName: objectKey,
//         fileUrl: publicUrl,
//         shortenedUrl,
//         shortkey: shortKey,
//       });
//       await fileMetadata.save();

//       imageURLs[image.name.split("/").pop().trim().toLowerCase()] =
//         shortenedUrl;
//     }

//     console.log("📌 [INFO] Image processing complete");

//     // 📌 6. Create updated data with image URLs
//     const processedData = data.map((row) => {
//       const imageName = row.image?.split("/").pop().trim().toLowerCase();
//       console.log("📌 [INFO] Image All:", imageURLs);
//       console.log("IMAGE NAMES", imageName);
//       return {
//         ...row,
//         image_url:
//           imageName && imageURLs[imageName]
//             ? imageURLs[imageName]
//             : "https://placehold.co/600x400",
//         id_store,
//         id_company,
//       };
//     });
//     console.log("📌 [INFO] Created processed data with image URLs");
//     console.log("📌 [INFO] File URL:", fileUrl);

//     // Return response
//     return c.json(
//       {
//         success: true,
//         data: processedData,
//         fileUrl,
//         count: processedData.length,
//       },
//       200
//     );
//   } catch (error) {
//     console.error("❌ [ERROR] Upload failed:", error);
//     return c.json({ message: "Upload failed!", error: error.message }, 500);
//   }
// });
