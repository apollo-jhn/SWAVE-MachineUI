import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export function MachineUI_ThankYou() {
  const location = useLocation();
  const navigate = useNavigate();
  const { message } = location.state || {};

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/machineui");
    }, 8000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen bg-blue-50 p-4 overflow-hidden">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md text-center flex flex-col items-center p-6 sm:p-10">
        {/* Logo */}
        <img
          src="/swave-logo.png"
          alt="SWAVE Logo"
          className="h-20 w-auto mb-4 animate-bounce"
        />

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl font-bold text-blue-700 mb-2 animate-scale">
          Thank You!
        </h1>

        {/* Subtext */}
        <p className="text-base sm:text-lg text-gray-700">{message}</p>
        <p className="text-sm text-gray-500 mb-6">
          We appreciate you choosing SWAVE for your hydration needs.
        </p>

        {/* Button */}
        <button
          onClick={() => navigate("/machineui")}
          className="mt-auto px-5 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white font-medium rounded-xl shadow-md hover:bg-blue-700 transition-colors"
        >
          Return to Home
        </button>

        <p className="text-xs text-gray-400 mt-4">
          You’ll be automatically redirected in 8 seconds…
        </p>
      </div>

      {/* Tailwind Custom Animations */}
      <style>{`
        @keyframes scale {
          0% {
            transform: scale(0.9);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale {
          animation: scale 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
