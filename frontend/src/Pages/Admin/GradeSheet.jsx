import React, { useState, useEffect } from "react";
import Sidebar from "../../Components/Admin/Sidebar";
import Header from "../../Components/Admin/Header";

const GradeSheet = () => {
  const [filters, setFilters] = useState({
    courseId: '',
    semester: '',
    division: '',
    academicYear: '2024-25'
  });
  const [gradesheet, setGradesheet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [courses, setCourses] = useState([]);
  const [divisions, setDivisions] = useState([]);

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
    if (filters.courseId && filters.semester && filters.academicYear) {
      fetchDivisions();
    }
  }, [filters.courseId, filters.semester, filters.academicYear]);

  useEffect(() => {
    if (filters.courseId && filters.semester && filters.division && filters.academicYear) {
      fetchGradesheet();
    }
  }, [filters.courseId, filters.semester, filters.division, filters.academicYear]);

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
      const response = await fetch(`http://localhost:5000/api/marks/admin/divisions?courseId=${filters.courseId}&semester=${filters.semester}&academicYear=${filters.academicYear}`);
      const data = await response.json();
      setDivisions(data);
    } catch (error) {
      console.error('Error fetching divisions:', error);
    }
  };

  const fetchGradesheet = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/marks/gradesheet?courseId=${filters.courseId}&division=${filters.division}&semester=${filters.semester}&academicYear=${filters.academicYear}`);
      const data = await response.json();
      setGradesheet(data);
    } catch (error) {
      console.error('Error fetching gradesheet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'courseId' && { semester: '', division: '' }),
      ...(name === 'semester' && { division: '' }),
      ...(name === 'academicYear' && { courseId: '', semester: '', division: '' })
    }));
  };

  const filteredStudents = gradesheet?.students?.filter(student =>
    student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNo.includes(searchTerm)
  ) || [];

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  const generatePDF = async (student) => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text('Grade Sheet Report', 20, 20);
      
      doc.setFontSize(12);
      doc.text(`Course: ${gradesheet.courseName || gradesheet.courseId} - Semester: ${gradesheet.semester} - Division: ${gradesheet.division}`, 20, 35);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
      
      // Student Info
      doc.setFontSize(14);
      doc.text('Student Information:', 20, 65);
      doc.setFontSize(12);
      const hasFailedSubjects = gradesheet.subjects.some(subject => {
        const mark = student.marks[subject];
        return mark === 'NOT ELIGIBLE' || (typeof mark === 'number' && mark < 40);
      });
      doc.text(`Name: ${student.studentName}`, 20, 80);
      doc.text(`Roll No: ${student.rollNo}`, 20, 90);
      doc.text(`Enrollment No: ${student.enrollmentNo}`, 20, 100);
      doc.text(`Date of Joining: ${formatDate(student.dateOfJoining)}`, 20, 110);
      doc.text(`Rank: ${student.rank}`, 20, 120);
      
      // Marks Table
      doc.setFontSize(14);
      doc.text('Subject-wise Marks:', 20, 140);
      
      let yPos = 155;
      doc.setFontSize(12);
      doc.text('Subject', 20, yPos);
      doc.text('Marks', 100, yPos);
      doc.text('Max Marks', 140, yPos);
      
      yPos += 10;
      doc.line(20, yPos, 180, yPos);
      yPos += 10;
      
      gradesheet.subjects.forEach(subject => {
        const mark = student.marks[subject];
        const isNotEligible = mark === 'NOT ELIGIBLE';
        const isFailed = typeof mark === 'number' && mark < 40;
        doc.text(subject, 20, yPos);
        if (isNotEligible) {
          doc.setTextColor(255, 0, 0); // Red color for not eligible
          doc.text('NOT ELIGIBLE', 100, yPos);
          doc.setTextColor(0, 0, 0); // Reset to black
        } else if (isFailed) {
          doc.setTextColor(255, 0, 0); // Red color for failed subjects
          doc.text(`${mark} (FAILED)`, 100, yPos);
          doc.setTextColor(0, 0, 0); // Reset to black
        } else {
          doc.text(mark.toString(), 100, yPos);
        }
        doc.text('100', 140, yPos);
        yPos += 10;
      });
      
      yPos += 5;
      doc.line(20, yPos, 180, yPos);
      yPos += 10;
      
      // Total
      doc.setFontSize(12);
      doc.text('Total Marks:', 20, yPos);
      doc.text(`${student.totalMarks}/${student.maxMarks}`, 100, yPos);
      yPos += 10;
      doc.text('Percentage:', 20, yPos);
      doc.text(`${student.percentage}%`, 100, yPos);
      
      // Add legend for failed subjects
      yPos += 20;
      doc.setFontSize(10);
      doc.setTextColor(255, 0, 0);
      doc.text('Note: Subjects marked as "FAILED" indicate marks below 40 (passing criteria)', 20, yPos);
      doc.setTextColor(0, 0, 0);
      
      doc.save(`${hasFailedSubjects ? 'NOT_ELIGIBLE' : student.studentName}_GradeSheet.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const exportAllPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(16);
      doc.text(`Course: ${gradesheet.courseName || gradesheet.courseId} - Semester ${gradesheet.semester} - Division ${gradesheet.division} Grade Sheet`, 20, 20);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
      
      // Table headers
      let yPos = 50;
      doc.setFontSize(8);
      doc.text('Rank', 10, yPos);
      doc.text('Roll', 25, yPos);
      doc.text('Name', 40, yPos);
      
      let xPos = 90;
      gradesheet.subjects.forEach(subject => {
        doc.text(subject.substring(0, 6), xPos, yPos);
        xPos += 18;
      });
      doc.text('Total', xPos, yPos);
      doc.text('%', xPos + 12, yPos);
      
      yPos += 5;
      doc.line(10, yPos, 200, yPos);
      yPos += 5;
      
      // Student data
      filteredStudents.forEach(student => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.text(student.rank.toString(), 10, yPos);
        doc.text(student.rollNo, 25, yPos);
        const hasFailedSubjects = gradesheet.subjects.some(subject => (student.marks[subject] || 0) < 40);
        doc.text(hasFailedSubjects ? 'NOT ELIGIBLE' : student.studentName.substring(0, 12), 40, yPos);
        doc.text(formatDate(student.dateOfJoining).substring(0, 8), 65, yPos);
        
        xPos = 90;
        gradesheet.subjects.forEach(subject => {
          const mark = student.marks[subject] || 0;
          const isFailed = mark < 40;
          if (isFailed) {
            doc.setTextColor(255, 0, 0); // Red for failed subjects
            doc.text(`${mark}*`, xPos, yPos);
            doc.setTextColor(0, 0, 0); // Reset to black
          } else {
            doc.text(mark.toString(), xPos, yPos);
          }
          xPos += 18;
        });
        doc.text(student.totalMarks.toString(), xPos, yPos);
        doc.text(student.percentage.toString(), xPos + 12, yPos);
        
        yPos += 8;
      });
      
      // Add legend
      yPos += 10;
      doc.setFontSize(8);
      doc.setTextColor(255, 0, 0);
      doc.text('Note: * indicates failed subjects (marks < 40)', 10, yPos);
      doc.setTextColor(0, 0, 0);
      
      doc.save(`${gradesheet.courseName || gradesheet.courseId}_Sem${gradesheet.semester}_Div${gradesheet.division}_GradeSheet.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-[Poppins,sans-serif]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto lg:ml-48">
        <Header />
        <div className="p-8">
          {/* Filter Section */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative w-full max-w-xs">
              <span className="absolute left-3 top-2.5 text-gray-400 material-icons">search</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search student..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-4 ml-4">
              <select 
                name="academicYear"
                value={filters.academicYear}
                onChange={handleFilterChange}
                className="py-2 px-3 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:outline-none"
              >
                <option value="2024-25">2024-25</option>
                <option value="2023-24">2023-24</option>
                <option value="2022-23">2022-23</option>
              </select>
              <select 
                name="courseId"
                value={filters.courseId}
                onChange={handleFilterChange}
                disabled={!filters.academicYear}
                className="py-2 px-3 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course.courseId} value={course.courseId}>
                    {course.courseName}
                  </option>
                ))}
              </select>
              <select 
                name="semester"
                value={filters.semester}
                onChange={handleFilterChange}
                disabled={!filters.courseId}
                className="py-2 px-3 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
              >
                <option value="">Select Semester</option>
                {[1,2,3,4,5,6,7,8].map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
              <select 
                name="division"
                value={filters.division}
                onChange={handleFilterChange}
                disabled={!filters.semester}
                className="py-2 px-3 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
              >
                <option value="">Select Division</option>
                {divisions.map(div => (
                  <option key={div} value={div}>Division {div}</option>
                ))}
              </select>
              <button
                onClick={exportAllPDF}
                disabled={!gradesheet || loading}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
              >
                Export All PDF
              </button>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading gradesheet...</p>
              </div>
            ) : gradesheet && filters.courseId && filters.semester && filters.division ? (
              <>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold">Course: {gradesheet.courseName || gradesheet.courseId} - Semester {gradesheet.semester} - Division {gradesheet.division}</h2>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600">Academic Year: {gradesheet.academicYear} | Total Students: {gradesheet.totalStudents}</p>
                    <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
                      <span className="font-semibold">Passing Criteria:</span> ≥40 marks | <span className="font-semibold text-red-700">Failed students highlighted in red</span>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-gray-500 border-b">
                        <th className="py-3 px-4 font-medium">Rank</th>
                        <th className="py-3 px-4 font-medium">Roll No.</th>
                        <th className="py-3 px-4 font-medium">Student Name</th>
                        <th className="py-3 px-4 font-medium">Date of Joining</th>
                        {gradesheet.subjects.map(subject => (
                          <th key={subject} className="py-3 px-4 font-medium text-center">{subject}</th>
                        ))}
                        <th className="py-3 px-4 font-medium text-center">Total</th>
                        <th className="py-3 px-4 font-medium text-center">%</th>
                        <th className="py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => {
                        const hasFailedSubjects = gradesheet.subjects.some(subject => (student.marks[subject] || 0) < 40);
                        return (
                        <tr key={student.id} className={`border-b border-gray-200 hover:bg-gray-50 ${hasFailedSubjects ? 'bg-red-50' : ''}`}>
                          <td className="py-4 px-4 font-semibold">{hasFailedSubjects ? '-' : student.rank}</td>
                          <td className="py-4 px-4">{student.rollNo}</td>
                          <td className={`py-4 px-4 ${hasFailedSubjects ? 'text-red-900 font-semibold' : ''}`}>
                            {student.studentName}
                            {hasFailedSubjects && <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">NOT ELIGIBLE</span>}
                          </td>
                          <td className={`py-4 px-4 ${hasFailedSubjects ? 'text-red-700' : ''}`}>
                            {formatDate(student.dateOfJoining)}
                          </td>
                          {gradesheet.subjects.map(subject => {
                            const mark = student.marks[subject];
                            const isNotEligible = mark === 'NOT ELIGIBLE';
                            const isFailed = typeof mark === 'number' && mark < 40;
                            return (
                            <td key={subject} className={`py-4 px-4 text-center ${isNotEligible ? 'text-red-600 font-bold bg-red-100' : isFailed ? 'text-red-600 font-bold bg-red-100' : ''}`}>
                              {mark}
                            </td>
                          )})}
                          <td className={`py-4 px-4 text-center font-semibold ${hasFailedSubjects ? 'text-red-600' : ''}`}>{student.totalMarks}</td>
                          <td className={`py-4 px-4 text-center font-semibold ${hasFailedSubjects ? 'text-red-600' : ''}`}>{typeof student.percentage === 'number' ? student.percentage + '%' : student.percentage}</td>
                          <td className="py-4 px-4">
                            <button
                              onClick={() => handleViewDetails(student)}
                              className="text-blue-600 hover:underline mr-2"
                            >
                              View
                            </button>
                            <button
                              onClick={() => generatePDF(student)}
                              className="text-green-600 hover:underline"
                            >
                              Export PDF
                            </button>
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedStudent && (
        <div className="fixed inset-0 bg-trasperent-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Student Details</h3>
            <div className="space-y-2">
              <p><strong>Name:</strong> {gradesheet.subjects.some(subject => (selectedStudent.marks[subject] || 0) < 40) ? 'NOT ELIGIBLE' : selectedStudent.studentName}</p>
              <p><strong>Roll No:</strong> {selectedStudent.rollNo}</p>
              <p><strong>Enrollment No:</strong> {selectedStudent.enrollmentNo}</p>
              <p><strong>Date of Joining:</strong> {formatDate(selectedStudent.dateOfJoining)}</p>
              <p><strong>Rank:</strong> {selectedStudent.rank}</p>
              <p><strong>Total Marks:</strong> {selectedStudent.totalMarks}/{selectedStudent.maxMarks}</p>
              <p><strong>Percentage:</strong> {selectedStudent.percentage}%</p>
              
              <div className="mt-4">
                <h4 className="font-medium mb-2">Subject-wise Marks:</h4>
                {gradesheet.subjects.map(subject => {
                  const mark = selectedStudent.marks[subject] || 0;
                  const isFailed = mark < 40;
                  return (
                  <div key={subject} className={`flex justify-between ${isFailed ? 'text-red-600 font-semibold' : ''}`}>
                    <span>{subject}:</span>
                    <span>{mark}/100 {isFailed && '(FAILED)'}</span>
                  </div>
                )})}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => generatePDF(selectedStudent)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Export PDF
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeSheet;