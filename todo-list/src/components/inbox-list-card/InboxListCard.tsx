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
import { ToDo } from "@/lib/types";
import { useCallback, useState } from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";

type Props = {
  toDo: ToDo[];
  setToDo: React.Dispatch<React.SetStateAction<ToDo[]>>;
};

const InBoxListCard = ({ toDo, setToDo }: Props) => {
  const [textArea, setTextArea] = useState("");

  const onChangeText = (text: string) => {
    setTextArea(text);
  };

  const handleAdd = useCallback(() => {
    const text = textArea.trim();
    if (!text) return;

    const newToDo: ToDo = {
      id: `inbox-${Date.now()}`, // ID string để đồng bộ với Board
      context: text,
    };

    setToDo((prev) => [...prev, newToDo]);
    setTextArea("");
  }, [textArea, setToDo]);

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
          <button>Thêm thẻ</button>
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
                        className={style["context"]}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        {item.context}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>

              {/* thêm công việc */}
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
                  <button>
                    <X strokeWidth={1.5} />
                  </button>
                </div>
              </div>
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
    </>
  );
};

export default InBoxListCard;
