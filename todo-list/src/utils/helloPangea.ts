export function removeAt<T>(
  list: T[],
  index: number
): { list: T[]; removed?: T } {
  const clone = Array.from(list);
  const [removed] = clone.splice(index, 1);
  return { list: clone, removed };
}

export function insertItem<T>(list: T[], item: T, index: number): T[] {
  const clone = Array.from(list);
  clone.splice(index, 0, item);
  return clone;
}

export function reorder<T>(list: T[], from: number, to: number): T[] {
  const clone = Array.from(list);
  const [moved] = clone.splice(from, 1);
  clone.splice(to, 0, moved);
  return clone;
}

/**
 * Chuyển item từ sourceList sang destList.
 * Nếu index source không hợp lệ (không tìm thấy item) thì trả về lists nguyên vẹn (không chèn undefined).
 */
export function moveItemBetweenLists<T>(
  sourceList: T[],
  destList: T[],
  sourceIndex: number,
  destIndex: number
): { source: T[]; destination: T[] } {
  const sourceClone = Array.from(sourceList);
  const destClone = Array.from(destList);
  const [moved] = sourceClone.splice(sourceIndex, 1);

  if (moved === undefined) {
    // không tìm thấy item ở sourceIndex => trả về nguyên vẹn để tránh chèn undefined
    return {
      source: Array.from(sourceList),
      destination: Array.from(destList),
    };
  }

  destClone.splice(destIndex, 0, moved);
  return { source: sourceClone, destination: destClone };
}
