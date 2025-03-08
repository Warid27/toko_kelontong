import { useEffect, useRef } from "react";
import Image from "next/image";

const Carousel = ({ companyData }) => {
  const carouselRef = useRef(null);
  const scrollAmount = 0.25;

  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRef.current) {
        let scrollWidth = carouselRef.current.scrollWidth / 2;
        let newScrollLeft =
          carouselRef.current.scrollLeft + scrollWidth * scrollAmount;

        if (newScrollLeft >= scrollWidth) {
          carouselRef.current.scrollLeft = 0;
          newScrollLeft = scrollWidth * scrollAmount;
        }

        carouselRef.current.scrollTo({
          left: newScrollLeft,
          behavior: "smooth",
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="carousel w-[90vw] overflow-hidden relative"
      ref={carouselRef}
    >
      <div className="carousel__inner flex gap-16 w-max flex-nowrap">
        {companyData.length > 0 ? (
          [...companyData, ...companyData].map((logo, index) => (
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
          ))
        ) : (
          <p>Loading logos...</p>
        )}
      </div>
    </div>
  );
};

export default Carousel;
