// src/components/Header.jsx
import React from 'react';

const Header = () => {
  return (
    <header className="flex items-center justify-end h-16 bg-white border-b border-gray-200 px-8">
      <div className="flex items-center space-x-4">
        <span>Welcome, Admin</span>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <span className="material-icons text-gray-600">notifications</span>
        </button>
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="material-icons text-gray-600">person</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
