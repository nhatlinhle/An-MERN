import { Task, BoardData, ColumnData } from "@/lib/types";

// =========================================================================
// 1. FORMAT DATA: Chuyển đổi dữ liệu từ API (Array) -> Frontend (Object)
// =========================================================================
export const formatBoardData = (
  apiData: any[]
): { inbox: Task[]; board: BoardData } => {
  let inboxTasks: Task[] = [];
  const board: BoardData = {};

  if (!Array.isArray(apiData)) return { inbox: [], board: {} };

  apiData.forEach((col) => {
    // A. Map Task từ DB sang Frontend
    const mappedTasks: Task[] = col.tasks
      ? col.tasks.map((t: any) => ({
          id: t.id.toString(),
          title: t.title,
          columnId: col.id,
          position: t.position, // <--- Quan trọng: Phải lấy position từ DB
        }))
      : [];

    // B. Nếu là cột Inbox -> Lưu riêng
    if (col.type === "inbox") {
      inboxTasks = mappedTasks;
    }

    // C. Map vào BoardData (Chỉ map các cột KHÔNG phải Inbox nếu bạn muốn ẩn Inbox khỏi Board)
    // Nếu muốn hiện cả Inbox trên Board thì bỏ điều kiện if này đi
    if (col.type !== "inbox") {
      const columnKey = `col-${col.id}`;
      board[columnKey] = {
        id: columnKey,
        dbId: col.id,
        title: col.title,
        type: col.type,
        backgroundColor:
          col.background_color || col.backgroundColor || "#f0f0f0", // Map màu an toàn
        btnHoverBg: col.btn_hover_bg || col.btnHoverBg || "#e0e0e0",
        items: mappedTasks,
      };
    }
  });

  return { inbox: inboxTasks, board };
};

// =========================================================================
// 2. ADD TASK: Thêm task mới (Optimistic UI)
// =========================================================================
export const addTaskToBoard = (
  board: BoardData,
  columnId: string, // ID dạng "col-10"
  title: string
): BoardData => {
  const currentColumn = board[columnId];
  if (!currentColumn) return board;

  // Tính toán position cho task mới (Nằm cuối cùng)
  const items = currentColumn.items;
  const lastTask = items.length > 0 ? items[items.length - 1] : null;
  const newPosition = lastTask ? lastTask.position + 1000 : 1000;

  // 1. Tạo task mới (Fake ID tạm thời)
  const newTask: Task = {
    id: `temp-task-${Date.now()}`, // ID tạm, sau này reload sẽ có ID thật từ DB
    title: title,
    columnId: currentColumn.dbId,
    position: newPosition, // <--- Bổ sung position
  };

  // 2. Thêm vào danh sách
  const newItems = [...items, newTask];

  // 3. Trả về board mới
  return {
    ...board,
    [columnId]: {
      ...currentColumn,
      items: newItems,
    },
  };
};

// =========================================================================
// 3. UPDATE TASK: Cập nhật thông tin task (Dùng cho ModalEdit)
// =========================================================================
export const updateTaskInBoard = (
  board: BoardData,
  taskId: string,
  newTitle: string,
  columnId: number // Cần dbId của cột để tìm key nhanh hơn
): BoardData => {
  const columnKey = `col-${columnId}`;
  const currentColumn = board[columnKey];

  // Nếu không tìm thấy cột (Safety check)
  if (!currentColumn) return board;

  // Tìm và sửa task
  const newItems = currentColumn.items.map((item) =>
    item.id === taskId ? { ...item, title: newTitle } : item
  );

  return {
    ...board,
    [columnKey]: {
      ...currentColumn,
      items: newItems,
    },
  };
};

// =========================================================================
// 4. DELETE TASK: Xóa task khỏi Board (Dùng cho ModalEdit)
// =========================================================================
export const deleteTaskFromBoard = (
  board: BoardData,
  taskId: string,
  columnId: number
): BoardData => {
  const columnKey = `col-${columnId}`;
  const currentColumn = board[columnKey];

  if (!currentColumn) return board;

  // Lọc bỏ task
  const newItems = currentColumn.items.filter((item) => item.id !== taskId);

  return {
    ...board,
    [columnKey]: {
      ...currentColumn,
      items: newItems,
    },
  };
};

// =========================================================================
// 5. ADD COLUMN: Thêm cột mới (Optimistic UI)
// =========================================================================
export const addColumnToBoard = (
  board: BoardData,
  title: string
): BoardData => {
  const randomId = Date.now();
  const newColumn: ColumnData = {
    id: `col-${randomId}`, // ID frontend
    dbId: randomId, // ID backend tạm (Lưu ý: Backend thực tế sẽ sinh ID khác)
    title: title,
    type: "normal",
    backgroundColor: "#ffffff", // Mặc định màu trắng
    btnHoverBg: "#f1f2f4", // Mặc định màu xám nhạt
    items: [],
  };

  return {
    ...board,
    [newColumn.id]: newColumn,
  };
};

export const replaceTempColumn = (
  board: BoardData,
  tempId: number, // ID tạm (timestamp)
  realColumnFromDB: any // Dữ liệu thật từ Server trả về
): BoardData => {
  const tempKey = `col-${tempId}`;
  const realKey = `col-${realColumnFromDB.id}`;

  // 1. Copy board cũ
  const newBoard = { ...board };

  // 2. Lấy dữ liệu của cột tạm (đang rỗng task)
  const tempColumnData = newBoard[tempKey];

  if (!tempColumnData) return board; // Nếu không tìm thấy thì thôi

  // 3. Xóa cột tạm
  delete newBoard[tempKey];

  // 4. Thêm cột thật vào (giữ nguyên items rỗng của cột tạm nếu có)
  newBoard[realKey] = {
    ...tempColumnData,
    id: realKey, // Key mới
    dbId: realColumnFromDB.id, // <--- QUAN TRỌNG NHẤT: ID thật để gửi API
    title: realColumnFromDB.title,
    // Cập nhật các trường khác từ DB để đồng bộ màu sắc, v.v.
    backgroundColor:
      realColumnFromDB.background_color || tempColumnData.backgroundColor,
    btnHoverBg: realColumnFromDB.btn_hover_bg || tempColumnData.btnHoverBg,
  };

  return newBoard;
};
