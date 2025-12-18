const { Sequelize } = require("sequelize");
require("dotenv").config();

// Khởi tạo Sequelize với thông tin từ .env
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false, // Tắt log query ra terminal cho gọn (bật lại nếu cần debug)
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Kết nối MySQL thành công!");
  } catch (error) {
    console.error("❌ Kết nối thất bại:", error);
  }
};

module.exports = { sequelize, connectDB };
