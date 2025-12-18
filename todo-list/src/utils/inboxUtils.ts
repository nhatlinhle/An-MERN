//-------------------------------------NEW---------------------------------------------
//-------------------------------------NEW---------------------------------------------
//-------------------------------------NEW---------------------------------------------
import { Task, BoardData, ColumnData } from "@/lib/types";

// ======================================================
// Hàm MỚI: Chuyển đổi dữ liệu từ Backend -> Frontend
// ======================================================
export const formatBoardData = (
  apiData: any[]
): { inbox: Task[]; board: BoardData } => {
  let inboxTasks: Task[] = [];
  const board: BoardData = {};

  apiData.forEach((col) => {
    // 1. Map Task từ DB sang Frontend
    const mappedTasks: Task[] = col.tasks.map((t: any) => ({
      id: t.id.toString(), // Chuyển ID số sang chuỗi
      title: t.title,
      columnId: col.id,
      description: t.description,
    }));

    // 2. Nếu là cột Inbox -> Đẩy vào mảng riêng cho InboxListCard
    if (col.type === "inbox") {
      inboxTasks = mappedTasks;
    }

    // 3. Luôn tạo dữ liệu cho Board (bao gồm cả cột Inbox nếu muốn hiện bên phải, hoặc các cột khác)
    // Key của object là chuỗi "col-{id}" để dùng cho DnD
    board[`col-${col.id}`] = {
      id: `col-${col.id}`,
      dbId: col.id,
      title: col.title,
      type: col.type,
      backgroundColor: col.backgroundColor,
      btnHoverBg: col.btnHoverBg,
      items: mappedTasks,
    };
  });

  return { inbox: inboxTasks, board };
};

// ======================================================
// CÁC HÀM CŨ (Đã chỉnh sửa để dùng API thực tế)
// ======================================================

// Helper thêm task vào mảng (dùng sau khi gọi API thành công)
export function addToDo(prev: Task[], newTaskFromDB: any): Task[] {
  const newTask: Task = {
    id: newTaskFromDB?.id?.toString() || `temp-${Date.now()}`,
    title: newTaskFromDB.title,
    columnId: newTaskFromDB.columnId,
    position: newTaskFromDB.position,
  };
  return [...prev, newTask];
}

export function updateToDo(
  prev: Task[],
  updated: { id: string; title: string }
): Task[] {
  return prev.map((t) =>
    t.id === updated.id ? { ...t, title: updated.title } : t
  );
}

export function deleteToDo(prev: Task[], id: string): Task[] {
  return prev.filter((t) => t.id !== id);
}
