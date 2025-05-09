import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function MachineUI_Bottle() {
  const navigate = useNavigate();
  const POLLING_RATE_MS = 500;
  const [inserted_bottle_count, set_inserted_bottle_count] = useState(0);
  const [reward_points, set_reward_points] = useState(0.0);

  useEffect(() => {
    async function get_cleaned() {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/recycle/clear`
      );
      if (response.status == 200) {
        console.log("Successfully cleaned the recycle data.");
      } else {
        console.log("Clearing the recycle data has not been completed.");
      }
    }
    get_cleaned();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const _fetchdata = async () => {
      try {
        const _response = await axios.get(
          import.meta.env.VITE_API_BASE_URL + "/recycle/data"
        );
        if (isMounted) {
          set_inserted_bottle_count(_response.data.inserted_bottles);
          set_reward_points(_response.data.reward_points);
        }
      } catch (error) {
        console.error("ERROR: Recycling Page - Fetching data:", error);
      }
    };

    const timer = setInterval(_fetchdata, POLLING_RATE_MS);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

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

  const redeemPoints = () => {
    navigate("/machineui/recycle/redeem", {
      state: {
        inserted_bottle_count,
        reward_points,
      },
    });
  };

  return (
    <div className="flex flex-col gap-4 pb-4 px-4 bg-white h-full">
      {/* Navigator */}
      <div className="px-4 pt-4 flex flex-row items-center">
        <img
          className="h-[8vh] w-auto"
          src="/swave-logo.png"
          alt="swave-logo"
        />
        <h1 className="grow text-center text-4xl font-bold text-blue-900">
          Recycle
        </h1>
        <button
          disabled={inserted_bottle_count > 0}
          onClick={() => navigate(-1)}
          className={`${
            inserted_bottle_count > 0 ? "invisible" : ""
          } flex flex-row items-center hover:bg-gray-200 p-2 rounded-xl transition-colors`}
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

      {/* Bottle Counter, Reward Point Counter */}
      <div className="grow gap-4 grid grid-cols-2 grid-rows-1 text-white">
        {/* Bottle Counter */}
        <div className="bg-gradient-to-br gap-2 from-blue-700 to-blue-900 rounded-3xl p-6 shadow-lg flex flex-col justify-center items-center">
          <h1 className="text-8xl font-extrabold animate-pulse">
            {inserted_bottle_count}
          </h1>
          <h2 className="text-2xl font-bold uppercase">Bottle Inserted</h2>
        </div>
        {/* Reward Point */}
        <div className="bg-gradient-to-br gap-2 from-blue-700 to-blue-900 rounded-3xl p-6 shadow-lg flex flex-col justify-center items-center">
          <h1 className="text-8xl font-extrabold animate-pulse">
            {typeof reward_points === "number"
              ? reward_points.toFixed(2)
              : "0.00"}
          </h1>
          <h2 className="text-2xl font-bold uppercase">Reward points</h2>
        </div>
      </div>

      {/* Buttons */}
      <div className="gap-4 grid grid-cols-1 grid-rows-2 font-bold text-white">
        {/* Donate Button */}
        <button
          onClick={donate_bottle}
          className={`${
            inserted_bottle_count > 0 ? "bg-green-600" : "bg-gray-700"
          } text-2xl rounded-2xl shadow-lg transition-colors py-4`}
        >
          Donate Bottles
        </button>
        {/* Redeem Points */}
        <button
          onClick={redeemPoints}
          disabled={inserted_bottle_count > 0 ? false : true}
          className={`${
            inserted_bottle_count > 0 ? "bg-blue-700" : "bg-gray-700"
          } text-2xl rounded-2xl font-bold shadow-lg transition-colors py-4`}
        >
          Redeem Points
        </button>
      </div>
    </div>
  );
}
