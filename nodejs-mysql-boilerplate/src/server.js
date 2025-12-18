const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const { connectDB, sequelize } = require("./config/connectDB");
const initWebRoutes = require("./routes/web");

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"], // (Tùy chọn) Cho phép các hành động này
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 1. Import để Sequelize nhận diện model
const Task = require("./models/Task");
const Column = require("./models/Column");

// 2. Thiết lập mối quan hệ (Associations)
// Một Cột chứa nhiều Task
Column.hasMany(Task, { foreignKey: "columnId", as: "tasks" });
// Một Task thuộc về một Cột
Task.belongsTo(Column, { foreignKey: "columnId", as: "column" });

// 3. Đồng bộ Database (Lưu ý: Dùng alter: true để nó tự thêm cột column_id vào bảng tasks cũ)
// Kết nối DB
connectDB();
// Đồng bộ Model với Database (Tự tạo bảng nếu chưa có)
sequelize.sync({ alter: true }).then(async () => {
  console.log("✅ Database synced!");

  // Kiểm tra xem có cột nào chưa, nếu chưa thì tạo 3 cột mặc định
  const count = await Column.count();
  if (count === 0) {
    await Column.bulkCreate([
      { title: "Inbox", type: "inbox", position: 1000 },
      { title: "Hôm nay", type: "today", position: 2000 },
      { title: "Tuần này", type: "thisWeek", position: 3000 },
      { title: "Sau này", type: "later", position: 4000 },
    ]);
    console.log("✅ Đã tạo các cột mẫu!");
  }
});

// Khởi tạo routes
initWebRoutes(app);

// Chạy server
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
