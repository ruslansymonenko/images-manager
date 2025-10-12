import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../components";

interface Props {}

const Layout: React.FC<Props> = () => {
  return (
    <div className="min-h-screen min-w-screen bg-primary">
      <Navbar />
      <main className="w-full h-full">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
