import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../Pages/Login';
import AdminDashboard from '../Pages/Admin/AdminDashboard';
import ManageTeachers from '../Pages/Admin/ManageTeachers';
import AddCourse from '../Pages/Admin/AddCourse';
import ManageMarks from '../Pages/Admin/ManageMarks';
import GradeSheet from '../Pages/Admin/GradeSheet';
import StudentProgression from '../Pages/Admin/StudentProgression';
import TeacherDashboard from '../Pages/Teacher/TeacherDashboard';
import AddMarks from '../Pages/Teacher/AddMarks';





const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
            <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/manageteachers" element={<ManageTeachers />} />
                <Route path="/addcourse" element={<AddCourse />} />
                                <Route path="/managemarks" element={<ManageMarks />} />
                                <Route path="/gradesheet" element={<GradeSheet />} />
                                <Route path="/studentprogression" element={<StudentProgression />} />

                                <Route path="/teacherdashboard" element={<TeacherDashboard />} />
                                <Route path="/addmarks" element={<AddMarks />} />



    
      


      

      
 
    </Routes>
  );
};

export default AppRoutes;
