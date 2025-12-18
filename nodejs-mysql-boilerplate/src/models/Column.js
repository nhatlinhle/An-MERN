// src/models/Column.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/connectDB");

const Column = sequelize.define(
  "Column",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    position: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: "normal",
    },
    background_color: {
      type: DataTypes.STRING, // Dạng chuỗi ký tự
      defaultValue: "#ffffff", // Màu mặc định (Trắng) nếu không gửi lên
      allowNull: true,
    },
    btn_hover_bg: {
      type: DataTypes.STRING,
      defaultValue: "#eeeeee", // Màu mặc định khi hover
      allowNull: true,
    },
  },
  {
    tableName: "columns",
    timestamps: false,
    underscored: true,
  }
);

module.exports = Column;
