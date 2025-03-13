import { useState, useEffect } from "react";
import Image from "next/image";
import { LiaCloudUploadAltSolid } from "react-icons/lia";

const ImageUpload = ({
  image,
  onImageChange,
  name,
  value,
  onValueChange,
  params,
  className,
}) => {
  const [preview, setPreview] = useState(image); // Local preview state

  useEffect(() => {
    setPreview(image); // Sync preview when `image` prop changes (e.g., after upload)
  }, [image]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result); // Update preview instantly
      };
      reader.readAsDataURL(file);

      onImageChange(e, params); // Pass file to upload handler
    }
  };

  return (
    <div className={`upload-container ${className}`}>
      <label className=" upload-label cursor-pointer w-fit ">
        {name && (
          <input
            type="hidden"
            name={name}
            value={value}
            onChange={onValueChange}
            className="border rounded-md  p-2 w-full bg-white"
            required
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <div className="border border-slate-500 rounded-lg  upload-content cursor-pointer min-h-48 max-w-48 min-w-48 max-h-48  flex relative overflow-hidden">
          {preview ? (
            <Image
              src={preview}
              alt="Uploaded Image"
              width={100}
              height={200}
              className="uploaded-image object-cover w-full"
            />
          ) : (
            <div className="w-full border-2 border-slate-500 rounded-lg p-3 flex flex-col items-center justify-center">
              <LiaCloudUploadAltSolid className="text-5xl text-[#FDDC05]" />
              <p className="text-sm text-[#FDDC05]">New Image</p>
            </div>
          )}
        </div>
      </label>
    </div>
  );
};

export default ImageUpload;
