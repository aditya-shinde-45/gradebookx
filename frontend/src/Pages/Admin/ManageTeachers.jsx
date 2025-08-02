import React, { useState, useEffect } from "react";
import Sidebar from "../../Components/Admin/Sidebar";
import Header from "../../Components/Admin/Header";

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState({ id: '', name: '', email: '' });

  useEffect(() => {
    fetchTeachers();
  }, [currentPage, searchTerm]);

  const fetchTeachers = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 5,
        ...(searchTerm && { search: searchTerm })
      });
      
      const response = await fetch(`http://localhost:5000/api/dashboard/manage/teachers?${params}`);
      const data = await response.json();
      
      setTeachers(data.teachers || []);
      setTotalPages(data.totalPages || 1);
      setTotalTeachers(data.total || 0);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleEdit = (teacher) => {
    setEditingTeacher({ id: teacher.id, name: teacher.name, email: teacher.email });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/dashboard/manage/teachers/${editingTeacher.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingTeacher.name, email: editingTeacher.email })
      });
      
      if (response.ok) {
        alert('Teacher updated successfully');
        setShowEditModal(false);
        fetchTeachers();
      } else {
        alert('Error updating teacher');
      }
    } catch (error) {
      console.error('Error updating teacher:', error);
      alert('Error updating teacher');
    }
  };

  const handleDelete = async (teacherId) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/dashboard/manage/teachers/${teacherId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        alert('Teacher deleted successfully');
        fetchTeachers();
      } else {
        alert('Error deleting teacher');
      }
    } catch (error) {
      console.error('Error deleting teacher:', error);
      alert('Error deleting teacher');
    }
  };

  return (
        <div className="flex h-screen bg-gray-100 font-[Poppins,sans-serif]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-y-auto lg:ml-48">
          {/* Header */}
          <Header />
 <div className="flex-1 p-6">
                    <div className="flex flex-wrap gap-6 mb-6">            <div>
              <h1 className="text-3xl font-bold text-gray-800">Manage Teachers</h1>
              <p className="text-gray-500 mt-1">A list of all the teachers in your school.</p>
            </div>
            <button className="flex items-center bg-gray-800 text-white px-6 py-3 rounded-lg shadow-md hover:bg-gray-900 transition duration-300">
              <span className="material-icons mr-2">add</span>
              Add New Teacher
            </button>
          </div>

          {/* Search Input */}
          <div className="relative mb-6">
            <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              search
            </span>
            <input
              type="text"
              placeholder="Search for a teacher..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
            />
          </div>

          {/* Teacher Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase">Teacher ID</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase">Full Name</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase">Email</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase">Password</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase">Subject(s)</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase">Assigned Class</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : teachers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      No teachers found
                    </td>
                  </tr>
                ) : (
                  teachers.map((teacher) => (
                    <tr key={teacher.id}>
                      <td className="px-6 py-4 text-gray-700 whitespace-nowrap">T{teacher.id}</td>
                      <td className="px-6 py-4 text-gray-900 font-medium whitespace-nowrap">{teacher.name}</td>
                      <td className="px-6 py-4 text-gray-700 whitespace-nowrap">{teacher.email}</td>
                      <td className="px-6 py-4 text-gray-700 whitespace-nowrap">{teacher.password}</td>
                      <td className="px-6 py-4 text-gray-700 whitespace-nowrap">{teacher.subjects}</td>
                      <td className="px-6 py-4 text-gray-700 whitespace-nowrap">{teacher.classes}</td>
                      <td className="px-6 py-4 text-center space-x-2 whitespace-nowrap">
                        <button 
                          onClick={() => handleEdit(teacher)}
                          className="text-blue-600 hover:text-blue-800 font-medium py-1 px-3 rounded-md transition duration-300"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(teacher.id)}
                          className="text-red-600 hover:text-red-800 font-medium py-1 px-3 rounded-md transition duration-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-gray-600">
              Showing {((currentPage - 1) * 5) + 1} to {Math.min(currentPage * 5, totalTeachers)} of {totalTeachers} entries
            </p>
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-gray-500 hover:bg-gray-200 rounded-md transition duration-300 disabled:opacity-50"
              >
                <span className="material-icons text-lg">chevron_left</span>
              </button>
              {Array.from({ length: Math.min(4, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 text-gray-700 rounded-md font-medium transition duration-300 ${
                      pageNum === currentPage ? "bg-gray-200" : "hover:bg-gray-200"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button 
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-gray-500 hover:bg-gray-200 rounded-md transition duration-300 disabled:opacity-50"
              >
                <span className="material-icons text-lg">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Edit Teacher Modal */}
        {showEditModal && (
        <div className="fixed inset-0 bg-trasperent-40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-lg font-semibold mb-4">Edit Teacher</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Teacher Name</label>
                <input 
                  type="text"
                  value={editingTeacher.name}
                  onChange={(e) => setEditingTeacher({...editingTeacher, name: e.target.value})}
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Email</label>
                <input 
                  type="email"
                  value={editingTeacher.email}
                  onChange={(e) => setEditingTeacher({...editingTeacher, email: e.target.value})}
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageTeachers;
