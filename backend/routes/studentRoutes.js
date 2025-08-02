import express from 'express';
import { addStudents, getStudents, deleteStudent, uploadCSV, processCSV, getCoursesForUpload, getStudentProgression } from '../controllers/studentController.js';

const router = express.Router();

router.post('/add', addStudents);
router.post('/upload-csv', uploadCSV, processCSV);
router.get('/courses-for-upload', getCoursesForUpload);
router.get('/', getStudents);
router.get('/progression', getStudentProgression);
router.delete('/:id', deleteStudent);

export default router;