import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const testCSVUpload = async () => {
  try {
    // Create test CSV content
    const csvContent = `studentName,email,rollNo,enrollmentNo
Test Student 1,test1@example.com,TEST01,TEST001
Test Student 2,test2@example.com,TEST02,TEST002`;
    
    // Write to temporary file
    fs.writeFileSync('test_upload.csv', csvContent);
    
    // Create form data
    const formData = new FormData();
    formData.append('csvFile', fs.createReadStream('test_upload.csv'));
    formData.append('courseId', 'NAPS-ITI');
    formData.append('division', 'A');
    formData.append('semester', '3');
    
    // Make request
    const response = await axios.post('http://localhost:5000/api/students/upload-csv', formData, {
      headers: formData.getHeaders()
    });
    
    console.log('Upload successful:', response.data);
    
    // Clean up
    fs.unlinkSync('test_upload.csv');
    
  } catch (error) {
    console.error('Upload failed:', error.response?.data || error.message);
    // Clean up on error
    if (fs.existsSync('test_upload.csv')) {
      fs.unlinkSync('test_upload.csv');
    }
  }
};

testCSVUpload();