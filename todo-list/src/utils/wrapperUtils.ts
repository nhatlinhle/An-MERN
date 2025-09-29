import { Wrapper } from "@/lib/types";

export const getWrapper = (wrapper: Wrapper): [string, Wrapper[string]][] =>
  Object.entries(wrapper);
