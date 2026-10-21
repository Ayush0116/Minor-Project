import React from "react";
import TopNavbar from "./top-navbar/topnavbar";
import LeftNavbar from "./left-navbar/leftnavbar";
import "./navbar.css";

function Navbar() {
  return (
    <div>
      <TopNavbar />
      <LeftNavbar />
    </div>
  );
}

export default Navbar;