//***************************************************************************************** */
// type của inboxListCard
//***************************************************************************************** */
export type ToDo = {
  id: string;
  text: string;
};

//***************************************************************************************** */
// type của boardMainContent
//***************************************************************************************** */
export type Task = {
  id: number;
  context: string;
};

export type Contexts = {
  id: string;
  text: string;
};

export type Style = {
  backgroundColor: string;
  btnHoverBg: string;
};

export type WrapperItem = {
  id: string;
  name: string;
  style: Style;
  contexts: Contexts[];
};

export type Wrapper = Record<string, WrapperItem>;

//***************************************************************************************** */
// type của modal
//***************************************************************************************** */
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
  context: { id: string; text: string } | null;
  onUpdate: (context: { id: string; text: string }) => void;
  onDelete: (id: string) => void;
};
