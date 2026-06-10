import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../../Components/Sidebar/Sidebar";
import { Drawer } from "antd";
import Header from "../../Components/Sidebar/Header";
const MainLayout = () => {
  const onClose = () => setOpen(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const showDrawer = () => setOpen(true);
  const toggleNotificationDropdown = () =>
    setShowNotifications(!showNotifications);
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 z-10 hidden h-full shadow-md w-72 lg:block">
        <Sidebar/>
      </div>

      {/* Drawer for Mobile */}
      <Drawer placement="left" onClose={onClose} open={open} width={250}>
        <Sidebar />
      </Drawer>

      {/* Main Content Wrapper */}
      <div className="flex flex-col flex-1 h-full lg:ml-72 overflow-hidden">
        {/* Header Section */}
        <Header
          showDrawer={showDrawer}
          toggleNotificationDropdown={toggleNotificationDropdown}
        />

        {/* Scrollable Content Section */}
        <div className="flex-1 overflow-y-auto bg-[#13131F]">

          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
