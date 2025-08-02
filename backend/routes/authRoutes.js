import express from 'express';
import {  login } from '../controllers/authController.js';

const router = express.Router();

// Example DELETE route in Express



router.post('/login', login);

export default router;