// src/pages/AddMarks.jsx
import React, { useState, useEffect } from "react";

import Sidebar from "../../Components/Teachers/Sidebar";
import Header from "../../Components/Teachers/Header";


export default function AddMarks() {
  const [filters, setFilters] = useState({
    academicYear: "2024-25",
    courseId: "",
    semester: "",
    division: "",
    subject: "",
  });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [teacherSubjects, setTeacherSubjects] = useState([]);
  const [marks, setMarks] = useState({});

  useEffect(() => {
    const fetchTeacherSubjects = async () => {
      try {
        const teacherEmail = localStorage.getItem('teacherEmail');
        console.log('Teacher email from localStorage:', teacherEmail);
        
        if (teacherEmail) {
          const response = await fetch(`http://localhost:5000/api/marks/teacher-subjects?email=${encodeURIComponent(teacherEmail)}`);
          const data = await response.json();
          console.log('Teacher subjects data:', data);
          setTeacherSubjects(data);
        } else {
          console.log('No teacher email found in localStorage');
        }
      } catch (error) {
        console.error('Error fetching teacher subjects:', error);
      }
    };
    fetchTeacherSubjects();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'academicYear' && { courseId: '', semester: '', division: '', subject: '' }),
      ...(name === 'courseId' && { semester: '', division: '', subject: '' }),
      ...(name === 'semester' && { division: '', subject: '' }),
      ...(name === 'division' && { subject: '' })
    }));
  };

  const fetchStudents = async () => {
    if (!filters.academicYear || !filters.courseId || !filters.semester || !filters.division || !filters.subject) return;
    
    setLoading(true);
    try {
      const teacherEmail = localStorage.getItem('teacherEmail');
      const response = await fetch(
        `http://localhost:5000/api/marks/students?courseId=${filters.courseId}&division=${filters.division}&subject=${encodeURIComponent(filters.subject)}&semester=${filters.semester}&academicYear=${filters.academicYear}&teacherEmail=${encodeURIComponent(teacherEmail)}`
      );
      const data = await response.json();
      setStudents(data);
      
      // Initialize marks state
      const initialMarks = {};
      data.forEach(student => {
        initialMarks[student.id] = student.marks || '';
      });
      setMarks(initialMarks);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [filters.courseId, filters.semester, filters.division, filters.subject, filters.academicYear]);

  const handleMarksChange = (studentId, value) => {
    setMarks({ ...marks, [studentId]: value });
  };

  const submitMarks = async () => {
    try {
      const teacherEmail = localStorage.getItem('teacherEmail');
      const marksData = Object.entries(marks)
        .filter(([_, mark]) => mark !== '')
        .map(([studentId, mark]) => ({
          studentId: parseInt(studentId),
          marks: parseFloat(mark)
        }));

      const response = await fetch('http://localhost:5000/api/marks/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: filters.courseId,
          division: filters.division,
          subject: filters.subject,
          semester: filters.semester,
          academicYear: filters.academicYear,
          teacherEmail,
          marksData
        })
      });

      const result = await response.json();
      if (response.ok) {
        alert('Marks submitted successfully!');
        fetchStudents(); // Refresh data
      } else {
        alert(result.message || 'Error submitting marks');
      }
    } catch (error) {
      console.error('Error submitting marks:', error);
      alert('Error submitting marks');
    }
  };

  const resetForm = () => {
    setMarks({});
    fetchStudents();
  };

  const isComplete = filters.academicYear && filters.courseId && filters.semester && filters.division && filters.subject;
  const uniqueCourses = teacherSubjects.reduce((acc, subject) => {
    if (!acc.find(c => c.id === subject.courseId)) {
      acc.push({ id: subject.courseId, name: subject.courseName });
    }
    return acc;
  }, []);
  
  const uniqueSemesters = [...new Set(teacherSubjects.filter(s => s.courseId === filters.courseId).map(s => s.semester))];
  const uniqueDivisions = [...new Set(teacherSubjects.filter(s => s.courseId === filters.courseId && s.semester == filters.semester).map(s => s.division))];
  const availableSubjects = teacherSubjects.filter(s => s.courseId === filters.courseId && s.semester == filters.semester && s.division === filters.division);

  return (
     <div className="flex h-screen bg-gray-100 font-[Poppins,sans-serif]">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-y-auto lg:ml-48">
              < Header/>
        <div className="flex-1 p-8">
          <div className="bg-white p-8 rounded-lg shadow-md">
            {/* Filter Form */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                <select
                  name="academicYear"
                  value={filters.academicYear}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  <option value="2024-25">2024-25</option>
                  <option value="2023-24">2023-24</option>
                  <option value="2022-23">2022-23</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select
                  name="courseId"
                  value={filters.courseId}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  <option value="">Select Course</option>
                  {uniqueCourses.map((course) => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <select
                  name="semester"
                  value={filters.semester}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  disabled={!filters.courseId || !filters.academicYear}
                >
                  <option value="">Select Semester</option>
                  {uniqueSemesters.map((sem) => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                <select
                  name="division"
                  value={filters.division}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  disabled={!filters.semester || !filters.academicYear}
                >
                  <option value="">Select Division</option>
                  {uniqueDivisions.map((div) => (
                    <option key={div} value={div}>{div}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select
                  name="subject"
                  value={filters.subject}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  disabled={!filters.division || !filters.academicYear}
                >
                  <option value="">Select Subject</option>
                  {availableSubjects.map((subj) => (
                    <option key={subj.subject} value={subj.subject}>{subj.subject}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Placeholder or Table */}
            {!isComplete ? (
              <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed border-gray-300 rounded-lg">
                <span className="material-icons text-6xl text-gray-400 mb-4">filter_list</span>
                <p className="text-gray-500 text-lg">Please select academic year, course, semester, division, and subject to view student data.</p>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="text-gray-500 mt-4">Loading students...</p>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="py-4 px-6 text-sm font-medium text-gray-500">#</th>
                        <th className="py-4 px-6 text-sm font-medium text-gray-500">Full Name</th>
                        <th className="py-4 px-6 text-sm font-medium text-gray-500">Roll No</th>
                        <th className="py-4 px-6 text-sm font-medium text-gray-500">Enrollment No</th>
                        <th className="py-4 px-6 text-sm font-medium text-gray-500">Marks (%) <span className="text-red-500 text-xs">(Pass: ≥40)</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.length > 0 ? students.map((student, i) => {
                        const currentMark = marks[student.id] || student.marks || '';
                        const isFailed = currentMark !== '' && parseFloat(currentMark) < 40;
                        return (
                        <tr key={student.id} className={`border-b border-gray-200 hover:bg-gray-50 ${isFailed ? 'bg-red-50' : ''}`}>
                          <td className="py-4 px-6">{i + 1}</td>
                          <td className={`py-4 px-6 ${isFailed ? 'text-red-900 font-semibold' : ''}`}>
                            {isFailed ? (
                              <span className="text-red-600 font-bold">NOT ELIGIBLE</span>
                            ) : (
                              student.studentName
                            )}
                            {isFailed && <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">FAILED</span>}
                          </td>
                          <td className={`py-4 px-6 ${isFailed ? 'text-red-700' : ''}`}>{student.rollNo}</td>
                          <td className={`py-4 px-6 ${isFailed ? 'text-red-700' : ''}`}>{student.enrollmentNo}</td>
                          <td className="py-4 px-6">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={marks[student.id] || ''}
                              onChange={(e) => handleMarksChange(student.id, e.target.value)}
                              className={`w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 ${isFailed ? 'border-red-300 focus:ring-red-500 text-red-600' : 'border-gray-300 focus:ring-indigo-500'}`}
                              placeholder="0-100"
                            />
                          </td>
                        </tr>
                      )}) : (
                        <tr>
                          <td colSpan="5" className="py-4 px-6 text-center text-gray-500">No students found for this class</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>



                <div className="flex justify-end mt-8 space-x-4">
                  <button 
                    onClick={submitMarks}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Submit Marks
                  </button>
                  <button 
                    onClick={resetForm}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  >
                    Reset Form
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
