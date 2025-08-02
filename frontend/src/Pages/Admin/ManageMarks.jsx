import React, { useState, useEffect } from 'react';
import Sidebar from '../../Components/Admin/Sidebar';
import Header from '../../Components/Admin/Header';

const ManageMarks = () => {
  const [filters, setFilters] = useState({
    courseId: '',
    semester: '',
    division: '',
    subject: ''
  });
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [editingMark, setEditingMark] = useState(null);
  const [editValue, setEditValue] = useState('');

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString();
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (filters.courseId && filters.semester) {
      fetchDivisions();
    }
  }, [filters.courseId, filters.semester]);

  useEffect(() => {
    if (filters.courseId && filters.semester && filters.division) {
      fetchSubjects();
    }
  }, [filters.courseId, filters.semester, filters.division]);

  useEffect(() => {
    if (filters.courseId && filters.semester && filters.division && filters.subject) {
      fetchMarks();
    }
  }, [filters.courseId, filters.semester, filters.division, filters.subject]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/marks/admin/courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchDivisions = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/marks/admin/divisions?courseId=${filters.courseId}&semester=${filters.semester}`);
      const data = await response.json();
      setDivisions(data);
    } catch (error) {
      console.error('Error fetching divisions:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/marks/admin/subjects?courseId=${filters.courseId}&division=${filters.division}&semester=${filters.semester}`);
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchMarks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/marks/admin/marks?courseId=${filters.courseId}&division=${filters.division}&subject=${encodeURIComponent(filters.subject)}&semester=${filters.semester}`);
      const data = await response.json();
      setMarks(data);
    } catch (error) {
      console.error('Error fetching marks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'courseId' && { semester: '', division: '', subject: '' }),
      ...(name === 'semester' && { division: '', subject: '' }),
      ...(name === 'division' && { subject: '' })
    }));
  };

  const handleEdit = (mark) => {
    setEditingMark(mark.id);
    setEditValue(mark.marks);
  };

  const handleSave = async (markId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/marks/admin/update/${markId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marks: parseFloat(editValue) })
      });

      if (response.ok) {
        setEditingMark(null);
        setEditValue('');
        fetchMarks();
        alert('Marks updated successfully!');
      } else {
        alert('Error updating marks');
      }
    } catch (error) {
      console.error('Error updating marks:', error);
      alert('Error updating marks');
    }
  };

  const handleDelete = async (markId) => {
    if (window.confirm('Are you sure you want to delete this mark?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/marks/admin/delete/${markId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          fetchMarks();
          alert('Mark deleted successfully!');
        } else {
          alert('Error deleting mark');
        }
      } catch (error) {
        console.error('Error deleting mark:', error);
        alert('Error deleting mark');
      }
    }
  };

  const isComplete = filters.courseId && filters.semester && filters.division && filters.subject;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-48">
        <Header />
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Manage Marks</h2>
              <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
                <span className="font-semibold">Passing Criteria:</span> ≥40 marks | <span className="font-semibold text-red-700">Failed students highlighted in red</span>
              </div>
            </div>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                <select
                  name="courseId"
                  value={filters.courseId}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Course</option>
                  {courses.map(course => (
                    <option key={course.courseId} value={course.courseId}>
                      {course.courseName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                <select
                  name="semester"
                  value={filters.semester}
                  onChange={handleFilterChange}
                  disabled={!filters.courseId}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Select Semester</option>
                  {[1,2,3,4,5,6,7,8].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Division</label>
                <select
                  name="division"
                  value={filters.division}
                  onChange={handleFilterChange}
                  disabled={!filters.semester}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Select Division</option>
                  {divisions.map(div => (
                    <option key={div} value={div}>{div}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select
                  name="subject"
                  value={filters.subject}
                  onChange={handleFilterChange}
                  disabled={!filters.division}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subj => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Marks Table */}
            {!isComplete ? (
              <div className="text-center py-12">
                <span className="material-icons text-6xl text-gray-400 mb-4">filter_list</span>
                <p className="text-gray-500">Please select course, semester, division, and subject to view marks</p>
              </div>
            ) : loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading marks...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollment No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Joining</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {marks.length > 0 ? marks.map((mark) => {
                      const isFailed = mark.marks < 40;
                      return (
                      <tr key={mark.id} className={isFailed ? "bg-red-50" : ""}>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isFailed ? "text-red-900" : "text-gray-900"}`}>
                          {isFailed ? (
                            <span className="text-red-600 font-bold">NOT ELIGIBLE</span>
                          ) : (
                            mark.Student.studentName
                          )}
                          {isFailed && <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">FAILED</span>}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isFailed ? "text-red-700" : "text-gray-500"}`}>
                          {mark.Student.rollNo}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isFailed ? "text-red-700" : "text-gray-500"}`}>
                          {mark.Student.enrollmentNo}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isFailed ? "text-red-700" : "text-gray-500"}`}>
                          {formatDate(mark.Student.dateOfJoining)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isFailed ? "text-red-900" : "text-gray-900"}`}>
                          {editingMark === mark.id ? (
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <span className={`font-semibold ${isFailed ? "text-red-600" : ""}`}>{mark.marks}%</span>
                          )}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isFailed ? "text-red-700" : "text-gray-500"}`}>
                          {mark.teacherEmail}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {editingMark === mark.id ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSave(mark.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingMark(null)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(mark)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(mark.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                          No marks found for the selected criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageMarks;