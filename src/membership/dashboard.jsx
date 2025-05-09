import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export function Membership_Dashboard() {
  const { code } = useParams();
  const [userData, setUserData] = useState({
    points: 0,
    student_number: "",
    name: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [redeemError, setRedeemError] = useState("");
  const [redeemSuccess, setRedeemSuccess] = useState("");
  const navigate = useNavigate();

  // Redeemable items data
  const redeemableItems = [
    {
      id: 1,
      name: "250ml Water",
      points: 50,
      description: "Use points to refill.",
    },
    {
      id: 2,
      name: "Chocolate Bar",
      points: 75,
      description: "Delicious milk chocolate",
    },
    {
      id: 3,
      name: "Energy Drink",
      points: 100,
      description: "250ml energy drink",
    },
    { id: 4, name: "Sandwich", points: 150, description: "Fresh sandwich" },
    {
      id: 5,
      name: "Meal Voucher",
      points: 300,
      description: "Cafeteria meal voucher",
    },
  ];

  // Function to fetch user data
  const fetchUserData = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/membership/getdata`,
        { code }
      );

      const data = response.data;

      setUserData({
        points: data.points,
        student_number: data.student_number,
        name: data.name,
        email: data.email,
      });

      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "An error occurred while fetching data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle item redemption
  const handleRedeemItem = async (itemId) => {
    setRedeemError("");
    setRedeemSuccess("");

    try {
      const selectedItem = redeemableItems.find((item) => item.id === itemId);

      if (userData.points < selectedItem.points) {
        throw new Error("You don't have enough points for this item");
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/redeem/item`,
        {
          code,
          itemId,
          pointsCost: selectedItem.points,
        }
      );

      setUserData((prev) => ({
        ...prev,
        points: prev.points - selectedItem.points,
      }));

      setRedeemSuccess(`Successfully redeemed ${selectedItem.name}!`);
      setTimeout(fetchUserData, 1000);
    } catch (err) {
      setRedeemError(
        err.response?.data?.message || err.message || "Failed to redeem item"
      );
    }
  };

  // Set up interval for continuous updates
  useEffect(() => {
    // Initial fetch
    fetchUserData();

    // Set up interval for continuous updates every 500ms
    const intervalId = setInterval(fetchUserData, 500);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleLogout = () => {
    // Clear any user session data
    localStorage.removeItem("userToken");
    localStorage.removeItem("userCode");

    // Redirect to login page
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">SWAVE Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-gray-100 transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-grow container mx-auto p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                User Information
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-lg font-medium">{userData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-lg font-medium">{userData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Student Number</p>
                  <p className="text-lg font-medium">
                    {userData.student_number}
                  </p>
                </div>
              </div>
            </div>

            {/* Reward Points Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Reward Points
              </h2>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <p className="text-5xl font-bold text-blue-600 animate-pulse">
                    {userData.points.toFixed(2)}
                  </p>
                  <p className="text-gray-500 mt-2">Current Points</p>
                </div>
              </div>
            </div>

            {/* Redeemable Items Section */}
            <div className="bg-white rounded-lg shadow-md p-6 md:col-span-3">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Redeemable Items
              </h2>

              {redeemError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {redeemError}
                </div>
              )}

              {redeemSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  {redeemSuccess}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {redeemableItems.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-4 hover:shadow-lg transition"
                  >
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {item.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-blue-600">
                        {item.points} points
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRedeemItem(item.id)}
                        disabled={userData.points < item.points}
                        className={`px-3 py-1 rounded text-sm ${
                          userData.points >= item.points
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        Redeem
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-red-800 py-4 text-white">
        <div className="container mx-auto px-4 text-center">
          <p>
            © {new Date().getFullYear()} SWAVE Vending Machine Prototype. All
            rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
