import { meta } from "@eslint/js";
import axios from "axios";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function MachineUI_Redeem() {
  const [code, setCode] = useState(["", "", "", ""]);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { inserted_bottle_count, reward_points } = location.state || {};

  const handleNumberClick = (num) => {
    if (activeIndex < 4) {
      const newCode = [...code];
      newCode[activeIndex] = num;
      setCode(newCode);
      setActiveIndex(activeIndex + 1);
    }
  };

  const handleClear = () => {
    setCode(["", "", "", ""]);
    setActiveIndex(0);
  };

  const donate_bottle = async () => {
    const response = await axios.get(
      import.meta.env.VITE_API_BASE_URL + "/recycle/donate"
    );
    if (response.status == 200) {
      navigate("/machineui/thankyou", {
        state: {
          message:
            "Thank you for your thoughtful donation of PET bottles, which aids our ongoing commitment to environmental responsibility.",
        },
      });
    }
  };

  const addPoints = async () => {
    if (activeIndex < 4) {
      alert("Please enter a complete 4-digit code");
      return;
    }

    const _code = code.join("");
    const _points = reward_points || 0;
    const _bottles = inserted_bottle_count || 0;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/membership/addpoints`,
        {
          code: _code,
          reward_point: _points,
          bottles: _bottles,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.message === "SUCCESS") {
        navigate("/machineui/thankyou", {
          state: {
            message:
              "Reward has been redeemed, thank you for using our machine.",
          },
        });
      } else {
        alert(response.data.message || "Failed to redeem points");
      }
    } catch (error) {
      console.error("Redeem error:", error);
      if (error.response) {
        // Server responded with error status
        alert(
          `Error: ${error.response.data.message || error.response.statusText}`
        );
      } else if (error.request) {
        // Request was made but no response received
        alert("Network error - please check your connection");
      } else {
        // Other errors
        alert("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-white min-h-screen">
      {/* Navigator */}
      <div className="flex items-center justify-between">
        <img
          className="h-[7vh] w-auto"
          src="/swave-logo.png"
          alt="swave-logo"
        />
        <h1 className="text-3xl font-bold text-blue-900 text-center flex-1">
          Redeem Reward
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center px-3 py-2 rounded-lg hover:bg-gray-100"
        >
          <svg
            width="28"
            height="28"
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
          <span className="ml-1 text-blue-800 text-lg font-medium">Back</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Keypad Section */}
        <div className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold text-center text-blue-800">
            Enter Membership Code
          </h2>

          {/* Code Display */}
          <div className="flex justify-center gap-4">
            {code.map((digit, index) => (
              <div
                key={index}
                className={`w-15 h-16 text-3xl font-bold flex items-center justify-center rounded border-2 ${
                  index === activeIndex
                    ? "border-blue-500 bg-blue-100 text-black"
                    : "border-gray-300 bg-white text-black"
                }`}
              >
                {digit || " "}
              </div>
            ))}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num.toString())}
                className="py-2 rounded-lg bg-blue-900 text-white text-2xl font-bold hover:bg-blue-800 active:bg-blue-700 transition"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => handleNumberClick("0")}
              className="py-2 col-span-2 rounded-lg bg-blue-900 text-white text-2xl font-bold hover:bg-blue-800 active:bg-blue-700 transition"
            >
              0
            </button>
            <button
              onClick={handleClear}
              className="py-2 rounded-lg bg-red-600 text-white text-2xl font-bold hover:bg-red-700 active:bg-red-800 transition"
            >
              CLR
            </button>
          </div>
        </div>

        {/* Summary and Actions */}
        <div className="flex flex-col justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold text-blue-800 mb-4">
              Summary
            </h2>
            <div className="grid grid-cols-2 text-lg gap-y-2">
              <p className="font-medium text-gray-700">Bottle Inserted:</p>
              <p className="text-gray-900">{inserted_bottle_count}</p>
              <p className="font-medium text-gray-700">Reward Points:</p>
              <p className="text-gray-900">{reward_points}</p>
            </div>
          </div>

          <p className="text-center italic text-gray-500 text-base px-4">
            Each member has a unique code. If unsure, follow the tutorial on the
            machine.
          </p>

          <div className="grid gap-3">
            <button
              onClick={donate_bottle}
              className="bg-green-600 hover:bg-green-700 text-white text-2xl font-bold py-3 rounded-xl shadow-md transition animate-pulse"
            >
              Donate Instead
            </button>
            <button
              disabled={activeIndex < 4}
              onClick={addPoints}
              className={`text-white text-2xl font-bold py-3 rounded-xl shadow-md transition ${
                activeIndex >= 4
                  ? "bg-blue-700 hover:bg-blue-800 animate-pulse"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Redeem Reward
              <p className="text-base italic font-normal">(code required)</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
