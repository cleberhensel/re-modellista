import { selectTool } from "./select.js";
import type { EditorTool } from "./types.js";

export const moveTool: EditorTool = {
  ...selectTool,
  id: "move",
};
