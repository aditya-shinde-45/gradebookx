import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();


const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: console.log,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Connected successfully');
    await sequelize.sync({ alter: true }); 
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

export { sequelize };
export default connectDB;