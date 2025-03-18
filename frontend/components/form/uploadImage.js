import { useState, useEffect } from "react";
import Image from "next/image";
import { LiaCloudUploadAltSolid } from "react-icons/lia";
import { MdOutlineChangeCircle } from "react-icons/md";
import { motion } from "framer-motion";

const ImageUpload = ({
  image,
  onImageChange,
  name,
  value,
  onValueChange,
  params,
  className,
}) => {
  const [preview, setPreview] = useState(image);
  let Sized;
  let fitSize;
  if (
    params == "avatar" ||
    params == "add" ||
    params == "update" ||
    params == "add_product" ||
    params == "update_product"
  ) {
    Sized = "w-48 h-48";
    fitSize = "w-fit";
  } else if (params == "banner" || params == "header") {
    fitSize = "w-full";
    Sized = "w-full h-48";
  } else if (params == "motive") {
    fitSize = "w-fit";
    Sized = "w-64 h-64";
  } else if (params == "footer_motive") {
    fitSize = "w-fit";
    Sized = "w-96 h-64";
  }
  useEffect(() => {
    if (image) setPreview(image);
  }, [image]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      console.error("❌ File size exceeds 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    onImageChange(e, params);
  };

  return (
    <div className={`upload-container ${className}`}>
      <label className={`upload-label cursor-pointer block ${fitSize}`}>
        {name && (
          <input
            type="hidden"
            name={name}
            value={value}
            onChange={onValueChange}
            className="hidden"
            required
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`${Sized} border border-slate-500 rounded-lg w-48 h-48 flex items-center justify-center group relative overflow-hidden cursor-pointer`}
        >
          {preview ? (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <Image
                  src={preview}
                  alt="Uploaded Image"
                  width={192}
                  height={192}
                  className="object-cover w-full h-full"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="absolute top-0 left-0 w-full h-full bg-slate-500/75 flex items-center justify-center opacity-0"
              >
                <MdOutlineChangeCircle className="w-3/4 h-3/4 text-black" />
              </motion.div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full flex flex-col items-center justify-center border-2 border-slate-500 rounded-lg p-3"
            >
              <LiaCloudUploadAltSolid className="text-5xl text-[#FDDC05]" />
              <p className="text-sm text-[#FDDC05]">New Image</p>
            </motion.div>
          )}
        </motion.div>
      </label>
    </div>
  );
};

export default ImageUpload;
