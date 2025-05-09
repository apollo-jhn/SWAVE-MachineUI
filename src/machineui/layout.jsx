import { Outlet } from "react-router-dom";

const MachineUI_Layout = () => {
  return (
    <main className="h-dvh w-dvw grid grid-cols-1 grid-rows-1">
      <Outlet />
    </main>
  );
};

export default MachineUI_Layout;
