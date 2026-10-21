import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LandingPage from "./Landingpage/landingpage";
import Dashboard from "./Drashboard/drashboard";
import Login from "./Authentication/Login";
import Register from "./Authentication/Register.jsx";

import Chatbot from "./chatbot/chatbot.jsx";
import Roadmap from "./Roadmap/Roadmap.jsx";
import Options from "./Options/options.jsx";
import Resume from "./Resume/resume.jsx";
import Profile from "./Profile/Profile.jsx";

import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            PUBLIC ROUTES
        ========================= */}

        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =========================
            MAIN APP ROUTES
        ========================= */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/ai-assistant"
          element={<Chatbot />}
        />

        <Route
          path="/career-vision"
          element={<Options />}
        />

        <Route
          path="/career-path"
          element={<Roadmap />}
        />

        <Route
          path="/resume-intelligence"
          element={<Resume />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />


        {/* =========================
            OLD ROUTES (Backward Compatibility)
        ========================= */}

        <Route
          path="/chatbot"
          element={<Chatbot />}
        />

        <Route
          path="/roadmap"
          element={<Roadmap />}
        />

        <Route
          path="/options"
          element={<Options />}
        />

        <Route
          path="/resume"
          element={<Resume />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;