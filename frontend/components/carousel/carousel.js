import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const Carousel = ({ companyData }) => {
  const carouselRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const scrollSpeed = 2; // Adjust speed for smoother effect

  useEffect(() => {
    let animationFrameId;

    const scrollCarousel = () => {
      if (carouselRef.current && isHovered) {
        carouselRef.current.scrollLeft += scrollSpeed;

        // Get the full scroll width
        const maxScrollLeft = carouselRef.current.scrollWidth / 3;

        // If it reaches the max scroll position, reset without visible jump
        if (carouselRef.current.scrollLeft >= maxScrollLeft) {
          carouselRef.current.scrollLeft -= maxScrollLeft;
        }
      }

      animationFrameId = requestAnimationFrame(scrollCarousel);
    };

    if (isHovered) {
      animationFrameId = requestAnimationFrame(scrollCarousel);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered]);

  return (
    <div
      className="relative overflow-hidden w-[90vw] group"
      ref={carouselRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Create 3 copies of the images to ensure seamless looping */}
      <div className="flex w-max flex-nowrap gap-16">
        {[...companyData, ...companyData, ...companyData].map((logo, index) => (
          <div
            key={index}
            className="h-48 w-48 flex overflow-hidden opacity-75 hover:opacity-100"
          >
            <Image
              src={logo.logo}
              width={200}
              height={200}
              alt={logo.name}
              className="object-contain"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
