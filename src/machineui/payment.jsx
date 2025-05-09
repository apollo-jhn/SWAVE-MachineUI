import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function MachineUI_Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { volume, price, volume_value, price_value } = location.state || {};
  const [coinsInserted, setCoinsInserted] = useState(0);
  const remainingPayment = price_value - coinsInserted;
  const POLLING_TIME_MS = 250;

  useEffect(() => {
    const timer = setInterval(() => {
      const _fetchdata = async () => {
        try {
          const _request = await axios.get(
            import.meta.env.VITE_API_BASE_URL + "/coinslot/inserted_amount"
          );
          // console.log(_request.data); // or do something with the data
          setCoinsInserted(_request.data.inserted_amount);
        } catch (error) {
          console.error("Polling error:", error);
        }
      };

      _fetchdata(); // <-- You need to call the function
    }, POLLING_TIME_MS);

    return () => clearInterval(timer); // Cleanup on unmount
  }, []);

  const handleOrder = async () => {
    try {
      // Send order data and get the interval and send it to the dispensing page.
      const response = await axios.post(
        import.meta.env.VITE_API_BASE_URL + "/buywater/process_order",
        {
          volume_value,
          price_value,
        }
      );
      if (response.status == 200) {
        navigate("/machineui/buywater/dispense", {
          state: {
            dispensing_interval: response.data.dispensing_interval,
          },
        });
      } else {
        console.error("Error occured on handle order: ");
      }
    } catch (error) {
      console.error("Handling Error Received an Error: ", error);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white min-h-screen">
      {/* Navigator */}
      <div className="flex flex-row items-center">
        <img
          className="h-[8vh] w-auto"
          src="/swave-logo.png"
          alt="swave-logo"
        />
        <h1 className="grow text-center text-4xl font-bold text-blue-900">
          Payment
        </h1>
        <button
          onClick={() => navigate(-1)}
          className={`${
            coinsInserted === 0 ? "visible" : "invisible"
          } flex flex-row items-center p-2 rounded-xl`}
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

      {/* Payment Summary */}
      <div className="grow grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Water Selection Info */}
        <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-3xl p-6 flex flex-col justify-center items-center shadow-lg">
          <div className="text-white text-2xl space-y-4 text-center">
            <h1 className="text-3xl font-bold">Your Water Selection</h1>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between w-64">
                <span className="font-semibold">Volume:</span>
                <span>{volume}</span>
              </div>
              <div className="flex justify-between w-64">
                <span className="font-semibold">Price:</span>
                <span>{price}</span>
              </div>
            </div>

            <h1 className="text-3xl font-bold mt-6">Payment Status</h1>
            <div className="flex justify-between w-64">
              <span className="font-semibold">Needed:</span>
              <span>
                {coinsInserted >= price_value
                  ? "None"
                  : `${remainingPayment} coins`}
              </span>
            </div>
          </div>
        </div>

        {/* Coin Display */}
        <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-3xl p-6 flex flex-col justify-center items-center text-white text-center shadow-lg">
          <h2 className="text-8xl font-extrabold animate-pulse">
            ₱{coinsInserted}
          </h2>
          <h1 className="text-2xl mt-4 animate-pulse uppercase">
            {coinsInserted >= price_value
              ? "Press 'Dispense Water'"
              : "Insert Coin"}
          </h1>
        </div>
      </div>

      {/* Action Button */}
      <button
        disabled={coinsInserted < price_value}
        onClick={handleOrder}
        className={`w-full py-4 text-2xl font-bold rounded-2xl transition-colors shadow-lg ${
          coinsInserted >= price_value
            ? "bg-green-600 hover:bg-green-500"
            : "bg-gray-400 cursor-not-allowed"
        } text-white active:scale-95`}
      >
        {coinsInserted >= price_value ? "Dispense Water" : "Insert coin"}
      </button>
    </div>
  );
}
