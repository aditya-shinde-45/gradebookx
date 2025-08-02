import React from "react";

const Header = () => {
    return (
        <header className="bg-white border-b border-gray-200 flex items-center justify-end px-6 py-4">
            <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">Welcome, Admin</span>
                <button className="relative">
                    <span className="material-icons text-gray-600">notifications</span>
                    <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>
                <img
                    alt="Admin avatar"
                    className="h-9 w-9 rounded-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFMKygFpNguz1QSpi9e_VQxmZXCl91tXwGd9Rk0Obzj-YgUKHBGDM5x4XYE6-56LzYXzdwEHo8xUeeHi47xAyOVpmUObgIZ3ArXJtgc-V4lSijVQXq5W7cdZ9k-mXp7nL-jMHqrPRhlHNtOTQHA_9bbjfYsQ0KBC2f9TockepXOPDSjAMcxK9n_QZjVQ5lbVN9DC8Cg8Bk376-XkjAp9lIZUbVi-qw6Ha09Loc1LsJC5AASDGi6rt4tD0cibm0gGjjBr0XsfZ4jbv6"
                />
                <button className="text-sm font-medium text-gray-600 hover:text-indigo-600">
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;
