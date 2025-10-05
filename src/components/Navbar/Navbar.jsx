import React from "react";
import { Bell } from "lucide-react";
import "./Navbar.css";

export default function Navbar() {
  return (
    <div className="navbar">
      <h3>Weather Dashboard</h3>
      <div className="nav-actions">
        <Bell />
        <img src="https://i.pravatar.cc/40" alt="User" className="avatar" />
      </div>
    </div>
  );
}
