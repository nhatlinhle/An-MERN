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

// --- PHẦN BỔ SUNG CHO TÍNH TOÁN VỊ TRÍ ---
// Định nghĩa Interface để hàm biết item có chứa position
interface ItemWithPosition {
  position: number;
}

/**
 * Tính toán vị trí mới dựa trên danh sách ĐÃ ĐƯỢC SẮP XẾP LẠI (reordered list).
 * @param list Danh sách item sau khi đã reorder (chứa item đang đứng ở vị trí mới)
 * @param index Vị trí index hiện tại của item đó
 */
export const calculateNewPosition = <T extends ItemWithPosition>(
  list: T[],
  index: number
): number => {
  // 1. Trường hợp list chỉ có 1 phần tử (chính là item đó)
  if (list.length <= 1) return 1000;

  // 2. Trường hợp kéo lên ĐẦU danh sách (index = 0)
  // Lấy vị trí của item đứng ngay sau nó (index = 1) chia đôi
  if (index === 0) {
    const nextItem = list[1];
    return nextItem ? nextItem.position / 2 : 1000;
  }

  // 3. Trường hợp kéo xuống CUỐI danh sách
  // Lấy vị trí item đứng trước nó (index - 1) cộng thêm 1000
  if (index === list.length - 1) {
    const prevItem = list[index - 1];
    return prevItem.position + 1000;
  }

  // 4. Trường hợp chèn vào GIỮA
  // Lấy item đứng trước (index - 1) và item đứng sau (index + 1)
  const prevItem = list[index - 1];
  const nextItem = list[index + 1];

  return (prevItem.position + nextItem.position) / 2;
};
