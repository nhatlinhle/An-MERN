import {
  Megaphone,
  ListFilter,
  Ellipsis,
  WalletCards,
  X,
  Smartphone,
} from "lucide-react";
import style from "@/styles/InBoxListCard.module.css";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import ModalEdit from "../modal-edit/ModalEdit";
import { addToDo, deleteToDo, updateToDo } from "@/utils/inboxUtils";
import api from "@/lib/api"; // Import axios instance
import { ContextMenuPos, Task } from "@/lib/types"; // Import type Task chuẩn

type Props = {
  toDo: Task[];
  setToDo: React.Dispatch<React.SetStateAction<Task[]>>;
};

// main
const InBoxListCard = ({ toDo, setToDo }: Props) => {
  // xử lý phần nhập liệu
  const [textArea, setTextArea] = useState("");
  const onChangeText = (text: string) => {
    setTextArea(text);
  };

  // sự kiện nhấp chuột vào context
  const [menuPos, setMenuPos] = useState<ContextMenuPos>(null); //vị trí của modal dựa trên vị trí nhấp chuột
  const [open, setOpen] = useState(false); // Boolean cho việc đóng mở modal
  const [widthDom, setWidthDom] = useState(0);
  const [selectedContext, setSelectedContext] = useState<Task | null>(null); //lấy context lúc xảy ra sự kiện click chuột
  const [showInput, setShowInput] = useState(false);

  // Lưu ID của cột Inbox để dùng khi tạo Task mới
  const [inboxId, setInboxId] = useState<number | string | null>(null);

  // --- 1. HANDLE ADD (THÊM MỚI) ---
  const handleAdd = async () => {
    const text = textArea.trim();
    if (!text) return;

    if (!inboxId) {
      alert("Đang tải dữ liệu, vui lòng đợi...");
      return;
    }

    try {
      // B1: Gọi API tạo task
      const response = await api.post("/create-task", {
        title: text,
        column_id: inboxId,
      });

      console.log("🔍 Dữ liệu từ API:", response.data); // <--- Thêm dòng này

      // B2: Dùng util addToDo để cập nhật State
      // response.data chính là newTaskFromDB mà util đang cần
      setToDo((prev) => addToDo(prev, response.data.data));

      setTextArea(""); // Reset input
    } catch (error) {
      console.error("Lỗi thêm task:", error);
      alert("Không thể thêm thẻ mới.");
    }
  };

  // --- 2. HANDLE UPDATE & DELETE (Dùng cho ModalEdit) ---
  // Hàm xử lý cập nhật (truyền vào Modal)
  const onUpdateTask = async (updatedTaskPart: any) => {
    if (!selectedContext) return;

    try {
      await api.put(`/update-task/${selectedContext.id}`, {
        title: updatedTaskPart.title,
      });

      // Tạo object update chuẩn format mà util yêu cầu {id, title}
      setToDo((prev) =>
        updateToDo(prev, {
          id: selectedContext.id,
          title: updatedTaskPart.title || updatedTaskPart.text,
        })
      );

      setOpen(false);
    } catch (error) {
      console.error("Lỗi update:", error);
    }
  };

  // Hàm xử lý xóa (truyền vào Modal)
  const onDeleteTask = async (id: string) => {
    try {
      // B1: Gọi API Delete
      await api.delete(`/delete-task/${id}`);

      // B2: Dùng util deleteToDo để cập nhật State
      setToDo((prev) => deleteToDo(prev, id));
      setOpen(false);
    } catch (error) {
      console.error("Lỗi xóa:", error);
    }
  };

  // --- 3. HANDLE CONTEXT MENU ---
  const handleContextMenu = (
    e: React.MouseEvent<HTMLDivElement>,
    context: Task
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
    setSelectedContext(context);
  };

  // --- 4. FETCH DATA ---
  useEffect(() => {
    const fetchInboxTasks = async () => {
      try {
        const response = await api.get("/board");
        const columnsFromDB = response.data.data; // Tùy cấu trúc backend trả về

        // Tìm cột Inbox
        const inboxColumn = columnsFromDB.find(
          (col: any) => col.type === "inbox"
        );

        if (inboxColumn) {
          setInboxId(inboxColumn.id); // Lưu ID cột Inbox

          // Map dữ liệu từ DB sang Frontend Task Type
          const mappedTasks: Task[] = inboxColumn.tasks.map((t: any) => ({
            id: t.id.toString(),
            title: t.title,
            columnId: inboxColumn.id,
            position: t.position,
          }));

          setToDo(mappedTasks);
        }
      } catch (error) {
        console.error("❌ Lỗi load Inbox:", error);
      }
    };

    fetchInboxTasks();
  }, [setToDo]);
  return (
    <>
      <div className={style["box"]}>
        <div className={style["navItem"]}>
          <div className={style["item1"]}>
            <i>
              <WalletCards strokeWidth={1.5} />
            </i>
            <span>Inbox</span>
          </div>

          <div className={style["item2"]}>
            <i>
              <Megaphone strokeWidth={1.5} />
            </i>
            <i>
              <ListFilter strokeWidth={1.5} />
            </i>
            <i>
              <Ellipsis strokeWidth={1.5} />
            </i>
          </div>
        </div>

        <div className={style["inboxBtnAddContext"]}>
          <button onClick={() => setShowInput(!showInput)}>Thêm thẻ</button>
        </div>

        {/* các công việc cần làm */}
        <Droppable droppableId="inbox">
          {(provided) => (
            <div
              className={style["yo"]}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              <div className={style["listContext"]}>
                {toDo.map((item, index) => (
                  <Draggable
                    key={item.id}
                    draggableId={item.id.toString()}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        onClick={(e) => handleContextMenu(e, item)}
                        onContextMenu={(e) => handleContextMenu(e, item)}
                        className={style["context"]}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        {item.title}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>

              {/* thêm công việc */}
              {showInput && (
                <div className={style["addContext"]}>
                  <textarea
                    placeholder="Nhập tiêu đề hoặc dán liên kết"
                    rows={3}
                    value={textArea}
                    onChange={(evt) => onChangeText(evt.target.value)}
                  ></textarea>
                  {/* nút thêm công việc */}
                  <div className={style["listBtn"]}>
                    <button onClick={handleAdd}>Thêm thẻ</button>
                    <button onClick={() => setShowInput(!showInput)}>
                      <X strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Droppable>

        <div className={style["listIcon"]}>
          <div className={style["icon"]}>
            <Image
              alt="logo"
              src="/png/logo-google.png"
              className={style["customImage"]}
              width={36}
              height={36}
            />
          </div>
          <div className={style["icon"]}>
            <Image
              alt="logo"
              src="/png/logo-slack.png"
              className={style["customImage"]}
              width={30}
              height={30}
            />
          </div>
          <div className={style["icon"]}>
            <Image
              alt="logo"
              src="/png/logo-team.png"
              className={style["customImage"]}
              fill
            />
          </div>
          <div className={style["icon"]}>
            <Smartphone strokeWidth={1.5} />
          </div>
        </div>
      </div>

      <ModalEdit
        isOpen={open}
        onClose={() => setOpen(false)}
        menuPos={menuPos}
        widthD={widthDom}
        context={selectedContext}
        onUpdate={(update) => {
          onUpdateTask(update);
        }}
        onDelete={(id) => {
          onDeleteTask(id);
        }}
      />
    </>
  );
};

export default InBoxListCard;
