import React from "react";
import { Outlet } from "react-router";
import { AppHeader } from "@/widgets/app-header";
import "../styles/global.css";

function App() {
  return (
    <div id="root">
      <AppHeader />
      <div className="page">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
