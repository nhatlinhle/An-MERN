export type ToDo = {
  id: string;
  context: string;
};

export type TdToDay = {
  id: number;
  context: string;
};

export type TdThisWeek = {
  id: number;
  context: string;
};

export type TdLater = {
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
  name: string;
  style: Style;
  contexts: Contexts[];
};

export type Wrapper = Record<string, WrapperItem>;
