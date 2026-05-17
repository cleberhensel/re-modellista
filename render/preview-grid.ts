import { DEFAULT_PX_PER_CM } from "../engine/constants.js";

export interface GridBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface GridIntervals {
  minorCm: number;
  majorCm: number;
  minorPt: number;
  majorPt: number;
}

export function computeGridIntervals(
  pxPerCm: number,
  viewScale = 1
): GridIntervals {
  let minorCm = 1;
  if (viewScale < 0.28) {
    minorCm = 0;
  } else if (viewScale < 0.55) {
    minorCm = 5;
  }
  const majorCm = 10;
  return {
    minorCm,
    majorCm,
    minorPt: minorCm > 0 ? minorCm * pxPerCm : 0,
    majorPt: majorCm * pxPerCm,
  };
}

function snapDown(value: number, step: number): number {
  if (step <= 0) return value;
  return Math.floor(value / step) * step;
}

function snapUp(value: number, step: number): number {
  if (step <= 0) return value;
  return Math.ceil(value / step) * step;
}

export function expandGridBounds(
  bounds: GridBounds,
  padding: number
): GridBounds {
  return {
    minX: bounds.minX - padding,
    minY: bounds.minY - padding,
    maxX: bounds.maxX + padding,
    maxY: bounds.maxY + padding,
  };
}

export function unionGridBounds(a: GridBounds, b: GridBounds): GridBounds {
  return {
    minX: Math.min(a.minX, b.minX),
    minY: Math.min(a.minY, b.minY),
    maxX: Math.max(a.maxX, b.maxX),
    maxY: Math.max(a.maxY, b.maxY),
  };
}

export function renderPreviewGridInner(
  bounds: GridBounds,
  pxPerCm: number = DEFAULT_PX_PER_CM,
  viewScale = 1,
  padding = 48
): string {
  const area = expandGridBounds(bounds, padding);
  const { minorPt, majorPt } = computeGridIntervals(pxPerCm, viewScale);
  const w = area.maxX - area.minX;
  const h = area.maxY - area.minY;
  const parts: string[] = [];

  const x0 = snapDown(area.minX, majorPt);
  const y0 = snapDown(area.minY, majorPt);
  const x1 = snapUp(area.maxX, majorPt);
  const y1 = snapUp(area.maxY, majorPt);

  if (minorPt > 0) {
    for (let x = snapDown(area.minX, minorPt); x <= area.maxX + 0.01; x += minorPt) {
      parts.push(
        `<line x1="${x.toFixed(2)}" y1="${area.minY.toFixed(2)}" x2="${x.toFixed(2)}" y2="${area.maxY.toFixed(2)}" stroke="#e4e4e7" stroke-width="0.75" vector-effect="non-scaling-stroke"/>`
      );
    }
    for (let y = snapDown(area.minY, minorPt); y <= area.maxY + 0.01; y += minorPt) {
      parts.push(
        `<line x1="${area.minX.toFixed(2)}" y1="${y.toFixed(2)}" x2="${area.maxX.toFixed(2)}" y2="${y.toFixed(2)}" stroke="#e4e4e7" stroke-width="0.75" vector-effect="non-scaling-stroke"/>`
      );
    }
  }

  for (let x = x0; x <= x1 + 0.01; x += majorPt) {
    parts.push(
      `<line x1="${x.toFixed(2)}" y1="${area.minY.toFixed(2)}" x2="${x.toFixed(2)}" y2="${area.maxY.toFixed(2)}" stroke="#a1a1aa" stroke-width="1" vector-effect="non-scaling-stroke"/>`
    );
  }
  for (let y = y0; y <= y1 + 0.01; y += majorPt) {
    parts.push(
      `<line x1="${area.minX.toFixed(2)}" y1="${y.toFixed(2)}" x2="${area.maxX.toFixed(2)}" y2="${y.toFixed(2)}" stroke="#a1a1aa" stroke-width="1" vector-effect="non-scaling-stroke"/>`
    );
  }

  const showLabels = viewScale >= 0.45 && pxPerCm > 0;
  if (showLabels) {
    const labelStep = majorPt;
    const labelY = area.minY + 10;
    const labelX = area.minX + 4;
    for (let x = x0; x <= x1 + 0.01; x += labelStep) {
      const cm = Math.round(x / pxPerCm);
      if (cm === 0) continue;
      parts.push(
        `<text x="${x.toFixed(2)}" y="${labelY.toFixed(2)}" font-size="8" text-anchor="middle" font-family="system-ui,sans-serif" fill="#71717a">${cm}</text>`
      );
    }
    for (let y = y0; y <= y1 + 0.01; y += labelStep) {
      const cm = Math.round(y / pxPerCm);
      if (cm === 0) continue;
      parts.push(
        `<text x="${labelX.toFixed(2)}" y="${(y + 3).toFixed(2)}" font-size="8" text-anchor="start" font-family="system-ui,sans-serif" fill="#71717a">${cm}</text>`
      );
    }
    parts.push(
      `<text x="${(area.minX + 6).toFixed(2)}" y="${(area.minY + 18).toFixed(2)}" font-size="8" font-family="system-ui,sans-serif" fill="#71717a">cm</text>`
    );
  }

  return parts.join("");
}

export function renderPreviewGrid(
  bounds: GridBounds,
  pxPerCm: number = DEFAULT_PX_PER_CM,
  viewScale = 1,
  padding = 48
): string {
  return (
    `<g class="preview-grid" data-layer="grid" aria-hidden="true">` +
    renderPreviewGridInner(bounds, pxPerCm, viewScale, padding) +
    `</g>`
  );
}
