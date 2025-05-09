import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MachineUI_Home } from "./machineui/home";
import { MachineUI_BuyWater } from "./machineui/buywater";
import { MachineUI_Payment } from "./machineui/payment";
import { MachineUI_Dispense } from "./machineui/dispense";
import { MachineUI_Reward } from "./machineui/reward";
import { MachineUI_Bottle } from "./machineui/bottle";
import { MachineUI_Redeem } from "./machineui/redeem";
import { MachineUI_ThankYou } from "./machineui/thankyou";
import MachineUI_Layout from "./machineui/layout";
import { Membership_Home } from "./membership/home";
import { Membership_Register } from "./membership/register";
import { Membership_Dashboard } from "./membership/dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Registration Page */}
        <Route path="/" element={<Membership_Home />} />
        <Route path="/register" element={<Membership_Register />} />
        <Route path="/dashboard/:code" element={<Membership_Dashboard />} />

        {/* Machine User Interface */}
        <Route path="/machineui" element={<MachineUI_Layout />}>
          <Route index element={<MachineUI_Home />} />
          <Route path="buywater" element={<MachineUI_BuyWater />} />
          <Route path="buywater/payment" element={<MachineUI_Payment />} />
          <Route path="buywater/dispense" element={<MachineUI_Dispense />} />
          <Route path="buywater/reward" element={<MachineUI_Reward />} />
          <Route path="recycle" element={<MachineUI_Bottle />} />
          <Route path="recycle/redeem" element={<MachineUI_Redeem />} />
          <Route path="thankyou" element={<MachineUI_ThankYou />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
