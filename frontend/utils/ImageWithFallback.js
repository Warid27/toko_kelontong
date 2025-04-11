import { useState, useEffect } from "react";
import Image from "next/image";

const ImageWithFallback = ({
  src,
  onError = "https://placehold.co/500x500",
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  useEffect(() => {
    setImageSrc(src);
  }, [src]);

  return (
    <Image
      {...props}
      src={imageSrc || onError}
      onLoadingComplete={(result) => {
        if (result.naturalWidth === 0) {
          // Image failed to load
          setImageSrc(onError);
        }
      }}
    />
  );
};

export default ImageWithFallback;
