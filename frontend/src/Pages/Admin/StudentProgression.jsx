import React, { useState, useEffect } from 'react';
import Sidebar from '../../Components/Admin/Sidebar';
import Header from '../../Components/Admin/Header';

const StudentProgression = () => {
  const [filters, setFilters] = useState({
    courseId: '',
    currentSemester: '',
    division: '',
    academicYear: '2024-25'
  });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [divisions, setDivisions] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (filters.courseId && filters.currentSemester && filters.academicYear) {
      fetchDivisions();
    }
  }, [filters.courseId, filters.currentSemester, filters.academicYear]);

  useEffect(() => {
    if (filters.courseId && filters.currentSemester && filters.division && filters.academicYear) {
      fetchStudentProgression();
    }
  }, [filters.courseId, filters.currentSemester, filters.division, filters.academicYear]);

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
      const response = await fetch(`http://localhost:5000/api/marks/admin/divisions?courseId=${filters.courseId}&semester=${filters.currentSemester}&academicYear=${filters.academicYear}`);
      const data = await response.json();
      setDivisions(data);
    } catch (error) {
      console.error('Error fetching divisions:', error);
    }
  };

  const fetchStudentProgression = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/students/progression?courseId=${filters.courseId}&semester=${filters.currentSemester}&division=${filters.division}&academicYear=${filters.academicYear}`);
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching student progression:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'courseId' && { currentSemester: '', division: '' }),
      ...(name === 'currentSemester' && { division: '' }),
      ...(name === 'academicYear' && { courseId: '', currentSemester: '', division: '' })
    }));
  };

  const getNextSemesterDisplay = (student) => {
    if (student.status === 'failed') {
      return <span className="text-red-600 font-bold">NOT ELIGIBLE</span>;
    }
    return `Semester ${parseInt(filters.currentSemester) + 1}`;
  };

  return (
    <div className="flex h-screen bg-gray-100 font-[Poppins,sans-serif]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto lg:ml-48">
        <Header />
        <div className="p-8">
          {/* Filter Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Student Progression Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                <select
                  name="academicYear"
                  value={filters.academicYear}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="2024-25">2024-25</option>
                  <option value="2023-24">2023-24</option>
                  <option value="2022-23">2022-23</option>
                </select>
              </div>
              
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Semester</label>
                <select
                  name="currentSemester"
                  value={filters.currentSemester}
                  onChange={handleFilterChange}
                  disabled={!filters.courseId || !filters.academicYear}
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
                  disabled={!filters.currentSemester || !filters.academicYear}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Select Division</option>
                  {divisions.map(div => (
                    <option key={div} value={div}>Division {div}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading student progression...</p>
              </div>
            ) : filters.courseId && filters.currentSemester && filters.division && filters.academicYear ? (
              <>
                <div className="mb-4">
                  <h3 className="text-xl font-semibold">
                    Progression from Semester {filters.currentSemester} to Semester {parseInt(filters.currentSemester) + 1}
                  </h3>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-gray-600">Academic Year: {filters.academicYear} | Course: {courses.find(c => c.courseId === filters.courseId)?.courseName} - Division {filters.division}</p>
                    <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
                      <span className="font-semibold">Note:</span> Students with failed subjects (marks &lt; 40) are not eligible for next semester
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-gray-500 border-b">
                        <th className="py-3 px-4 font-medium">Roll No.</th>
                        <th className="py-3 px-4 font-medium">Current Student Name</th>
                        <th className="py-3 px-4 font-medium">Current Status</th>
                        <th className="py-3 px-4 font-medium">Next Semester Eligibility</th>
                        <th className="py-3 px-4 font-medium">Next Semester Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.length > 0 ? students.map((student) => {
                        const isFailed = student.status === 'failed';
                        return (
                        <tr key={student.id} className={`border-b border-gray-200 hover:bg-gray-50 ${isFailed ? 'bg-red-50' : 'bg-green-50'}`}>
                          <td className="py-4 px-4">{student.rollNo}</td>
                          <td className={`py-4 px-4 ${isFailed ? 'text-red-900 font-semibold' : 'text-green-900'}`}>
                            {student.studentName}
                          </td>
                          <td className="py-4 px-4">
                            {isFailed ? (
                              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">FAILED</span>
                            ) : (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">PASSED</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {isFailed ? (
                              <span className="text-red-600 font-bold">NOT ELIGIBLE</span>
                            ) : (
                              <span className="text-green-600 font-bold">ELIGIBLE</span>
                            )}
                          </td>
                          <td className={`py-4 px-4 font-semibold ${isFailed ? 'text-red-600' : 'text-green-600'}`}>
                            {getNextSemesterDisplay(student)}
                          </td>
                        </tr>
                      )}) : (
                        <tr>
                          <td colSpan="5" className="py-4 px-4 text-center text-gray-500">No students found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Please select academic year, course, semester, and division to view student progression</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProgression;