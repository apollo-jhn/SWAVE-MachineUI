import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function MachineUI_BuyWater() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(null);
  const [animate, setAnimate] = useState(false);

  const options = [
    {
      volume: "250ml (8.8oz)",
      price: "₱2",
      volume_value: 250,
      price_value: 2,
      image: "/water-250ml.png",
    },
    {
      volume: "500ml (17.6oz)",
      price: "₱4",
      volume_value: 500,
      price_value: 4,
      image: "/water-500ml.png",
    },
    {
      volume: "750ml (26.4oz)",
      price: "₱6",
      volume_value: 750,
      price_value: 6,
      image: "/water-750ml.png",
    },
    {
      volume: "1000ml (35.2oz)",
      price: "₱11",
      volume_value: 1000,
      price_value: 11,
      image: "/water-1000ml.png",
    },
  ];

  const handleOrder = () => {
    const selectedOption = options[currentIndex];
    navigate("/machineui/buywater/payment", {
      state: {
        volume: selectedOption.volume,
        price: selectedOption.price,
        volume_value: selectedOption.volume_value,
        price_value: selectedOption.price_value,
      },
    });
  };

  const goToPrevious = () => {
    setDirection("left");
    setAnimate(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === 0 ? options.length - 1 : prev - 1));
      setAnimate(false);
    }, 300);
  };

  const goToNext = () => {
    setDirection("right");
    setAnimate(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === options.length - 1 ? 0 : prev + 1));
      setAnimate(false);
    }, 300);
  };

  return (
    // ... inside your return
    <div className="flex flex-col gap-4 pb-4 bg-white h-full">
      {/* Navigator */}
      <div className="px-4 pt-4 flex flex-row items-center">
        <img
          className="h-[8vh] w-auto"
          src="/swave-logo.png"
          alt="swave-logo"
        />
        <h1 className="grow text-center text-4xl font-bold text-blue-900">
          Buy Water
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="flex flex-row items-center hover:bg-gray-200 p-2 rounded-xl transition-colors"
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22 14L16 20L22 26"
              stroke="#2A9D8F"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <p className="font-semibold text-lg text-blue-800 ml-1">Back</p>
        </button>
      </div>

      {/* Animated Carousel */}
      <div className="relative grow flex items-center justify-center rounded-3xl mx-4 bg-gradient-to-br from-blue-700 to-blue-900 shadow-lg">
        <div
          className={`w-full text-center transition-all duration-300 ease-in-out ${
            animate
              ? direction === "right"
                ? "-translate-x-full opacity-0"
                : "translate-x-full opacity-0"
              : "translate-x-0 opacity-100"
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-5xl font-bold text-white">
              {options[currentIndex].volume}
            </h2>
            <p className="text-6xl font-extrabold text-white">
              {options[currentIndex].price}
            </p>
          </div>
        </div>

        {/* Hidden preload items */}
        <div className="absolute inset-0 flex items-center justify-center">
          {options.map((option, index) => {
            if (index === currentIndex) return null;
            return (
              <div
                key={index}
                className="absolute w-full text-center opacity-0 pointer-events-none"
              >
                <div className="flex flex-col items-center gap-4">
                  <h2 className="text-3xl font-semibold text-white">
                    {option.volume}
                  </h2>
                  <p className="text-4xl font-bold text-white">
                    {option.price}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col gap-4 px-4">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={goToPrevious}
            className="flex flex-row items-center bg-blue-700 text-white rounded-2xl p-3 hover:bg-blue-600 transition-all active:scale-95 shadow"
          >
            <svg
              className="w-8 h-8 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <div className="text-left">
              <p className="text-lg font-bold">Previous Offer</p>
              <p className="text-sm text-gray-200">
                {
                  options[
                    currentIndex === 0 ? options.length - 1 : currentIndex - 1
                  ].volume
                }
              </p>
            </div>
          </button>

          <button
            onClick={goToNext}
            className="flex flex-row-reverse items-center bg-blue-700 text-white rounded-2xl p-3 hover:bg-blue-600 transition-all active:scale-95 shadow"
          >
            <svg
              className="w-8 h-8 ml-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
            <div className="text-right">
              <p className="text-lg font-bold">Next Offer</p>
              <p className="text-sm text-gray-200">
                {
                  options[
                    currentIndex === options.length - 1 ? 0 : currentIndex + 1
                  ].volume
                }
              </p>
            </div>
          </button>
        </div>

        <button
          onClick={handleOrder}
          className="bg-green-600 text-white font-bold text-2xl rounded-2xl p-3 hover:bg-green-500 transition-colors active:scale-95 shadow"
        >
          Confirm Selection
        </button>
      </div>
    </div>
  );
}
