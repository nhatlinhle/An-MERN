import { ToDo, Wrapper } from "@/lib/types";

export const initialToDo: ToDo[] = [];

export const initialWrapper: Wrapper = {
  today: {
    name: "Hôm nay",
    style: { backgroundColor: "#F5E989", btnHoverBg: "#d1c676" },
    contexts: [],
  },
  thisWeek: {
    name: "Tuần này",
    style: { backgroundColor: "#BAF3DB", btnHoverBg: "#7EE2B8" },
    contexts: [],
  },

  later: {
    name: "Sau này",
    style: { backgroundColor: "#f1f2f4", btnHoverBg: "#0B120E24" },
    contexts: [],
  },
};
