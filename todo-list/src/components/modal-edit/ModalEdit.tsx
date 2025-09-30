import { ModalEditProps } from "@/lib/types";
import style from "@/styles/ModalEdit.module.css";
import { useEffect, useState } from "react";

const ModalEdit = ({
  isOpen,
  onClose,
  menuPos,
  widthD,
  context,
  onUpdate,
  onDelete,
}: ModalEditProps) => {
  const [text, setText] = useState(context?.text || "");

  useEffect(() => {
    setText(context?.text || "");
  }, [context]);

  if (!isOpen || !context) return null;
  return (
    <div className={style["box"]}>
      {/* lớp phủ */}
      <div className={style["coating"]} onClick={onClose}>
        <div
          className={style["modal"]}
          onClick={(e) => e.stopPropagation()}
          style={{ top: menuPos?.top, left: menuPos?.left }}
        >
          {/* cột trái */}
          <div className={style["left"]}>
            <textarea
              rows={4}
              style={{ width: `${widthD}px` }}
              value={text}
              onChange={(e) => setText(e.target.value)}
            ></textarea>
            <div>
              {/* nút lưu */}
              <button onClick={() => onUpdate({ ...context, text: text })}>
                Lưu
              </button>
            </div>
          </div>
          {/* cột phải */}
          <div className={style["right"]}>
            {/* các button */}
            <div className={style["listBtn"]}>
              {/* nút xóa */}
              <button onClick={() => onDelete(context.id)}>Xóa</button>
              <button>Chức năng đang p.triển</button>
              <button>Chức năng đang p.triển</button>
              <button>Chức năng đang p.triển</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ModalEdit;
