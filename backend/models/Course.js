// models/Course.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

// Single table for all course assignments
export const CourseAssignment = sequelize.define('CourseAssignment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  courseId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  courseName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  academicYear: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '2024-25',
  },
  semester: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 8
    }
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  division: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  teacherName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  teacherEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  teacherPassword: {
    type: DataTypes.STRING,
    allowNull: false,
  }
});

// Keep Teacher model for login
export const Teacher = sequelize.define('Teacher', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Student model
export const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  studentName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  rollNo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  enrollmentNo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  courseId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  academicYear: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '2024-25',
  },
  semester: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 8
    }
  },
  division: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dateOfJoining: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'failed', 'promoted'),
    defaultValue: 'active',
    allowNull: false,
  }
});

// Marks model
export const Marks = sequelize.define('Marks', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Student,
      key: 'id'
    }
  },
  courseId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  academicYear: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '2024-25',
  },
  semester: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 8
    }
  },
  division: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  marks: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    }
  },
  teacherEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  }
});

// Define associations
Student.hasMany(Marks, { foreignKey: 'studentId' });
Marks.belongsTo(Student, { foreignKey: 'studentId' });