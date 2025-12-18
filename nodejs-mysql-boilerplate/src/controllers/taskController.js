const Task = require("../models/Task");
const Column = require("../models/Column");
const { where } = require("sequelize");

// thêm task mới
const createTask = async (req, res) => {
  try {
    // 1. Nhận dữ liệu từ Client
    const { title, dueDate, columnId } = req.body;

    // 2. Validate cơ bản
    if (!title) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập tiêu đề công việc!" });
    }

    // 3. Xử lý logic chọn Cột (Column)
    let targetColumnId = columnId;

    // Nếu client KHÔNG gửi columnId (Ví dụ tạo từ nút "Thêm" ở Inbox)
    // -> Ta sẽ tìm cột có type là 'inbox' để gán vào.
    if (!targetColumnId) {
      const inboxColumn = await Column.findOne({ where: { type: "inbox" } });
      if (inboxColumn) {
        targetColumnId = inboxColumn.id;
      } else {
        // Trường hợp dự phòng nếu chưa tạo cột Inbox (Lấy cột đầu tiên tìm thấy)
        const firstColumn = await Column.findOne();
        if (firstColumn) targetColumnId = firstColumn.id;
      }
    }

    // 4. Xử lý logic Vị trí (Position) - Để task mới nằm dưới cùng
    // Tìm task có position lớn nhất trong cột đó
    const lastTask = await Task.findOne({
      where: { columnId: targetColumnId },
      order: [["position", "DESC"]],
    });

    // Nếu có task rồi thì lấy pos cũ + 1000, chưa có thì set là 1000 (Bước nhảy lớn để dễ chèn giữa sau này)
    const newPosition = lastTask ? lastTask.position + 1000 : 1000;

    // 5. Tạo Task mới
    const newTask = await Task.create({
      title,
      dueDate, // Có thể null
      columnId: targetColumnId, // Lưu khóa ngoại
      position: newPosition,
    });

    return res.status(201).json({
      message: "Tạo công việc thành công!",
      data: newTask,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Lỗi server", error: error.message });
  }
};

// API: Lấy toàn bộ dữ liệu Bảng (Columns + Tasks bên trong)
const getBoardData = async (req, res) => {
  try {
    // Lấy danh sách cột, SẮP XẾP theo position
    const columns = await Column.findAll({
      order: [
        ["position", "ASC"], // Sắp xếp cột từ trái qua phải
        [{ model: Task, as: "tasks" }, "position", "ASC"], // Sắp xếp task từ trên xuống dưới
      ],
      include: [
        {
          model: Task,
          as: "tasks", // Phải khớp với alias trong server.js (hasMany)
          attributes: ["id", "title", "position"], // Chỉ lấy trường cần thiết
        },
      ],
    });

    return res.status(200).json({
      message: "Lấy dữ liệu thành công",
      data: columns,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Lỗi server", error: error.message });
  }
};

// chỉnh sửa lại task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Vui lòng nhập tiêu đề!" });
    }
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ message: "Không tìm thấy công việc!" });
    }
    await task.update({ title });
    return res.status(200).json({ message: "Cập nhật thành công!" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi server", error: error.message });
  }
};

// xóa task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const count = await Task.destroy({ where: { id } });
    if (count === 0) {
      return res.status(404).json({ message: "Không tìm thấy công việc!" });
    }
    return res.status(200).json({ message: "Xóa thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// sắp xếp lại vị trí task
const updateTaskPosition = async (req, res) => {
  try {
    const { idColumns, position } = req.body;
    const { idTask } = req.params;

    // VALIDATE INPUT
    if (!idTask || idColumns === undefined || position === undefined) {
      return res.status(400).json({
        message: "Thiếu thông tin cập nhật (idTask, idColumns, position)!",
      });
    }

    // 1. TÌM TASK TRƯỚC (Để đảm bảo task tồn tại)
    const task = await Task.findByPk(idTask);
    if (!task) {
      return res.status(404).json({ message: "Không tìm thấy công việc này!" });
    }

    // 2. XỬ LÝ ID CỘT
    let realColumnId = idColumns;

    if (idColumns === "inbox") {
      // Case 1: Gửi chữ "inbox" -> Tìm ID trong DB
      const inboxColumn = await Column.findOne({ where: { type: "inbox" } });
      if (inboxColumn) {
        realColumnId = inboxColumn.id;
      } else {
        // Nếu chưa có cột Inbox thì tạo luôn hoặc báo lỗi (tùy logic app)
        return res
          .status(404)
          .json({ message: "Hệ thống chưa cấu hình cột Inbox" });
      }
    } else {
      // Case 2: Gửi ID số -> Đảm bảo nó là số nguyên (ParseInt) để tránh lỗi DB
      realColumnId = parseInt(idColumns);

      // (Optional) Kiểm tra xem cột này có tồn tại không để tránh lỗi Foreign Key
      const colExists = await Column.findByPk(realColumnId);
      if (!colExists)
        return res.status(400).json({ message: "Cột đích không tồn tại!" });
    }

    // 3. UPDATE TASK
    await task.update({
      columnId: realColumnId,
      position: position, // Sequelize hỗ trợ số thực (Float) tốt
    });

    return res.status(200).json({
      message: "Cập nhật vị trí thành công!",
      data: task,
    });
  } catch (error) {
    console.error("❌ Lỗi Server tại updateTaskPosition:", error);

    // Bắt lỗi cụ thể của Sequelize (Ví dụ lỗi khóa ngoại)
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res
        .status(400)
        .json({ message: "ID cột không hợp lệ (Không tồn tại trong DB)" });
    }

    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// thêm column
const createColumn = async (req, res) => {
  try {
    const { title } = req.body;

    // 1. Validate đầu vào
    if (!title) {
      return res.status(400).json({ message: "Vui lòng nhập tiêu đề!" });
    }

    // 2. Tự động tính toán vị trí tiếp theo
    // Tìm vị trí lớn nhất đang có trong DB (bao gồm cả các cột mặc định)
    const maxPosition = await Column.max("position");

    // Nếu chưa có cột nào (lỗi DB) thì start = 1000
    // Nếu đã có (ví dụ max là 4), thì cột mới sẽ là 1004 (hoặc bạn thích sát nhau thì +1 thành 5)
    // Mình khuyên cộng 1000 (Lexorank strategy) để sau này dễ chèn cột vào giữa
    const newPosition =
      (Number.isInteger(maxPosition) ? maxPosition : 0) + 1000;

    // 3. Tạo cột mới
    const newColumn = await Column.create({
      title: title,
      position: newPosition,
      type: title,
      background_color: "#ffffff",
      btn_hover_bg: "#f1f2f4",
    });

    return res.status(201).json({
      message: "Tạo cột thành công!",
      data: newColumn,
    });
  } catch (error) {
    console.error("Lỗi tạo cột:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
module.exports = {
  createTask,
  getBoardData,
  updateTask,
  deleteTask,
  updateTaskPosition,
  createColumn,
};
