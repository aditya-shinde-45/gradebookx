// src/components/Sidebar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any stored user data (e.g., localStorage)
    localStorage.clear();

    // Redirect to login or home
    navigate('/');
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-48 bg-gray-800 text-white flex flex-col shadow-lg z-50">
      <div className="h-16 flex items-center justify-center text-2xl font-bold border-b border-gray-700">
        GradeBookX
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <button
          onClick={() => navigate('/teacherdashboard')}
          className="flex items-center w-full px-4 py-2 text-gray-100 bg-gray-900 rounded-md"
        >
          <span className="material-icons mr-3">dashboard</span>
          Dashboard
        </button>
        <button
          onClick={() => navigate('/addmarks')}
          className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
        >
          <span className="material-icons mr-3">add_circle_outline</span>
          Add Marks
        </button>
       
      </nav>
      <div className="px-4 py-6 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
        >
          <span className="material-icons mr-3">logout</span>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
