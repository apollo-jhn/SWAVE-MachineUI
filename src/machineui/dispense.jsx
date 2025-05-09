import axios from "axios";
import { useState } from "react";
import { LiquidFillAnimation } from "../components/liquid_fill_animation";
import { useLocation, useNavigate } from "react-router-dom";

export function MachineUI_Dispense() {
  const navigation = useNavigate();
  const location = useLocation();
  const { dispensing_interval } = location.state || {};
  const [isDispensing, setIsDispensing] = useState(true);

  const dispense_complete = async () => {
    if (!isDispensing) return; // Prevent double calls
    setIsDispensing(false);

    try {
      const response = await axios.get(
        import.meta.env.VITE_API_BASE_URL + "/stop/dispensing"
      );

      if (response.status === 200) {
        navigation("/machineui/thankyou", {
          state: {
            message: "Refill complete. Thanks for using our vending machine!",
          },
        });
      }
    } catch (error) {
      console.error("dispense.jsx | CRITICAL", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <LiquidFillAnimation
        duration={dispensing_interval}
        onComplete={dispense_complete}
        showTimeRemaining={true}
        containerClassName="my-custom-class"
      />

      {isDispensing && (
        <button
          onClick={dispense_complete}
          className="px-6 py-2 bg-red-500 text-white font-bold rounded hover:bg-red-600"
        >
          Stop
        </button>
      )}
    </div>
  );
}
