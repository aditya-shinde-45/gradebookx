// src/pages/TeacherDashboard.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from "../../Components/Teachers/Sidebar";
import Header from "../../Components/Teachers/Header";


const TeacherDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [classStats, setClassStats] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2024-25');
  const [filteredStudents, setFilteredStudents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teacherEmail = localStorage.getItem('teacherEmail');
        console.log('Teacher email from localStorage:', teacherEmail);
        
        if (!teacherEmail) {
          console.log('No teacher email found');
          setAssignments([]);
          setStudents([]);
          return;
        }
        
        // Fetch assignments
        const assignmentsResponse = await fetch(`http://localhost:5000/api/teacher/assignments?email=${encodeURIComponent(teacherEmail)}&academicYear=${selectedAcademicYear}`);
        const assignmentsData = await assignmentsResponse.json();
        setAssignments(assignmentsData);
        
        // Fetch class stats
        const classStatsResponse = await fetch(`http://localhost:5000/api/teacher/class-stats?email=${encodeURIComponent(teacherEmail)}&academicYear=${selectedAcademicYear}`);
        const classStatsData = await classStatsResponse.json();
        setClassStats(classStatsData);
        
        // Fetch students
        const studentsResponse = await fetch(`http://localhost:5000/api/teacher/students?email=${encodeURIComponent(teacherEmail)}&academicYear=${selectedAcademicYear}`);
        const studentsData = await studentsResponse.json();
        setStudents(studentsData);
        setFilteredStudents(studentsData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setAssignments([]);
        setStudents([]);
      } finally {
        setLoading(false);
        setStudentsLoading(false);
      }
    };

    fetchData();
  }, [selectedAcademicYear]);

  // Filter students based on search and filters
  useEffect(() => {
    let filtered = students;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(student => 
        student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply course filter
    if (selectedCourse) {
      filtered = filtered.filter(student => student.courseId === selectedCourse);
    }
    
    // Apply division filter
    if (selectedDivision) {
      filtered = filtered.filter(student => student.division === selectedDivision);
    }
    
    // Apply academic year filter
    if (selectedAcademicYear) {
      filtered = filtered.filter(student => student.academicYear === selectedAcademicYear);
    }
    
    setFilteredStudents(filtered);
  }, [students, searchTerm, selectedCourse, selectedDivision, selectedAcademicYear]);



  return (
    <div className="flex h-screen bg-gray-100 font-[Poppins,sans-serif]">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-y-auto lg:ml-48">
              <Header/>
        <div className="flex-1 p-8 overflow-y-auto">
          
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Classes Assigned</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Division</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">Loading...</td>
                    </tr>
                  ) : classStats.length > 0 ? (
                    classStats.map((classItem) => (
                      <tr key={classItem.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{classItem.academicYear || '2024-25'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{classItem.courseName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Sem {classItem.semester}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{classItem.division}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{classItem.subject}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {classItem.studentCount} students
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No assignments found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Students in Your Classes</h2>
            </div>
            
            {/* Filter and Search */}
            <div className="bg-white p-4 rounded-lg shadow mb-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <select
                    value={selectedAcademicYear}
                    onChange={(e) => setSelectedAcademicYear(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="2024-25">2024-25</option>
                    <option value="2023-24">2023-24</option>
                    <option value="2022-23">2022-23</option>
                  </select>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Search by name, roll no, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Courses</option>
                    {[...new Set(students.map(s => s.courseId))].map(courseId => {
                      const courseName = students.find(s => s.courseId === courseId)?.courseName;
                      return <option key={courseId} value={courseId}>{courseId} - {courseName}</option>
                    })}
                  </select>
                </div>
                <div>
                  <select
                    value={selectedDivision}
                    onChange={(e) => setSelectedDivision(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Divisions</option>
                    {[...new Set(students.map(s => s.division))].map(division => (
                      <option key={division} value={division}>{division}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollment No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course - Division</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {studentsLoading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">Loading students...</td>
                    </tr>
                  ) : filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <tr key={student.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.rollNo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.studentName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.enrollmentNo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.courseId} - {student.division}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No students found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default TeacherDashboard;
