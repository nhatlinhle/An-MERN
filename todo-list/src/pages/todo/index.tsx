import BoardMainContent from "@/components/board-main-content/BoardMainContent";
import InBoxListCard from "@/components/inbox-list-card/InboxListCard";
import Nav from "@/components/nav/nav";
import { ToDo } from "@/lib/types";
import { useState } from "react";
import { initialToDo, initialWrapper } from "../api/data";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
const ToDoCpn = () => {
  const [toDo, setToDo] = useState<ToDo[]>(initialToDo);
  const [wrapper, setWrapper] = useState(initialWrapper);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    // 1. Inbox → Inbox
    if (source.droppableId === "inbox" && destination.droppableId === "inbox") {
      setToDo((prev) => {
        const newToDo = Array.from(prev);
        const [moved] = newToDo.splice(source.index, 1);
        newToDo.splice(destination.index, 0, moved);
        return newToDo;
      });
      return;
    }

    // 2. Inbox → Board
    if (source.droppableId === "inbox" && destination.droppableId !== "inbox") {
      const movedTask = toDo.find((t) => t.id === draggableId);
      if (!movedTask) return;

      setWrapper((prevWrapper) => {
        const newContexts = Array.from(
          prevWrapper[destination.droppableId].contexts
        );
        const newId = `${destination.droppableId}-${Date.now()}`;
        newContexts.splice(destination.index, 0, {
          id: newId,
          text: movedTask.context,
        });
        return {
          ...prevWrapper,
          [destination.droppableId]: {
            ...prevWrapper[destination.droppableId],
            contexts: newContexts,
          },
        };
      });

      setToDo((prev) => prev.filter((t) => t.id !== movedTask.id));
      return;
    }

    // 3. Board → Board
    if (source.droppableId !== "inbox" && destination.droppableId !== "inbox") {
      setWrapper((prevWrapper) => {
        const sourceContexts = Array.from(
          prevWrapper[source.droppableId].contexts
        );
        if (source.droppableId === destination.droppableId) {
          const [movedItem] = sourceContexts.splice(source.index, 1);
          sourceContexts.splice(destination.index, 0, movedItem);
          return {
            ...prevWrapper,
            [source.droppableId]: {
              ...prevWrapper[source.droppableId],
              contexts: sourceContexts,
            },
          };
        }
        const [movedItem] = sourceContexts.splice(source.index, 1);
        const destContexts = Array.from(
          prevWrapper[destination.droppableId].contexts
        );
        const newItem = { ...movedItem };
        destContexts.splice(destination.index, 0, newItem);
        return {
          ...prevWrapper,
          [source.droppableId]: {
            ...prevWrapper[source.droppableId],
            contexts: sourceContexts,
          },
          [destination.droppableId]: {
            ...prevWrapper[destination.droppableId],
            contexts: destContexts,
          },
        };
      });
      return;
    }

    // 4. Board → Inbox
    if (source.droppableId !== "inbox" && destination.droppableId === "inbox") {
      const movedItem = wrapper[source.droppableId].contexts[source.index];

      setWrapper((prevWrapper) => {
        const sourceContexts = Array.from(
          prevWrapper[source.droppableId].contexts
        );
        sourceContexts.splice(source.index, 1);
        return {
          ...prevWrapper,
          [source.droppableId]: {
            ...prevWrapper[source.droppableId],
            contexts: sourceContexts,
          },
        };
      });

      setToDo((prevToDo) => {
        const newToDo = Array.from(prevToDo);
        newToDo.splice(destination.index, 0, {
          id: `inbox-${Date.now()}`,
          context: movedItem.text,
        });
        return newToDo;
      });
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
              <BoardMainContent
                wrapper={wrapper}
                setWrapper={setWrapper}
                toDo={toDo}
              />
            </div>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
};

export default ToDoCpn;
