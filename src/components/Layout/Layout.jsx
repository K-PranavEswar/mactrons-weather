import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import './Layout.css'; // We'll create this CSS file next

const Layout = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;