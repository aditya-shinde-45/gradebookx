import express from 'express';
import { addCourse, getAllCourses, deleteCourse } from '../controllers/courseController.js';

const router = express.Router();

router.post('/add', addCourse);
router.get('/', getAllCourses);
router.delete('/:id', deleteCourse);

export default router;
