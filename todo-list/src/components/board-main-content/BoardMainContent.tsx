import { ContextMenuPos, Contexts, ToDo, Wrapper } from "@/lib/types";
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
import { useCallback, useState } from "react";
import ModalEdit from "../modal-edit/ModalEdit";
import {
  addContextToWrapper,
  addWrapperItem,
  deleteContextInWrapper,
  updateContextInWrapper,
} from "@/utils/utils";
type Props = {
  wrapper: Wrapper;
  setWrapper: React.Dispatch<React.SetStateAction<Wrapper>>;
};
//main
const BoardMainContent = ({ wrapper, setWrapper }: Props) => {
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

  // xử lý phần nhập liệu
  const [textArea, setTextArea] = useState("");
  const onChangeText = (text: string) => {
    setTextArea(text);
  };

  // xử lý phần thêm dữ liệu
  const handleAddTask = useCallback(() => {
    const text = textArea.trim();
    if (!text) return; // Text rỗng thì không làm gì cả

    setWrapper((prev) => addContextToWrapper(prev, idTask, text)); // Thêm dũ liệu vào Wrapper bên data.js
    setTextArea(""); // reset phần nhập liệu cho lần nhập tiếp theo
  }, [textArea, setWrapper]);

  const [idTask, setIdTask] = useState("");
  const handleInput = (id: string) => {
    setIdTask(id);
  };

  // thêm Wrapper
  const [showAddWrapper, setShowAddWrapper] = useState(false);
  const [titleWrapper, setTitleWrapper] = useState("");
  const oneChangeTitle = (title: string) => {
    setTitleWrapper(title);
  };

  const handleAddWrapper = useCallback(() => {
    setWrapper((prev) =>
      addWrapperItem(prev, `idWrapper${Date.now()}`, titleWrapper)
    );
    setTitleWrapper("");
  }, [titleWrapper]);

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
            {/* list wrapper  */}
            {Object.entries(wrapper).map(([key, value]) => (
              <div
                key={key}
                className={style["list-wrapper"]}
                style={
                  {
                    "--list-wrapper-bg-color": value.style.backgroundColor,
                  } as React.CSSProperties
                }
              >
                {/* header */}
                <div className={style["list-header"]}>
                  <span>{value.name}</span>
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
                      {value.contexts.map((ctx, index) => {
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
                                {ctx.text}
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                      {/* phần nhập liệu  */}
                      {idTask === key ? (
                        <div className={style["addContext"]}>
                          <textarea
                            placeholder="Nhập tiêu đề hoặc dán liên kết"
                            rows={3}
                            value={textArea}
                            onChange={(evt) => onChangeText(evt.target.value)}
                          ></textarea>
                          {/* nút thêm công việc */}
                          <div className={style["listBtn"]}>
                            <button onClick={handleAddTask}>Thêm thẻ</button>
                            <button onClick={() => setIdTask("")}>
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
                      "--btn-hover-bg": value.style.btnHoverBg,
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
                        "--btn-hover-bg": value.style.btnHoverBg,
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

            {/* thêm wrapper */}
            <div className={style["btnAddWrapper"]}>
              {showAddWrapper && (
                <div className={style["addContext"]}>
                  <textarea
                    placeholder="Nhập tên cho Wrapper"
                    rows={3}
                    value={titleWrapper}
                    onChange={(evt) => oneChangeTitle(evt.target.value)}
                  ></textarea>
                  {/* nút thêm wrapper */}
                  <div className={style["listBtn"]}>
                    <button onClick={handleAddWrapper}>Thêm wrapper</button>
                    <button onClick={() => setShowAddWrapper(false)}>
                      <X strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              )}

              {showAddWrapper === false ? (
                <button onClick={() => setShowAddWrapper(!showAddWrapper)}>
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

      {/* phần modal */}
      <ModalEdit
        isOpen={open}
        onClose={() => setOpen(false)}
        menuPos={menuPos}
        widthD={widthDom}
        context={selectedContext}
        onUpdate={(update) => {
          setWrapper((prev) => updateContextInWrapper(prev, update));
          setOpen(false);
        }}
        onDelete={(id) => {
          setWrapper((prev) => deleteContextInWrapper(prev, id));
          setOpen(false);
        }}
      />
    </>
  );
};

export default BoardMainContent;
