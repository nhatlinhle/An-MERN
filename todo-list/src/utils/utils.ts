import { Wrapper, Contexts, ToDo, WrapperItem } from "@/lib/types";

//***************************************************************************************** */
// Util của BoardMainContent
//***************************************************************************************** */

//thêm Item vào WrapperItem bên types.ts
export const createWrapperItem = (
  key: string,
  nameWrapper: string
): WrapperItem => {
  return {
    id: key,
    name: nameWrapper,
    style: {
      backgroundColor: "#f1f2f4",
      btnHoverBg: "#0B120E24",
    },
    contexts: [],
  };
};

//Thêm WrappItem vào Wrapper
export const addWrapperItem = (
  prev: Wrapper,
  id: string,
  name: string
): Wrapper => {
  if (prev[id]) {
    return prev;
  }
  return { ...prev, [id]: createWrapperItem(id, name) };
};

// thêm context vào đúng wrapper
export const addContextToWrapper = (
  wrapper: Wrapper,
  wrapperKey: string,
  text: string
): Wrapper => {
  const newContext: Contexts = {
    id: `context-${Date.now()}`,
    text,
  };

  return {
    ...wrapper,
    [wrapperKey]: {
      ...wrapper[wrapperKey],
      contexts: [...wrapper[wrapperKey].contexts, newContext],
    },
  };
};

// cập nhật context theo id
export const updateContextInWrapper = (
  wrapper: Wrapper,
  updated: Contexts
): Wrapper => {
  const newWrapper = { ...wrapper };
  for (const key in newWrapper) {
    newWrapper[key].contexts = newWrapper[key].contexts.map((c) =>
      c.id === updated.id ? updated : c
    );
  }
  return newWrapper;
};

// xóa context theo id
export const deleteContextInWrapper = (
  wrapper: Wrapper,
  id: string
): Wrapper => {
  const newWrapper = { ...wrapper };
  for (const key in newWrapper) {
    newWrapper[key].contexts = newWrapper[key].contexts.filter(
      (c) => c.id !== id
    );
  }
  return newWrapper;
};

//***************************************************************************************** */
// Util của InboxListCard
//***************************************************************************************** */

/** Thêm 1 todo mới */
export function addToDo(prev: ToDo[], text: string): ToDo[] {
  const newToDo: ToDo = {
    id: `inbox-${Date.now()}`,
    text,
  };
  return [...prev, newToDo];
}

/** Cập nhật todo */
export function updateToDo(prev: ToDo[], updated: ToDo): ToDo[] {
  return prev.map((t) => (t.id === updated.id ? updated : t));
}

/** Xoá todo */
export function deleteToDo(prev: ToDo[], id: string): ToDo[] {
  return prev.filter((t) => t.id !== id);
}
