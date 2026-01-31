 import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    role: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { role, email, password } = formData;

    if (!role || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    let url = '';
    let payload = {};

    if (role === 'admin') {
      url = 'http://localhost:5000/api/auth/login';
      payload = { role, email, password };
    } else if (role === 'teacher') {
      url = 'http://localhost:5000/api/teacher/login';
      payload = { username: email, password };
    } else if (role === 'student') {
      url = 'http://localhost:5000/api/student/login';
      payload = { username: email, password };
    } else {
      setError('Invalid role selected.');
      return;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      console.log('Login successful:', data);

      // Store user data in localStorage based on role
      if (role === 'teacher') {
        localStorage.setItem('teacherEmail', data.email);
        localStorage.setItem('teacherName', data.name);
      }

      // Navigate based on role
      if (role === 'admin') navigate('/admindashboard');
      else if (role === 'teacher') navigate('/teacherdashboard');
      else if (role === 'student') navigate('/studentdashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="bg-gray-50 flex flex-col min-h-screen font-['Inter']">
      <header className="bg-gray-100 py-4 px-6 md:px-10">
        <div className="container mx-auto flex items-center">
          <span className="material-icons text-gray-700 text-3xl mr-3">hbj</span>
          <h1 className="text-2xl font-bold text-gray-800">strawhat</h1>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900"> mmmmm</h2>
            <p className="text-gray-500 mt-2">Please.</p>
          </div>

          {error && <div className="text-red-600 text-sm text-center">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Login as
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 p-3"
                required
              >
                <option value="">sxdfcgvhbjnhtfghbj</option>
                <option value="teacher">tiiidxgfvjhbjnjiiii</option>
                <option value="admin">ghcvhbj</option>
              </select>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {formData.role === 'admin' ? 'Admin Username' : 'Email Address'}
              </label>
              <input
                id="email"
                name="email"
                type="text"
                placeholder={formData.role === 'admin' ? 'admin' : 'you@example.com'}
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 p-3"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 p-3"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full text-white bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-400 font-medium rounded-lg text-sm px-5 py-3 text-center"
            >
              Login
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Login;
