import { describe, expect, it } from "vitest";
import { editablePathToSegments } from "./adapters/path-to-segments.js";
import { ensureCubicPairHandles } from "./curve-handles.js";
import type { EditablePath } from "./types.js";

function pathWithTwoNodes(): EditablePath {
  return {
    id: "cut",
    role: "cut",
    closed: true,
    segmentKinds: ["line"],
    nodes: [
      { id: "a", x: 0, y: 0 },
      { id: "b", x: 10, y: 0 },
    ],
  };
}

describe("ensureCubicPairHandles", () => {
  it("creates prev handleOut when adjusting handleIn", () => {
    const path = pathWithTwoNodes();
    path.nodes[1]!.handleIn = { x: 3, y: 2 };
    ensureCubicPairHandles(path, 1, "in");
    path.segmentKinds[0] = "cubic";
    expect(path.nodes[0]!.handleOut).toBeTruthy();
    const segs = editablePathToSegments(path);
    const cubic = segs.find((s) => s.type === "cubic");
    expect(cubic).toBeTruthy();
    if (cubic?.type === "cubic") {
      expect(cubic.cp2.x).toBe(3);
      expect(cubic.cp2.y).toBe(2);
    }
  });

  it("creates next handleIn when adjusting handleOut", () => {
    const path = pathWithTwoNodes();
    path.nodes[0]!.handleOut = { x: 3, y: -1 };
    ensureCubicPairHandles(path, 0, "out");
    path.segmentKinds[0] = "cubic";
    expect(path.nodes[1]!.handleIn).toBeTruthy();
    const segs = editablePathToSegments(path);
    expect(segs.some((s) => s.type === "cubic")).toBe(true);
  });
});
