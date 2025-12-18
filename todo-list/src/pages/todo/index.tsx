import BoardMainContent from "@/components/board-main-content/BoardMainContent";
import InBoxListCard from "@/components/inbox-list-card/InboxListCard";
import Nav from "@/components/nav/nav";
import { BoardData, Task } from "@/lib/types";
import { useState } from "react";
import { initialToDo } from "../api/data";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import {
  insertItem,
  moveItemBetweenLists,
  removeAt,
  reorder,
  calculateNewPosition,
} from "@/utils/helloPangea";
import api from "@/lib/api";
const ToDoCpn = () => {
  const [toDo, setToDo] = useState<Task[]>([]);
  const [boardData, setBoardData] = useState<BoardData>({});

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    // ============================================================
    // TRƯỜNG HỢP 1: INBOX -> INBOX (Sắp xếp lại Inbox)
    // ============================================================
    if (source.droppableId === "inbox" && destination.droppableId === "inbox") {
      // BƯỚC 1: TẠO DANH SÁCH GIẢ LẬP
      // (Để biết được sau khi thả tay ra, task đó sẽ đứng giữa ai và ai)
      const newOrderedList = reorder(toDo, source.index, destination.index);

      // BƯỚC 2: TÍNH TOÁN POSITION
      // (Dựa vào danh sách giả lập trên, tính ra con số position mới)
      const newPos = calculateNewPosition(newOrderedList, destination.index);

      // BƯỚC 3: CẬP NHẬT GIAO DIỆN NGAY (Optimistic Update)
      // (Cập nhật state ngay lập tức để người dùng không thấy bị giật)
      // Lưu ý: Phải cập nhật cả giá trị 'position' trong object task để lần kéo sau tính toán vẫn đúng
      const updatedList = newOrderedList.map((task) => {
        if (task.id.toString() === draggableId) {
          return { ...task, position: newPos }; // Gán position mới cho task vừa kéo
        }
        return task;
      });

      setToDo(updatedList);

      // BƯỚC 4: GỌI API LƯU VÀO DATABASE (Chạy ngầm)
      try {
        // Gọi API mà chúng ta vừa viết ở backend
        api.put(`/update-status/${draggableId}`, {
          idColumns: "inbox", // Vì đang ở trong Inbox
          position: newPos,
        });
        console.log(`✅ Đã cập nhật task ${draggableId} vị trí mới: ${newPos}`);
      } catch (error) {
        console.error("❌ Lỗi lưu vị trí:", error);
        // Nếu muốn kỹ tính thì revert lại state cũ ở đây
      }

      return;
    }

    // ============================================================
    // TRƯỜNG HỢP 3: INBOX -> BOARD (Kéo từ Inbox sang cột Board)
    // ============================================================
    if (source.droppableId === "inbox" && destination.droppableId !== "inbox") {
      const movedTask = toDo.find((t) => t.id.toString() === draggableId);
      if (!movedTask) return;

      // --- A. TÍNH TOÁN VỊ TRÍ MỚI ---
      // Lấy danh sách items hiện tại của cột đích
      const destColumn = boardData[destination.droppableId];
      const destItems = [...destColumn.items];

      // Chèn task vào vị trí mới để tính toán (giả lập)
      // Lưu ý: insertItem trả về mảng mới đã có item đó
      const newDestList = insertItem(destItems, movedTask, destination.index);

      // Tính position dựa trên danh sách đã chèn
      const newPos = calculateNewPosition(newDestList, destination.index);

      // --- B. CẬP NHẬT STATE (Optimistic UI) ---
      // 1. Xóa khỏi Inbox (toDo)
      setToDo((prev) => prev.filter((t) => t.id.toString() !== draggableId));

      // 2. Thêm vào Board (boardData) với position mới
      setBoardData((prev) => {
        const currentDestCol = prev[destination.droppableId];
        // Tạo task mới với position đã tính
        const taskWithNewPos = { ...movedTask, position: newPos };

        // Chèn vào list
        const newItems = insertItem(
          currentDestCol.items,
          taskWithNewPos,
          destination.index
        );

        return {
          ...prev,
          [destination.droppableId]: {
            ...currentDestCol,
            items: newItems,
          },
        };
      });

      // --- C. GỌI API ---
      try {
        // Lấy ID thật của cột (dbId) từ dữ liệu Board
        // destination.droppableId có thể là "col-123", nhưng DB cần số 123
        const realDbColumnId = boardData[destination.droppableId].dbId;

        await api.put(`/update-task-position/${draggableId}`, {
          idColumns: realDbColumnId, // <--- ID ĐỘNG LẤY TỪ ĐÂY
          position: newPos,
        });
        console.log(
          `✅ Đã chuyển sang cột ${realDbColumnId} với vị trí ${newPos}`
        );
      } catch (error) {
        console.error("❌ Lỗi di chuyển:", error);
        // Revert state nếu cần
      }
      return;
    }

    // ============================================================
    // TRƯỜNG HỢP 3: BOARD -> INBOX (Kéo từ cột bất kỳ về Inbox)
    // ============================================================
    if (source.droppableId !== "inbox" && destination.droppableId === "inbox") {
      // 1. Lấy task từ cột nguồn
      const sourceColumn = boardData[source.droppableId];
      const movedTask = sourceColumn.items[source.index];

      // 2. Tính toán vị trí mới trong Inbox
      // (Giả lập chèn vào Inbox để tính toán)
      const newInboxList = insertItem(toDo, movedTask, destination.index);
      const newPos = calculateNewPosition(newInboxList, destination.index);

      // 3. Cập nhật State (Optimistic UI)
      // A. Xóa khỏi Board
      setBoardData((prev) => {
        const newSourceItems = [...prev[source.droppableId].items];
        newSourceItems.splice(source.index, 1);
        return {
          ...prev,
          [source.droppableId]: {
            ...prev[source.droppableId],
            items: newSourceItems,
          },
        };
      });

      // B. Thêm vào Inbox với position mới
      setToDo((prev) => {
        const taskWithNewPos = { ...movedTask, position: newPos };
        return insertItem(prev, taskWithNewPos, destination.index);
      });

      // 4. Gọi API
      try {
        await api.put(`/update-task-position/${draggableId}`, {
          idColumns: "inbox", // Backend sẽ tự xử lý tìm cột Inbox
          position: newPos,
        });
        console.log(`✅ Board -> Inbox thành công! Pos: ${newPos}`);
      } catch (error) {
        console.error("Lỗi Board -> Inbox:", error);
      }
      return;
    }

    // ============================================================
    // TRƯỜNG HỢP 4: BOARD -> BOARD (Di chuyển giữa các cột hoặc trong cùng 1 cột)
    // ============================================================
    if (source.droppableId !== "inbox" && destination.droppableId !== "inbox") {
      const sourceCol = boardData[source.droppableId];
      const destCol = boardData[destination.droppableId];
      const movedTask = sourceCol.items[source.index];

      // A. CÙNG 1 CỘT (Reorder)
      if (source.droppableId === destination.droppableId) {
        const newItems = reorder(
          sourceCol.items,
          source.index,
          destination.index
        );
        const newPos = calculateNewPosition(newItems, destination.index);

        // Update State
        const updatedItems = newItems.map((t) =>
          t.id.toString() === draggableId ? { ...t, position: newPos } : t
        );
        setBoardData((prev) => ({
          ...prev,
          [source.droppableId]: { ...sourceCol, items: updatedItems },
        }));

        // Update API
        try {
          await api.put(`/update-task-position/${draggableId}`, {
            idColumns: sourceCol.dbId,
            position: newPos,
          });
        } catch (e) {
          console.error(e);
        }
        return;
      }

      // B. KHÁC CỘT (Move)
      // 1. Tính toán vị trí bên cột đích
      const newDestListForCalc = insertItem(
        destCol.items,
        movedTask,
        destination.index
      );
      const newPos = calculateNewPosition(
        newDestListForCalc,
        destination.index
      );

      // 2. Update State
      setBoardData((prev) => {
        const sourceItems = [...prev[source.droppableId].items];
        sourceItems.splice(source.index, 1); // Xóa bên nguồn

        const destItems = [...prev[destination.droppableId].items];
        const taskWithNewPos = { ...movedTask, position: newPos };
        destItems.splice(destination.index, 0, taskWithNewPos); // Thêm bên đích

        return {
          ...prev,
          [source.droppableId]: {
            ...prev[source.droppableId],
            items: sourceItems,
          },
          [destination.droppableId]: {
            ...prev[destination.droppableId],
            items: destItems,
          },
        };
      });

      // 3. Update API
      try {
        await api.put(`/update-task-position/${draggableId}`, {
          idColumns: destCol.dbId, // ID thật cột đích
          position: newPos,
        });
        console.log(`✅ Board -> Board thành công!`);
      } catch (e) {
        console.error(e);
      }
      return;
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid">
        <div className="container-grid">
          <Nav />
          <div className="row">
            <div className="col col-3">
              <InBoxListCard toDo={toDo} setToDo={setToDo} />
            </div>
            <div className="col col-9">
              <BoardMainContent
                boardData={boardData}
                setBoardData={setBoardData}
              />
            </div>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
};

export default ToDoCpn;
