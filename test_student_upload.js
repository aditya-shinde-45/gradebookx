import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const testStudentUpload = async () => {
  try {
    console.log('Testing student CSV upload...');
    
    // First, get available courses
    console.log('1. Fetching available courses...');
    const coursesResponse = await axios.get('http://localhost:5000/api/students/courses-for-upload');
    console.log('Available courses:', coursesResponse.data);
    
    if (coursesResponse.data.length === 0) {
      console.log('No courses available for upload. Please add a course first.');
      return;
    }
    
    // Use the first available course
    const course = coursesResponse.data[0];
    console.log('Using course:', course);
    
    // Create form data
    const formData = new FormData();
    formData.append('csvFile', fs.createReadStream('sample_students.csv'));
    formData.append('courseId', course.courseId);
    formData.append('division', course.division);
    formData.append('semester', course.semester.toString());
    
    console.log('2. Uploading CSV file...');
    console.log('Upload parameters:', {
      courseId: course.courseId,
      division: course.division,
      semester: course.semester
    });
    
    const uploadResponse = await axios.post('http://localhost:5000/api/students/upload-csv', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    
    console.log('Upload successful!');
    console.log('Response:', uploadResponse.data);
    
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
};

testStudentUpload();