import BoardMainContent from "@/components/board-main-content/BoardMainContent";
import InBoxListCard from "@/components/inbox-list-card/InboxListCard";
import Nav from "@/components/nav/nav";
import { ToDo } from "@/lib/types";
import { useState } from "react";
import { initialToDo, initialWrapper } from "../api/data";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import {
  insertItem,
  moveItemBetweenLists,
  removeAt,
  reorder,
} from "@/utils/helloPangea";
const ToDoCpn = () => {
  const [toDo, setToDo] = useState<ToDo[]>(initialToDo);
  const [wrapper, setWrapper] = useState(initialWrapper);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    // 1. Inbox -> Inbox (reorder)
    if (source.droppableId === "inbox" && destination.droppableId === "inbox") {
      setToDo((prev) => reorder(prev, source.index, destination.index));
      return;
    }

    // 2. Inbox -> Board (luôn insert một object mới vào Board,
    //    KHÔNG dùng moveItemBetweenLists với source rỗng)
    if (source.droppableId === "inbox" && destination.droppableId !== "inbox") {
      const movedTask = toDo.find((t) => t.id === draggableId);
      if (!movedTask) return;

      setWrapper((prev) => {
        const destContexts = insertItem(
          prev[destination.droppableId].contexts,
          {
            id: `${destination.droppableId}-${Date.now()}`,
            text: movedTask.text,
          },
          destination.index
        );

        return {
          ...prev,
          [destination.droppableId]: {
            ...prev[destination.droppableId],
            contexts: destContexts,
          },
        };
      });

      setToDo((prev) => prev.filter((t) => t.id !== movedTask.id));
      return;
    }

    // 3. Board -> Board (cùng column: reorder; khác column: move)
    if (source.droppableId !== "inbox" && destination.droppableId !== "inbox") {
      setWrapper((prev) => {
        const sourceList = prev[source.droppableId].contexts;
        const destList = prev[destination.droppableId].contexts;

        if (source.droppableId === destination.droppableId) {
          const newList = reorder(sourceList, source.index, destination.index);
          return {
            ...prev,
            [source.droppableId]: {
              ...prev[source.droppableId],
              contexts: newList,
            },
          };
        }

        const { source: newSource, destination: newDest } =
          moveItemBetweenLists(
            sourceList,
            destList,
            source.index,
            destination.index
          );

        return {
          ...prev,
          [source.droppableId]: {
            ...prev[source.droppableId],
            contexts: newSource,
          },
          [destination.droppableId]: {
            ...prev[destination.droppableId],
            contexts: newDest,
          },
        };
      });
      return;
    }

    // 4. Board -> Inbox
    if (source.droppableId !== "inbox" && destination.droppableId === "inbox") {
      // lấy item hiện tại từ wrapper (đảm bảo wrapper là state hiện tại)
      const movedItem = wrapper[source.droppableId]?.contexts?.[source.index];
      if (!movedItem) return;

      // Xóa khỏi Board (removeAt cho chắc)
      setWrapper((prev) => {
        const { list: newSource } = removeAt(
          prev[source.droppableId].contexts,
          source.index
        );
        return {
          ...prev,
          [source.droppableId]: {
            ...prev[source.droppableId],
            contexts: newSource,
          },
        };
      });

      // Thêm vào Inbox (tạo object mới)
      setToDo((prev) =>
        insertItem(
          prev,
          { id: `inbox-${Date.now()}`, text: movedItem.text },
          destination.index
        )
      );
      return;
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid">
        <div className="container-grid">
          <Nav />
          <div className="row">
            <div className="col col-3">
              <InBoxListCard toDo={toDo} setToDo={setToDo} />
            </div>
            <div className="col col-9">
              <BoardMainContent wrapper={wrapper} setWrapper={setWrapper} />
            </div>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
};

export default ToDoCpn;
