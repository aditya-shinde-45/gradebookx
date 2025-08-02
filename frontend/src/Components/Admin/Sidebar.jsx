import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    // If you are using localStorage/sessionStorage, clear it here
    // localStorage.removeItem("token");
    // sessionStorage.clear();

    navigate("/"); // Redirect to login or home
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-48 bg-slate-800 text-white flex flex-col z-50">
      <div className="h-16 flex items-center justify-center border-b border-slate-700">
        <span className="material-icons text-3xl mr-2">auto_stories</span>
        <h1 className="text-xl font-bold">GradeBookX</h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <Link
          to="/admindashboard"
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
            isActive("/admindashboard") ? "bg-slate-700" : "hover:bg-slate-700"
          }`}
        >
          <span className="material-icons mr-3">dashboard</span>
          Dashboard
        </Link>

        <Link
          to="/manageteachers"
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
            isActive("/manageteachers") ? "bg-slate-700" : "hover:bg-slate-700"
          }`}
        >
          <span className="material-icons mr-3">manage_accounts</span>
          Manage Teachers
        </Link>

        <Link
          to="/addcourse"
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
            isActive("/addcourse") ? "bg-slate-700" : "hover:bg-slate-700"
          }`}
        >
          <span className="material-icons mr-3">add_circle_outline</span>
          Add Course
        </Link>

        <Link
          to="/managemarks"
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
            isActive("/managemarks") ? "bg-slate-700" : "hover:bg-slate-700"
          }`}
        >
          <span className="material-icons mr-3">grading</span>
          Manage Marks
        </Link>

        <Link
          to="/gradesheet"
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
            isActive("/gradesheet") ? "bg-slate-700" : "hover:bg-slate-700"
          }`}
        >
          <span className="material-icons mr-3">receipt_long</span>
          Generate Grade Sheet
        </Link>

        <Link
          to="/studentprogression"
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
            isActive("/studentprogression") ? "bg-slate-700" : "hover:bg-slate-700"
          }`}
        >
          <span className="material-icons mr-3">trending_up</span>
          Student Progression
        </Link>
      </nav>

      <div className="px-4 py-6 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-2 text-sm font-medium rounded-lg hover:bg-slate-700 w-full text-left"
        >
          <span className="material-icons mr-3">logout</span>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
