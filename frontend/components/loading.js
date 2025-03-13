export default function Loading() {
  return (
    <div className="w-full h-screen pt-16 relative">
      <div className="absolute inset-0 flex justify-center items-center bg-white z-10">
        <div className="relative flex w-[100px] h-[40px] justify-center items-center">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-[20px] h-[20px] bg-black rounded-full animate-bounce-custom"
              style={{
                left: `${i * 25}px`, // Adjust spacing between dots
                animationDelay: `-${i * 0.4}s`,
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
