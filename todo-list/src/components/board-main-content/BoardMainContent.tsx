import { ContextMenuPos, Task, BoardData } from "@/lib/types";
import style from "@/styles/BoardMainContent.module.css";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import {
  Megaphone,
  ListFilter,
  Ellipsis,
  ChevronsRightLeft,
  ImageUpscale,
  Plus,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ModalEdit from "../modal-edit/ModalEdit";
import {
  addColumnToBoard,
  addTaskToBoard,
  deleteTaskFromBoard,
  formatBoardData,
  updateTaskInBoard,
  replaceTempColumn,
} from "@/utils/boardUtils";
import api from "@/lib/api";

type Props = {
  boardData: BoardData;
  setBoardData: React.Dispatch<React.SetStateAction<BoardData>>;
};
//main
const BoardMainContent = ({ boardData, setBoardData }: Props) => {
  // --- STATE QUẢN LÝ MODAL & CONTEXT MENU ---
  const [menuPos, setMenuPos] = useState<ContextMenuPos>(null);
  const [open, setOpen] = useState(false);
  const [widthDom, setWidthDom] = useState(0);
  const [selectedContext, setSelectedContext] = useState<Task | null>(null);

  // --- 4. FETCH DATA ---
  useEffect(() => {
    const fetchBoardData = async () => {
      try {
        const response = await api.get("/board");
        // Dùng hàm util để format dữ liệu gọn gàng
        const { board } = formatBoardData(response.data.data);
        setBoardData(board);
      } catch (error) {
        console.error("❌ Lỗi load Board Data:", error);
      }
    };

    fetchBoardData();
  }, [setBoardData]);

  // --- 2. XỬ LÝ CLICK CHUỘT PHẢI (CONTEXT MENU) ---
  const handleContextMenu = (
    e: React.MouseEvent<HTMLDivElement>,
    items: Task
  ) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({
      top: rect.top,
      left: rect.left,
      bottom: rect.bottom,
      right: rect.right,
    });
    setOpen(true);
    setWidthDom(rect.width);
    setSelectedContext(items);
  };

  // --- 3. XỬ LÝ THÊM TASK MỚI (ADD TASK) ---
  // State quản lý input nhập liệu
  const [textArea, setTextArea] = useState("");
  // State lưu ID của cột đang mở ô nhập liệu (idTask ở đây đóng vai trò là idColumn)
  const [activeColumnId, setActiveColumnId] = useState("");

  const handleInput = (columnId: string) => {
    setActiveColumnId(columnId);
  };

  const handleAddTask = useCallback(async () => {
    const text = textArea.trim();
    if (!text || !activeColumnId) return;

    // Lấy thông tin cột hiện tại để lấy dbId
    const currentColumn = boardData[activeColumnId];
    if (!currentColumn) return;

    // A. Optimistic Update (Cập nhật giao diện trước)
    setBoardData((prev) => addTaskToBoard(prev, activeColumnId, text));
    setTextArea(""); // Reset input

    // B. Gọi API (Lưu vào DB)
    try {
      await api.post("/create-task", {
        title: text,
        column_id: currentColumn.dbId, // Gửi ID số lên server
      });
      console.log("✅ Tạo task thành công");
    } catch (error) {
      console.error("❌ Lỗi tạo task:", error);
      // Có thể reload lại data nếu lỗi để đồng bộ
    }
  }, [textArea, activeColumnId, boardData, setBoardData]);

  // --- 4. XỬ LÝ SỬA / XÓA TASK (Dùng cho ModalEdit) ---

  const handleUpdateTask = async (updatedContent: any) => {
    if (!selectedContext) return;
    const newTitle = updatedContent.title || updatedContent.text;

    // A. Update State
    setBoardData((prev) =>
      updateTaskInBoard(
        prev,
        selectedContext.id,
        newTitle,
        Number(selectedContext.columnId) // Ép kiểu về number nếu cần
      )
    );

    // B. Call API
    try {
      await api.put(`/update-task/${selectedContext.id}`, { title: newTitle });
    } catch (error) {
      console.error("Lỗi update:", error);
    }
    setOpen(false);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!selectedContext) return;

    // A. Update State
    setBoardData((prev) =>
      deleteTaskFromBoard(prev, taskId, Number(selectedContext.columnId))
    );

    // B. Call API
    try {
      await api.delete(`/delete-task/${taskId}`);
    } catch (error) {
      console.error("Lỗi delete:", error);
    }
    setOpen(false);
  };

  // --- 5. XỬ LÝ THÊM CỘT (WRAPPER/COLUMN) ---
  const [showAddBoardData, setShowAddBoardData] = useState(false);
  const [titleBoardData, setTitleBoardData] = useState("");

  const handleAddColumn = useCallback(async () => {
    if (!titleBoardData.trim()) return;

    // 1. Tạo ID tạm tại đây để lát nữa còn biết đường tìm mà thay thế
    const tempId = Date.now();

    // 2. Optimistic Update (Cập nhật giao diện ngay với ID tạm)
    // SỬA LẠI: Thay vì gọi addColumnToBoard bên trong setBoardData,
    // ta tự build object để kiểm soát tempId, hoặc sửa addColumnToBoard nhận tempId.
    // Cách nhanh nhất là sửa trực tiếp ở đây:

    setBoardData((prev) => {
      // Logic giống hệt addColumnToBoard nhưng dùng tempId do mình tạo
      const newColumn = {
        id: `col-${tempId}`,
        dbId: tempId, // Đang là ID tạm
        title: titleBoardData,
        type: "normal",
        items: [],
        backgroundColor: "#ffffff",
        btnHoverBg: "#f1f2f4",
      };
      return { ...prev, [newColumn.id]: newColumn };
    });

    // Reset form
    setTitleBoardData("");
    setShowAddBoardData(false);

    // 3. Gọi API (Lưu vào DB)
    try {
      const res = await api.post("/create-column", { title: titleBoardData });
      const realColumn = res.data.data; // Server trả về cột có ID thật (ví dụ id: 5)

      console.log("✅ Đã có ID thật từ server:", realColumn.id);

      // 4. QUAN TRỌNG: Thay thế cột ID tạm bằng cột ID thật trong State
      setBoardData((prev) => replaceTempColumn(prev, tempId, realColumn));
    } catch (error) {
      console.error("Lỗi tạo cột:", error);
      // Xử lý lỗi: Xóa cột tạm nếu API fail (Optional)
    }
  }, [titleBoardData, setBoardData]);
  return (
    <>
      <div className={style["box"]}>
        <div className={style["board-name-container"]}>
          <div className={style["item1"]}>Some thing</div>
          <div className={style["item2"]}>
            <i>
              <Megaphone strokeWidth={1.5} color="#ffffff" />
            </i>
            <i>
              <ListFilter strokeWidth={1.5} color="#ffffff" />
            </i>
            <i>
              <Ellipsis strokeWidth={1.5} color="#ffffff" />
            </i>
          </div>
        </div>
        <div className={style["test"]}>
          <div className={style["board"]}>
            {/* list boardData  */}
            {Object.entries(boardData).map(([key, value]) => (
              <div
                key={key}
                className={style["list-wrapper"]}
                style={
                  {
                    "--list-wrapper-bg-color": value.backgroundColor,
                  } as React.CSSProperties
                }
              >
                {/* header */}
                <div className={style["list-header"]}>
                  <span>{value.title}</span>
                  <div className={style["nav-icons"]}>
                    <i>
                      <ChevronsRightLeft strokeWidth={1.5} />
                    </i>
                    <i>
                      <Ellipsis strokeWidth={1.5} />
                    </i>
                  </div>
                </div>

                {/* danh sách các công việc */}
                <Droppable droppableId={key}>
                  {(provided) => (
                    <div
                      className={style["list-card"]}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {value.items.map((ctx, index) => {
                        return (
                          <Draggable
                            key={ctx.id}
                            draggableId={ctx.id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                key={ctx.id}
                                className={style["card"]}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={(e) => handleContextMenu(e, ctx)}
                                onContextMenu={(e) => handleContextMenu(e, ctx)}
                              >
                                {ctx.title}
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                      {/* phần nhập liệu  */}
                      {activeColumnId === key ? (
                        <div className={style["addContext"]}>
                          <textarea
                            placeholder="Nhập tiêu đề hoặc dán liên kết"
                            rows={3}
                            value={textArea}
                            onChange={(evt) => handleInput(evt.target.value)}
                          ></textarea>
                          {/* nút thêm công việc */}
                          <div className={style["listBtn"]}>
                            <button onClick={handleAddTask}>Thêm thẻ</button>
                            <button onClick={() => setActiveColumnId("")}>
                              <X strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </Droppable>

                {/* footer */}
                <div
                  className={style["list-footer"]}
                  style={
                    {
                      "--btn-hover-bg": value.btnHoverBg,
                    } as React.CSSProperties
                  }
                >
                  {/* nút gọi phần nhập liệu */}
                  <button onClick={() => handleInput(key)}>
                    <i>
                      <Plus strokeWidth={1.5} />
                    </i>
                    Thêm thẻ
                  </button>
                  <div
                    className={style["nav-icons"]}
                    style={
                      {
                        "--btn-hover-bg": value.btnHoverBg,
                      } as React.CSSProperties
                    }
                  >
                    <i>
                      <ImageUpscale strokeWidth={1.5} />
                    </i>
                  </div>
                </div>
              </div>
            ))}

            {/* thêm boardData */}
            <div className={style["btnAddWrapper"]}>
              {showAddBoardData && (
                <div className={style["addContext"]}>
                  <textarea
                    placeholder="Nhập tên cho Wrapper"
                    rows={3}
                    value={titleBoardData}
                    onChange={(evt) => setTitleBoardData(evt.target.value)}
                  ></textarea>
                  {/* nút thêm boardData */}
                  <div className={style["listBtn"]}>
                    <button onClick={handleAddColumn}>Thêm wrapper</button>
                    <button onClick={() => setShowAddBoardData(false)}>
                      <X strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              )}

              {showAddBoardData === false ? (
                <button onClick={() => setShowAddBoardData(!showAddBoardData)}>
                  <i>
                    <Plus strokeWidth={1.5} />
                  </i>
                  Thêm nào
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL EDIT --- */}
      <ModalEdit
        isOpen={open}
        onClose={() => setOpen(false)}
        menuPos={menuPos}
        widthD={widthDom}
        context={selectedContext}
        onUpdate={handleUpdateTask} // Gắn hàm xử lý mới
        onDelete={handleDeleteTask} // Gắn hàm xử lý mới
      />
    </>
  );
};

export default BoardMainContent;
