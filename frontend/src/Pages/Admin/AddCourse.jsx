import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../Components/Admin/Sidebar";
import Header from "../../Components/Admin/Header";

const AddCourse = () => {
  const [academicYear, setAcademicYear] = useState("2024-25");
  const [courseId, setCourseId] = useState("");
  const [courseName, setCourseName] = useState("");
  const [semester, setSemester] = useState("");
  const [subjects, setSubjects] = useState([""]);
  const [divisions, setDivisions] = useState([
    {
      name: "",
      subjectTeachers: [
        {
          subjectName: "",
          name: "",
          email: "",
          password: "",
        },
      ],
    },
  ]);

  const [courses, setCourses] = useState([]);
  const [uploadCourses, setUploadCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchUploadCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/courses");
      setCourses(res.data);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    }
  };

  const fetchUploadCourses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/students/courses-for-upload");
      setUploadCourses(res.data);
    } catch (error) {
      console.error("Failed to fetch upload courses:", error);
    }
  };

  const deleteCourse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/courses/${id}`);
      alert("Course deleted!");
      fetchCourses();
    } catch (error) {
      console.error("Failed to delete course:", error);
      alert("Error deleting course.");
    }
  };

  const handleSubjectChange = (index, value) => {
    const updated = [...subjects];
    updated[index] = value;
    setSubjects(updated);
  };

  const addSubject = () => {
    setSubjects([...subjects, ""]);
  };

  const handleDivisionChange = (index, field, value) => {
    const updated = [...divisions];
    updated[index][field] = value;
    setDivisions(updated);
  };

  const handleTeacherChange = (divIndex, teacherIndex, field, value) => {
    const updatedDivs = [...divisions];
    updatedDivs[divIndex].subjectTeachers[teacherIndex][field] = value;
    setDivisions(updatedDivs);
  };

  const addDivision = () => {
    setDivisions([
      ...divisions,
      {
        name: "",
        subjectTeachers: [
          {
            subjectName: "",
            name: "",
            email: "",
            password: "",
          },
        ],
      },
    ]);
  };

  const addTeacherToDivision = (divIndex) => {
    const updatedDivs = [...divisions];
    updatedDivs[divIndex].subjectTeachers.push({
      subjectName: "",
      name: "",
      email: "",
      password: "",
    });
    setDivisions(updatedDivs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!courseId.trim() || !courseName.trim() || !semester) {
      alert('Please fill in Course ID, Course Name, and Semester');
      return;
    }
    
    // Filter out empty subjects
    const validSubjects = subjects.filter(s => s.trim() !== '');
    if (validSubjects.length === 0) {
      alert('Please add at least one subject');
      return;
    }
    
    // Validate divisions
    const validDivisions = divisions.filter(div => {
      return div.name.trim() !== '' && div.subjectTeachers.some(teacher => 
        teacher.subjectName.trim() !== '' && 
        teacher.name.trim() !== '' && 
        teacher.email.trim() !== '' && 
        teacher.password.trim() !== ''
      );
    });
    
    if (validDivisions.length === 0) {
      alert('Please add at least one division with complete teacher information');
      return;
    }
    
    const payload = {
      courseId: courseId.trim(),
      courseName: courseName.trim(),
      academicYear: academicYear,
      semester: parseInt(semester),
      subjects: validSubjects,
      divisions: validDivisions.map(div => ({
        ...div,
        name: div.name.trim(),
        subjectTeachers: div.subjectTeachers.filter(teacher => 
          teacher.subjectName.trim() !== '' && 
          teacher.name.trim() !== '' && 
          teacher.email.trim() !== '' && 
          teacher.password.trim() !== ''
        )
      }))
    };

    try {
      const response = await axios.post("http://localhost:5000/api/courses/add", payload);
      alert("Course added successfully!");
      
      // Reset form
      setCourseId('');
      setCourseName('');
      setSemester('');
      setSubjects(['']);
      setDivisions([{
        name: '',
        subjectTeachers: [{
          subjectName: '',
          name: '',
          email: '',
          password: ''
        }]
      }]);
      
      fetchCourses();
      fetchUploadCourses();
    } catch (error) {
      console.error("Error adding course:", error);
      alert(error.response?.data?.message || "Failed to add course.");
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!csvFile || !selectedCourse || !selectedDivision || !selectedSemester) {
      alert('Please select course, division, semester and CSV file');
      return;
    }

    setUploadLoading(true);
    const formData = new FormData();
    formData.append('csvFile', csvFile);
    formData.append('courseId', selectedCourse);
    formData.append('division', selectedDivision);
    formData.append('semester', selectedSemester);
    formData.append('academicYear', academicYear);

    try {
      const response = await axios.post('http://localhost:5000/api/students/upload-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(response.data.message);
      setCsvFile(null);
      setSelectedCourse('');
      setSelectedDivision('');
      setSelectedSemester('');
      document.getElementById('csvFileInput').value = '';
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload students');
    } finally {
      setUploadLoading(false);
    }
  };

  const getUniqueCourses = () => {
    const unique = [];
    const seen = new Set();
    uploadCourses.forEach(course => {
      const key = `${course.courseId}-${course.courseName}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(course);
      }
    });
    return unique;
  };

  const getAvailableDivisions = () => {
    if (!selectedCourse) return [];
    return uploadCourses.filter(course => course.courseId === selectedCourse)
      .map(course => ({ division: course.division, semester: course.semester }));
  };

  return (
    <div className="flex h-screen bg-gray-100 font-[Poppins,sans-serif]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto lg:ml-48">
        <Header />
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Add Course</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="border px-3 py-2 w-full rounded"
              required
            >
              <option value="2024-25">2024-25</option>
              <option value="2023-24">2023-24</option>
              <option value="2022-23">2022-23</option>
            </select>
            <input
              type="text"
              placeholder="Course ID (e.g., NAPS-ITI)"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="border px-3 py-2 w-full rounded"
              required
            />
            <input
              type="text"
              placeholder="Course Name (e.g., NAPS ITI)"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="border px-3 py-2 w-full rounded"
              required
            />
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="border px-3 py-2 w-full"
              required
            >
              <option value="">Select Semester</option>
              {[1,2,3,4,5,6,7,8].map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>

            <div>
              <h3 className="font-semibold">Subjects</h3>
              {subjects.map((subject, idx) => (
                <input
                  key={idx}
                  type="text"
                  placeholder={`Subject ${idx + 1}`}
                  value={subject}
                  onChange={(e) => handleSubjectChange(idx, e.target.value)}
                  className="border px-2 py-1 mt-1 w-full"
                />
              ))}
              <button type="button" onClick={addSubject} className="mt-2 text-blue-600">
                + Add Subject
              </button>
            </div>

            <div>
              <h3 className="font-semibold">Divisions</h3>
              {divisions.map((division, divIdx) => (
                <div key={divIdx} className="border p-4 mt-4">
                  <input
                    type="text"
                    placeholder="Division Name"
                    value={division.name}
                    onChange={(e) =>
                      handleDivisionChange(divIdx, "name", e.target.value)
                    }
                    className="border px-2 py-1 w-full mb-2"
                  />

                  {division.subjectTeachers.map((teacher, tIdx) => (
                    <div key={tIdx} className="mb-2">
                      <input
                        type="text"
                        placeholder="Subject Name"
                        value={teacher.subjectName}
                        onChange={(e) =>
                          handleTeacherChange(divIdx, tIdx, "subjectName", e.target.value)
                        }
                        className="border px-2 py-1 mr-2"
                      />
                      <input
                        type="text"
                        placeholder="Teacher Name"
                        value={teacher.name}
                        onChange={(e) =>
                          handleTeacherChange(divIdx, tIdx, "name", e.target.value)
                        }
                        className="border px-2 py-1 mr-2"
                      />
                      <input
                        type="email"
                        placeholder="Teacher Email"
                        value={teacher.email}
                        onChange={(e) =>
                          handleTeacherChange(divIdx, tIdx, "email", e.target.value)
                        }
                        className="border px-2 py-1 mr-2"
                      />
                      <input
                        type="password"
                        placeholder="Password"
                        value={teacher.password}
                        onChange={(e) =>
                          handleTeacherChange(divIdx, tIdx, "password", e.target.value)
                        }
                        className="border px-2 py-1"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addTeacherToDivision(divIdx)}
                    className="text-blue-600 mt-2"
                  >
                    + Add Teacher
                  </button>
                </div>
              ))}
              <button type="button" onClick={addDivision} className="mt-4 text-blue-700">
                + Add Division
              </button>
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
            >
              Submit
            </button>
          </form>

          {/* Student Upload Section */}
          <div className="mt-12 bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Upload Student Data</h3>
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="border px-3 py-2 rounded"
                  required
                >
                  <option value="2024-25">2024-25</option>
                  <option value="2023-24">2023-24</option>
                  <option value="2022-23">2022-23</option>
                </select>
                <select
                  value={selectedCourse}
                  onChange={(e) => {
                    setSelectedCourse(e.target.value);
                    setSelectedDivision('');
                    setSelectedSemester('');
                  }}
                  className="border px-3 py-2 rounded"
                  required
                >
                  <option value="">Select Course</option>
                  {getUniqueCourses().map((course, idx) => (
                    <option key={idx} value={course.courseId}>
                      {course.courseId} - {course.courseName}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedDivision}
                  onChange={(e) => {
                    setSelectedDivision(e.target.value);
                    const selected = getAvailableDivisions().find(d => d.division === e.target.value);
                    setSelectedSemester(selected ? selected.semester.toString() : '');
                  }}
                  className="border px-3 py-2 rounded"
                  required
                  disabled={!selectedCourse}
                >
                  <option value="">Select Division</option>
                  {getAvailableDivisions().map((item, idx) => (
                    <option key={idx} value={item.division}>
                      {item.division} (Sem {item.semester})
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={selectedSemester ? `Semester ${selectedSemester}` : ''}
                  className="border px-3 py-2 rounded bg-gray-100"
                  placeholder="Semester (auto-filled)"
                  readOnly
                />
              </div>

              <div>
                <input
                  id="csvFileInput"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                  className="border px-3 py-2 w-full rounded"
                  required
                />
                <p className="text-sm text-gray-600 mt-1">
                  CSV should have columns: studentName, email, rollNo, enrollmentNo
                </p>
              </div>

              <button
                type="submit"
                disabled={uploadLoading}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {uploadLoading ? 'Uploading...' : 'Upload Students'}
              </button>
            </form>
          </div>

          {/* Course List Table */}
          <div className="mt-12">
            <h3 className="text-lg font-semibold mb-2">All Course Assignments</h3>
            <table className="w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2">Academic Year</th>
                  <th className="border px-4 py-2">Course ID</th>
                  <th className="border px-4 py-2">Course Name</th>
                  <th className="border px-4 py-2">Semester</th>
                  <th className="border px-4 py-2">Division</th>
                  <th className="border px-4 py-2">Subject</th>
                  <th className="border px-4 py-2">Teacher</th>
                  <th className="border px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="border px-4 py-2">{assignment.academicYear || '2024-25'}</td>
                    <td className="border px-4 py-2">{assignment.courseId}</td>
                    <td className="border px-4 py-2">{assignment.courseName}</td>
                    <td className="border px-4 py-2">Sem {assignment.semester}</td>
                    <td className="border px-4 py-2">{assignment.division}</td>
                    <td className="border px-4 py-2">{assignment.subject}</td>
                    <td className="border px-4 py-2">{assignment.teacherName} ({assignment.teacherEmail})</td>
                    <td className="border px-4 py-2">
                      <button
                        onClick={() => deleteCourse(assignment.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AddCourse;
