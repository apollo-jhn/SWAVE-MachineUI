import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export function MachineUI_Home() {
  const navigate = useNavigate();
  const [isLowWater, setIsLowWater] = useState(false);
  const [isFullStorage, setIsFullStorage] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString()
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    // Clean up the interval on component unmount
    return () => clearInterval(timer);
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
  };

  const fetchWarnings = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/warnings`
      );

      const { is_low_water, is_storage_full } = response.data;

      setIsLowWater(is_low_water);
      setIsFullStorage(is_storage_full);
      setLastUpdated(new Date());

      // Set warning messages
      if (is_low_water && is_storage_full) {
        setWarningMessage(
          "Warning: Water level is low AND storage bin is full!"
        );
        setShowWarning(true);
      } else if (is_low_water) {
        setWarningMessage("Warning: Water level is low!");
        setShowWarning(true);
      } else if (is_storage_full) {
        setWarningMessage("Warning: Storage bin is full!");
        setShowWarning(true);
      }
    } catch (error) {
      console.error("Error fetching warnings:", error);
      setWarningMessage("Failed to load machine status");
      setShowWarning(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWarnings();

    // Optional: Set up polling to check warnings periodically
    const interval = setInterval(fetchWarnings, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const closeWarning = () => {
    setShowWarning(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-50">
        <div className="text-2xl font-bold text-blue-800">
          Loading machine status...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8 bg-blue-50 relative">
      {/* Reload Button - Top Left */}
      <button
        onClick={fetchWarnings}
        className="absolute top-4 left-4 p-2 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors shadow-md"
        title="Refresh status"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-blue-700"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>

      {/* Last updated time */}
      {lastUpdated && (
        <div className="absolute top-4 right-4 text-sm text-gray-500">
          Last updated: {lastUpdated.toLocaleTimeString()} | Time: {currentTime}
        </div>
      )}

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ Warning</h2>
            <p className="text-lg mb-6">{warningMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={closeWarning}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white shadow-2xl rounded-3xl p-6 w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Rest of your existing content remains the same */}
        {/* Branding */}
        <div className="flex flex-col items-center gap-6 text-center md:text-left md:items-start">
          <img
            className="w-[60%] md:w-[40%] h-auto"
            src="/swave-logo.png"
            alt="SWAVE Logo"
          />
          <p className="text-lg leading-relaxed text-gray-700">
            💦 Stay refreshed and hydrated with <strong>SWAVE</strong>, a Smart
            Vending Machine. Get clean water for just a few coins, or insert
            used plastic bottles to earn points 🌟. Redeem points for awesome
            merch— every bottle you drop helps the environment too! 🌍
          </p>
        </div>

        {/* Options */}
        <div className="flex flex-col justify-center gap-6">
          <h1 className="text-3xl font-bold uppercase text-center text-blue-900">
            Select Options Below
          </h1>

          <button
            onClick={() => handleNavigate("/machineui/buywater")}
            disabled={isLowWater}
            className={`grid grid-cols-4 items-center rounded-2xl overflow-hidden shadow-md transition-colors ${
              isLowWater
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-800 hover:bg-blue-700"
            }`}
          >
            <img
              className="h-full object-cover"
              src="/images/a_glass_of_water.jpeg"
              alt="Glass of water"
            />
            <p className="col-span-3 text-3xl text-white font-bold text-center">
              Buy Water
            </p>
          </button>

          <button
            onClick={() => handleNavigate("/machineui/recycle")}
            disabled={isFullStorage}
            className={`grid grid-cols-4 items-center rounded-2xl overflow-hidden shadow-md transition-colors ${
              isFullStorage
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-800 hover:bg-blue-700"
            }`}
          >
            <img
              className="h-full object-cover"
              src="/images/plastic_bottles.jpeg"
              alt="Plastic bottles"
            />
            <p className="col-span-3 text-3xl text-white font-bold text-center">
              Recycle Bottles
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
