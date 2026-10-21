import React from "react";
// import { Search, Bell, Settings, User } from "lucide-react";
import "../top-navbar/topnavbar.css";

const topnavbar = ({ pageTitle }) => {
  return (
    <div className="top-nav">
          <div className="navbar-left">
        <h2>{pageTitle}</h2>
      </div>

      {/* RIGHT SIDE (SEARCH + ICONS) */}
      <div className="nav-right">

        

        <div className="nav-icons">
          {/* <Bell size={25} />
          <Settings size={25} />
          <User size={25} /> */}
        </div>

      </div>

    </div>
  )
}

export default topnavbar
