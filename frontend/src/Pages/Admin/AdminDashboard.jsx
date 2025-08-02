// pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../../Components/Admin/Sidebar";
import Header from "../../Components/Admin/Header";

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalCourses: 0,
        totalStudents: 0,
        totalTeachers: 0,
        pendingResults: 0,
        courses: []
    });
    const [passFailStats, setPassFailStats] = useState({
        totalStudents: 0,
        passedStudents: 0,
        failedStudents: 0
    });
    const [statsLoading, setStatsLoading] = useState(false);
    const [filters, setFilters] = useState({
        courseId: '',
        semester: ''
    });
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchStats();
        fetchTeachers();
        fetchPassFailStats();
    }, []);
    
    useEffect(() => {
        fetchStats();
        fetchPassFailStats();
    }, [filters.courseId, filters.semester]);

    useEffect(() => {
        fetchTeachers();
    }, [searchTerm, currentPage]);

    const fetchStats = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.courseId) params.append('courseId', filters.courseId);
            if (filters.semester) params.append('semester', filters.semester);
            
            const url = `http://localhost:5000/api/dashboard/admin/stats?${params}`;
            console.log('Fetching stats from:', url);
            const response = await fetch(url);
            console.log('Stats response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Stats data received:', data);
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
            // Set default values on error
            setStats({
                totalCourses: 0,
                totalStudents: 0,
                totalTeachers: 0,
                pendingResults: 0,
                courses: []
            });
        }
    };

    const fetchTeachers = async () => {
        try {
            const params = new URLSearchParams({
                page: currentPage,
                limit: 10,
                ...(searchTerm && { search: searchTerm })
            });
            const url = `http://localhost:5000/api/dashboard/admin/teachers?${params}`;
            console.log('Fetching teachers from:', url);
            
            const response = await fetch(url);
            console.log('Teachers response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Teachers data received:', data);
            
            setTeachers(data.teachers || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error('Error fetching teachers:', error);
            setTeachers([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    const fetchPassFailStats = async () => {
        setStatsLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.courseId) params.append('courseId', filters.courseId);
            if (filters.semester) params.append('semester', filters.semester);
            
            console.log('Fetching pass/fail stats with params:', params.toString());
            const response = await fetch(`http://localhost:5000/api/dashboard/admin/pass-fail-stats?${params}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Pass/fail stats received:', data);
                setPassFailStats(data);
            } else {
                console.error('Failed to fetch pass/fail stats:', response.status);
                setPassFailStats({
                    totalStudents: 0,
                    passedStudents: 0,
                    failedStudents: 0
                });
            }
        } catch (error) {
            console.error('Error fetching pass/fail stats:', error);
            setPassFailStats({
                totalStudents: 0,
                passedStudents: 0,
                failedStudents: 0
            });
        } finally {
            setStatsLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };
    
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'courseId' && { semester: '' })
        }));
    };

    const getStatusColor = (status) => {
        const colors = {
            'Completed': 'green',
            'Incomplete': 'yellow',
            'Pending': 'yellow',
            'No Classes': 'gray',
            'Overdue': 'red'
        };
        return colors[status] || 'gray';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="flex h-screen bg-gray-100 font-[Poppins,sans-serif]">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-y-auto lg:ml-48">
              <Header/>

                <div className="flex-1 p-6">
                    {/* Filters */}
                    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Statistics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                                <select
                                    name="courseId"
                                    value={filters.courseId}
                                    onChange={handleFilterChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Courses</option>
                                    {(stats.courses || []).map(course => (
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
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Semesters</option>
                                    {[1,2,3,4,5,6,7,8].map(sem => (
                                        <option key={sem} value={sem}>Semester {sem}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-6 gap-4 mb-6">
                        {[
                            { label: "Number of Courses", value: stats.totalCourses, color: "blue" },
                            { label: "Total Students", value: stats.totalStudents, color: "indigo" },
                            { label: "Total Teachers", value: stats.totalTeachers, color: "purple" },
                            { label: "Classes with Pending Results", value: stats.pendingResults, color: "yellow" },
                            { label: "Passed Students", value: passFailStats.passedStudents, color: "green" },
                            { label: "Failed Students", value: passFailStats.failedStudents, color: "red" },
                        ].map((item, index) => (
                            <div
                                key={index}
                                className={`bg-white p-6 rounded-lg shadow-sm border-l-4 ${item.color === 'green' ? 'border-green-500' : item.color === 'red' ? 'border-red-500' : item.color === 'blue' ? 'border-blue-500' : item.color === 'indigo' ? 'border-indigo-500' : item.color === 'purple' ? 'border-purple-500' : 'border-yellow-500'}`}
                            >
                                <h3 className="text-sm font-medium text-gray-500">{item.label}</h3>
                                <p className={`text-3xl font-semibold mt-2 ${item.color === 'green' ? 'text-green-600' : item.color === 'red' ? 'text-red-600' : item.color === 'blue' ? 'text-blue-600' : item.color === 'indigo' ? 'text-indigo-600' : item.color === 'purple' ? 'text-purple-600' : 'text-yellow-600'}`}>
                                    {statsLoading && (item.label.includes('Passed') || item.label.includes('Failed')) ? (
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
                                    ) : (
                                        item.value || 0
                                    )}
                                </p>
                                {(item.label.includes('Passed') || item.label.includes('Failed')) && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        {filters.courseId || filters.semester ? 
                                            `${passFailStats.courseId} - ${passFailStats.semester}` : 
                                            'All Courses & Semesters'
                                        }
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>


                    {/* Pass/Fail Summary */}
                    {passFailStats.totalStudents > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Pass/Fail Summary</h3>
                            <div className="flex items-center space-x-8">
                                <div className="flex items-center">
                                    <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                                    <span className="text-sm text-gray-600">
                                        Passed: {passFailStats.passedStudents} ({((passFailStats.passedStudents / passFailStats.totalStudents) * 100).toFixed(1)}%)
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                                    <span className="text-sm text-gray-600">
                                        Failed: {passFailStats.failedStudents} ({((passFailStats.failedStudents / passFailStats.totalStudents) * 100).toFixed(1)}%)
                                    </span>
                                </div>
                            </div>
                            <div className="mt-4 bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-green-500 h-2 rounded-full" 
                                    style={{ width: `${(passFailStats.passedStudents / passFailStats.totalStudents) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    <section className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Teacher Details</h3>
                            <div className="relative">
                                <input
                                    type="search"
                                    placeholder="Search teacher..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-icons text-gray-400">search</span>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        {[
                                            "Teacher ID",
                                            "Teacher Name",
                                            "Assigned Classes",
                                            "CSV Upload Status",
                                            "Class Uploaded",
                                            "Last Upload",
                                            "Actions",
                                        ].map((header) => (
                                            <th key={header} className="px-6 py-3">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
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
                                        teachers.map((teacher) => {
                                            const statusColor = getStatusColor(teacher.status);
                                            return (
                                                <tr key={teacher.id} className="bg-white border-b">
                                                    <th className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">T{teacher.id}</th>
                                                    <td className="px-6 py-4">{teacher.name}</td>
                                                    <td className="px-6 py-4">{teacher.assignedClasses}</td>
                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`bg-${statusColor}-100 text-${statusColor}-800 text-xs font-medium px-2.5 py-0.5 rounded-full`}
                                                        >
                                                            {teacher.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">{teacher.uploadedClasses}</td>
                                                    <td className="px-6 py-4">{formatDate(teacher.lastUpload)}</td>
                                                    <td className="px-6 py-4">
                                                        <a href="#" className="font-medium text-indigo-600 hover:underline">
                                                            View
                                                        </a>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex justify-between items-center">
                            <span className="text-sm text-gray-700">
                                Showing <span className="font-semibold text-gray-900">{((currentPage - 1) * 10) + 1}</span> to{" "}
                                <span className="font-semibold text-gray-900">{Math.min(currentPage * 10, teachers.length)}</span> of{" "}
                                <span className="font-semibold text-gray-900">{teachers.length}</span> Teachers
                            </span>
                            <div className="inline-flex items-center -space-x-px">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`px-3 py-2 leading-tight ${
                                                pageNum === currentPage
                                                    ? "text-indigo-600 bg-indigo-50 border border-indigo-300 hover:bg-indigo-100"
                                                    : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700"
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
