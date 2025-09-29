import { ToDo, Wrapper } from "@/lib/types";
import style from "@/styles/BoardMainContent.module.css";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import {
  Megaphone,
  ListFilter,
  Ellipsis,
  ChevronsRightLeft,
  ImageUpscale,
  Plus,
} from "lucide-react";
type Props = {
  toDo: ToDo[];
  wrapper: Wrapper;
  setWrapper: React.Dispatch<React.SetStateAction<Wrapper>>;
};
//main
const BoardMainContent = ({ wrapper, setWrapper, toDo }: Props) => {
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
                      {value.contexts.map((ctx, index) => (
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
                            >
                              {ctx.text}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
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
                  <button>
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
              <button>
                <i>
                  <Plus strokeWidth={1.5} />
                </i>
                Thêm nào
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BoardMainContent;
