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
import { ContextMenuPos, ToDo } from "@/lib/types";
import { useCallback, useState } from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import ModalEdit from "../modal-edit/ModalEdit";
import { addToDo, deleteToDo, updateToDo } from "@/utils/utils";

type Props = {
  toDo: ToDo[];
  setToDo: React.Dispatch<React.SetStateAction<ToDo[]>>;
};

// main
const InBoxListCard = ({ toDo, setToDo }: Props) => {
  // xử lý phần nhập liệu
  const [textArea, setTextArea] = useState("");
  const onChangeText = (text: string) => {
    setTextArea(text);
  };

  // xử lý phần thêm dữ liệu
  const handleAdd = useCallback(() => {
    const text = textArea.trim();
    if (!text) return; // Text rỗng thì không làm gì cả

    setToDo((prev) => addToDo(prev, text)); // Thêm dữ liệu vào ToDo bên data.js bằng utils
    setTextArea(""); // reset phần nhập liệu cho lần nhập tiếp theo
  }, [textArea, setToDo]);

  // sự kiện nhấp chuột vào context
  const [menuPos, setMenuPos] = useState<ContextMenuPos>(null); //vị trí của modal dựa trên vị trí nhấp chuột
  const [open, setOpen] = useState(false); // Boolean cho việc đóng mở modal
  const [widthDom, setWidthDom] = useState(0);
  const [selectedContext, setSelectedContext] = useState<ToDo | null>(null); //lấy context lúc xảy ra sự kiện click chuột
  //  hàm xử lý sự kiện nhấp chuột + gửi dữ liệu sang modal
  const handleContextMenu = (
    e: React.MouseEvent<HTMLDivElement>,
    context: ToDo
  ) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();

    // lấy vị trí của DOM hiện tại
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

  const [showInput, setShowInput] = useState(false);
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
                        {item.text}
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
          setToDo((prev) => updateToDo(prev, update));
          setOpen(false);
        }}
        onDelete={(id) => {
          setToDo((prev) => deleteToDo(prev, id));
          setOpen(false);
        }}
      />
    </>
  );
};

export default InBoxListCard;
