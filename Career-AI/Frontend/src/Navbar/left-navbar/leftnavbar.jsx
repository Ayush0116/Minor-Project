import React from "react";
import {
  Sparkles,
  LayoutDashboard,
  Bot,
  Compass,
  Route,
  FileText,
  UserCircle,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import "./left-navbar.css";

const LeftNavbar = () => {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "AI Assistant",
      path: "/chatbot", // Aapke chatbot component route ke sath match kiya
      icon: Bot,
    },
    {
      name: "Career Vision",
      path: "/career-vision",
      icon: Compass,
    },
    {
      name: "Career Path",
      path: "/roadmap", // Aapke Roadmap component route ke sath match kiya
      icon: Route,
    },
    {
      name: "Resume Intelligence",
      path: "/resume", // Aapke Resume Intelligence component route ke sath match kiya
      icon: FileText,
    },
    {
      name: "Profile",
      path: "/profile", // Aapke Profile component route ke sath match kiya
      icon: UserCircle,
    },
  ];

  return (
    <div className="left-nav">

      {/* ================= BRAND ================= */}
      <div className="brand">
        <div className="icon-box">
          <Sparkles
            size={18}
            strokeWidth={1.8}
          />
        </div>

        <div className="brand-text">
          <h3>
            Curator AI
          </h3>
          <h2>
            Premium Career Concierge
          </h2>
        </div>
      </div>

      {/* ================= NAVIGATION ================= */}
      <ul>
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `menu-item ${
                    isActive ? "active" : ""
                  }`
                }
              >
                <Icon
                  size={20}
                  strokeWidth={1.8}
                />
                <span>
                  {item.name}
                </span>
              </NavLink>
            </li>
          );
        })}
      </ul>

      {/* ================= UPCOMING FEATURES ================= */}
      <div className="upcoming">
        <h4>
          Upcoming Features
        </h4>

        <div className="upcoming-item">
          <span className="dot"></span>
          Skill Assessment
        </div>

        <div className="upcoming-item">
          <span className="dot"></span>
          Career Insights
        </div>
      </div>

    </div>
  );
};

export default LeftNavbar;