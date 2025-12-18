//-------------------------------------NEW---------------------------------------------
//-------------------------------------NEW---------------------------------------------
//-------------------------------------NEW---------------------------------------------
// 1. Type Task chuẩn (Khớp DB)
export type Task = {
  id: string; // Frontend dùng string cho dnd, Backend trả về number -> Cần convert
  title: string; // DB là title (trước đây là text)
  columnId?: number; // Để biết nó thuộc cột nào
  position: number;
};

// 2. Type Column (WrapperItem cũ)
export type ColumnData = {
  id: string; // ID cột (VD: "col-1")
  dbId: number; // ID thật trong DB (VD: 1)
  title: string; // Tên cột (Inbox, Hôm nay...)
  type: string; // 'inbox' | 'normal'
  backgroundColor: string;
  btnHoverBg: string;
  items: Task[]; // Danh sách task trong cột (Thay vì contexts)
};

// 3. Type Board (Wrapper cũ)
export type BoardData = Record<string, ColumnData>;

// Type Modal giữ nguyên logic nhưng đổi context -> Task
export type ContextMenuPos = {
  top: number;
  left: number;
  bottom: number;
  right: number;
} | null;

export type ModalEditProps = {
  isOpen: boolean;
  onClose: () => void;
  menuPos: ContextMenuPos;
  widthD: number;
  context: Task | null;
  onUpdate: (update: { id: string; title: string }) => void;
  onDelete: (id: string) => void;
};
