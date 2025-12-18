const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/connectDB");

const Task = sequelize.define(
  "Task",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    position: { type: DataTypes.INTEGER, defaultValue: 0 },
    // 👇 Thêm khóa ngoại (Task thuộc về Column nào)
    columnId: {
      type: DataTypes.INTEGER,
      field: "column_id",
      references: {
        model: "columns", // ✅ SỬA LỖI: Dùng chuỗi tên bảng ('columns'), không dùng biến Column
        key: "id",
      },
    },
  },
  {
    tableName: "tasks",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Task;
