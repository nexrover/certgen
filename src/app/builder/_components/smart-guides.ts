/**
 * Smart Distance Guides & Real-time Measurement Indicators
 * ─────────────────────────────────────────────────────────
 * Renders alignment snap guides and distance measurement
 * indicators when dragging Fabric objects on the canvas.
 *
 * ▸ Alignment guides   – dashed red lines when edges/centers
 *                         align with canvas or other objects
 * ▸ Distance indicators – thin red lines with pixel labels
 *                         showing gaps to canvas edges &
 *                         nearby elements
 * ▸ Snapping            – returns a delta that the caller
 *                         adds to obj.left/top before
 *                         boundary clamping
 *
 * All rendering is done via a single SVG overlay inside the
 * canvas wrapper div (scales automatically with the CSS
 * transform).  Guide lines + labels are rebuilt every frame
 * via innerHTML for maximum throughput.
 */

import type { Canvas, FabricObject } from "fabric";

/* ── Internal types ─────────────────────────────────── */

interface AABB {
  left: number;
  top: number;
  right: number;
  bottom: number;
  cx: number;
  cy: number;
}

interface Guide {
  orient: "v" | "h";
  pos: number;
  from: number;
  to: number;
}

interface Dist {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  val: number;
  orient: "h" | "v";
}

/* ── Configuration ──────────────────────────────────── */

/** Max distance (px) between an alignment point pair to trigger snap */
const SNAP_THRESHOLD = 5;
/** Max gap (px) between element edges to show a distance indicator */
const GAP_THRESHOLD = 200;
/** How far (px) guide lines extend beyond the matched range */
const GUIDE_EXTEND = 20;

/* ── Manager class ──────────────────────────────────── */

export class SmartGuideManager {
  private svg: SVGSVGElement;
  private active = false;

  constructor(container: HTMLElement, w: number, h: number) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", String(w));
    svg.setAttribute("height", String(h));
    svg.style.cssText =
      "position:absolute;top:0;left:0;pointer-events:none;z-index:9998;overflow:visible";
    container.appendChild(svg);
    this.svg = svg;
  }

  /** Update SVG viewport when the canvas is resized. */
  resize(w: number, h: number) {
    this.svg.setAttribute("width", String(w));
    this.svg.setAttribute("height", String(h));
  }

  /**
   * Core method – call on every `object:moving` frame.
   *
   * @returns `{ dx, dy }` snap delta to **add** to
   *          `obj.left / obj.top` before boundary clamping.
   */
  calculate(
    target: FabricObject,
    canvas: Canvas,
  ): { dx: number; dy: number } {
    this.active = true;

    const cW = canvas.width!;
    const cH = canvas.height!;

    /* ── 1. Target AABB ──────────────────────────────── */
    const t = this.box(target);

    /* ── 2. Collect other objects' AABBs ─────────────── */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sel = (target as any)._objects as FabricObject[] | undefined;
    const others: AABB[] = [];
    for (const o of canvas.getObjects()) {
      if (o === target) continue;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((o as any).__isBackground) continue;
      if (sel?.includes(o)) continue;
      others.push(this.box(o));
    }

    /* ── 3. Reference alignment points ──────────────── */
    const refXs: number[] = [0, cW / 2, cW];
    const refYs: number[] = [0, cH / 2, cH];
    for (const o of others) {
      refXs.push(o.left, o.cx, o.right);
      refYs.push(o.top, o.cy, o.bottom);
    }

    const targetXs = [t.left, t.cx, t.right];
    const targetYs = [t.top, t.cy, t.bottom];

    /* ── 4. Find closest snap in each axis ──────────── */
    let bestDX = 0,
      bestAbsX = SNAP_THRESHOLD + 1;
    let bestDY = 0,
      bestAbsY = SNAP_THRESHOLD + 1;

    for (const rx of refXs)
      for (const tx of targetXs) {
        const d = rx - tx;
        const a = Math.abs(d);
        if (a < bestAbsX) {
          bestDX = d;
          bestAbsX = a;
        }
      }

    for (const ry of refYs)
      for (const ty of targetYs) {
        const d = ry - ty;
        const a = Math.abs(d);
        if (a < bestAbsY) {
          bestDY = d;
          bestAbsY = a;
        }
      }

    const dx = bestAbsX <= SNAP_THRESHOLD ? bestDX : 0;
    const dy = bestAbsY <= SNAP_THRESHOLD ? bestDY : 0;

    /* ── 5. Snapped AABB ────────────────────────────── */
    const s: AABB = {
      left: t.left + dx,
      top: t.top + dy,
      right: t.right + dx,
      bottom: t.bottom + dy,
      cx: t.cx + dx,
      cy: t.cy + dy,
    };

    /* ── 6. Build alignment guide lines ─────────────── */
    const guides = this.buildGuides(
      s,
      others,
      bestAbsX,
      bestAbsY,
      cW,
      cH,
    );

    /* ── 7. Build distance measurements ─────────────── */
    const dists = this.buildDistances(s, others, cW, cH);

    /* ── 8. Render ──────────────────────────────────── */
    this.draw(guides, dists);

    return { dx, dy };
  }

  /** Hide all guides (call on mouse:up). */
  clear() {
    if (this.active) {
      this.svg.innerHTML = "";
      this.active = false;
    }
  }

  /** Remove SVG element from DOM (call on canvas dispose). */
  destroy() {
    this.svg.remove();
  }

  /* ── Private helpers ──────────────────────────────── */

  /** Compute AABB from a Fabric object's bounding rect. */
  private box(obj: FabricObject): AABB {
    const b = obj.getBoundingRect();
    return {
      left: b.left,
      top: b.top,
      right: b.left + b.width,
      bottom: b.top + b.height,
      cx: b.left + b.width / 2,
      cy: b.top + b.height / 2,
    };
  }

  /**
   * Determine which alignment guide lines to show.
   *
   * A guide is produced when a target edge/center aligns
   * (post-snap) with a canvas edge/center or another
   * object's edge/center.
   */
  private buildGuides(
    s: AABB,
    others: AABB[],
    bestAbsX: number,
    bestAbsY: number,
    cW: number,
    cH: number,
  ): Guide[] {
    const map = new Map<string, Guide>();
    const canvasXs = [0, cW / 2, cW];
    const canvasYs = [0, cH / 2, cH];

    const upsert = (
      orient: "v" | "h",
      pos: number,
      from: number,
      to: number,
    ) => {
      const k = `${orient}${Math.round(pos * 10)}`;
      const ex = map.get(k);
      if (ex) {
        ex.from = Math.min(ex.from, from);
        ex.to = Math.max(ex.to, to);
      } else {
        map.set(k, { orient, pos, from, to });
      }
    };

    /* Vertical guide lines (X-axis alignment) */
    if (bestAbsX <= SNAP_THRESHOLD) {
      for (const sx of [s.left, s.cx, s.right]) {
        // Canvas references → full-height guide
        for (const cr of canvasXs) {
          if (Math.abs(sx - cr) < 0.5) upsert("v", cr, 0, cH);
        }
        // Object references → spans both objects
        for (const o of others) {
          for (const ox of [o.left, o.cx, o.right]) {
            if (Math.abs(sx - ox) < 0.5) {
              upsert(
                "v",
                ox,
                Math.min(s.top, o.top),
                Math.max(s.bottom, o.bottom),
              );
            }
          }
        }
      }
    }

    /* Horizontal guide lines (Y-axis alignment) */
    if (bestAbsY <= SNAP_THRESHOLD) {
      for (const sy of [s.top, s.cy, s.bottom]) {
        for (const cr of canvasYs) {
          if (Math.abs(sy - cr) < 0.5) upsert("h", cr, 0, cW);
        }
        for (const o of others) {
          for (const oy of [o.top, o.cy, o.bottom]) {
            if (Math.abs(sy - oy) < 0.5) {
              upsert(
                "h",
                oy,
                Math.min(s.left, o.left),
                Math.max(s.right, o.right),
              );
            }
          }
        }
      }
    }

    return Array.from(map.values());
  }

  /**
   * Build distance measurement indicators.
   *
   * Two categories:
   *  (a) Distance from element edges to canvas edges
   *  (b) Gap to the nearest element in each cardinal direction
   */
  private buildDistances(
    s: AABB,
    others: AABB[],
    cW: number,
    cH: number,
  ): Dist[] {
    const dists: Dist[] = [];

    /* ── (a) Canvas edge distances ──────────────────── */
    const eL = s.left;
    const eR = cW - s.right;
    const eT = s.top;
    const eB = cH - s.bottom;

    if (eL > 1)
      dists.push({
        x1: 0,
        y1: s.cy,
        x2: s.left,
        y2: s.cy,
        val: eL,
        orient: "h",
      });
    if (eR > 1)
      dists.push({
        x1: s.right,
        y1: s.cy,
        x2: cW,
        y2: s.cy,
        val: eR,
        orient: "h",
      });
    if (eT > 1)
      dists.push({
        x1: s.cx,
        y1: 0,
        x2: s.cx,
        y2: s.top,
        val: eT,
        orient: "v",
      });
    if (eB > 1)
      dists.push({
        x1: s.cx,
        y1: s.bottom,
        x2: s.cx,
        y2: cH,
        val: eB,
        orient: "v",
      });

    /* ── (b) Nearest element in each direction ──────── */
    let nL: Dist | null = null;
    let nR: Dist | null = null;
    let nT: Dist | null = null;
    let nB: Dist | null = null;

    for (const o of others) {
      /* Horizontal gaps require Y-axis overlap */
      const yOv =
        Math.min(s.bottom, o.bottom) - Math.max(s.top, o.top);
      if (yOv > 0) {
        const midY =
          (Math.max(s.top, o.top) + Math.min(s.bottom, o.bottom)) / 2;

        // Element to the RIGHT of target
        if (o.left > s.right) {
          const gap = o.left - s.right;
          if (gap < GAP_THRESHOLD && (!nR || gap < nR.val)) {
            nR = {
              x1: s.right,
              y1: midY,
              x2: o.left,
              y2: midY,
              val: gap,
              orient: "h",
            };
          }
        }

        // Element to the LEFT of target
        if (s.left > o.right) {
          const gap = s.left - o.right;
          if (gap < GAP_THRESHOLD && (!nL || gap < nL.val)) {
            nL = {
              x1: o.right,
              y1: midY,
              x2: s.left,
              y2: midY,
              val: gap,
              orient: "h",
            };
          }
        }
      }

      /* Vertical gaps require X-axis overlap */
      const xOv =
        Math.min(s.right, o.right) - Math.max(s.left, o.left);
      if (xOv > 0) {
        const midX =
          (Math.max(s.left, o.left) + Math.min(s.right, o.right)) / 2;

        // Element BELOW target
        if (o.top > s.bottom) {
          const gap = o.top - s.bottom;
          if (gap < GAP_THRESHOLD && (!nB || gap < nB.val)) {
            nB = {
              x1: midX,
              y1: s.bottom,
              x2: midX,
              y2: o.top,
              val: gap,
              orient: "v",
            };
          }
        }

        // Element ABOVE target
        if (s.top > o.bottom) {
          const gap = s.top - o.bottom;
          if (gap < GAP_THRESHOLD && (!nT || gap < nT.val)) {
            nT = {
              x1: midX,
              y1: o.bottom,
              x2: midX,
              y2: s.top,
              val: gap,
              orient: "v",
            };
          }
        }
      }
    }

    if (nL) dists.push(nL);
    if (nR) dists.push(nR);
    if (nT) dists.push(nT);
    if (nB) dists.push(nB);

    return dists;
  }

  /** Render guide lines and distance indicators into the SVG overlay. */
  private draw(guides: Guide[], dists: Dist[]) {
    if (guides.length === 0 && dists.length === 0) {
      this.svg.innerHTML = "";
      return;
    }

    const p: string[] = [];

    /* ── Alignment guide lines (dashed red) ─────────── */
    for (const g of guides) {
      if (g.orient === "v") {
        p.push(
          `<line x1="${g.pos}" y1="${g.from - GUIDE_EXTEND}" ` +
            `x2="${g.pos}" y2="${g.to + GUIDE_EXTEND}" ` +
            `stroke="#ef4444" stroke-width="1" stroke-dasharray="4,3"/>`,
        );
      } else {
        p.push(
          `<line x1="${g.from - GUIDE_EXTEND}" y1="${g.pos}" ` +
            `x2="${g.to + GUIDE_EXTEND}" y2="${g.pos}" ` +
            `stroke="#ef4444" stroke-width="1" stroke-dasharray="4,3"/>`,
        );
      }
    }

    /* ── Distance measurements (line + end-caps + label) */
    for (const d of dists) {
      const v = Math.round(d.val);
      if (v < 1) continue;

      const labelW = String(v).length * 6.5 + 10;

      if (d.orient === "h") {
        const y = d.y1;
        const len = Math.abs(d.x2 - d.x1);

        // Measurement line
        p.push(
          `<line x1="${d.x1}" y1="${y}" x2="${d.x2}" y2="${y}" ` +
            `stroke="#ef4444" stroke-width="0.75" opacity="0.45"/>`,
        );
        // End caps
        p.push(
          `<line x1="${d.x1}" y1="${y - 4}" x2="${d.x1}" y2="${y + 4}" ` +
            `stroke="#ef4444" stroke-width="0.75" opacity="0.45"/>`,
        );
        p.push(
          `<line x1="${d.x2}" y1="${y - 4}" x2="${d.x2}" y2="${y + 4}" ` +
            `stroke="#ef4444" stroke-width="0.75" opacity="0.45"/>`,
        );

        // Label (only if the line is long enough to contain it)
        if (len > labelW + 4) {
          const mx = (d.x1 + d.x2) / 2;
          p.push(
            `<rect x="${mx - labelW / 2}" y="${y - 9}" ` +
              `width="${labelW}" height="18" rx="4" fill="#ef4444"/>`,
          );
          p.push(
            `<text x="${mx}" y="${y}" dy="0.35em" text-anchor="middle" ` +
              `fill="#fff" font-size="10" ` +
              `font-family="Inter,system-ui,sans-serif" font-weight="600">` +
              `${v}</text>`,
          );
        }
      } else {
        const x = d.x1;
        const len = Math.abs(d.y2 - d.y1);

        p.push(
          `<line x1="${x}" y1="${d.y1}" x2="${x}" y2="${d.y2}" ` +
            `stroke="#ef4444" stroke-width="0.75" opacity="0.45"/>`,
        );
        p.push(
          `<line x1="${x - 4}" y1="${d.y1}" x2="${x + 4}" y2="${d.y1}" ` +
            `stroke="#ef4444" stroke-width="0.75" opacity="0.45"/>`,
        );
        p.push(
          `<line x1="${x - 4}" y1="${d.y2}" x2="${x + 4}" y2="${d.y2}" ` +
            `stroke="#ef4444" stroke-width="0.75" opacity="0.45"/>`,
        );

        if (len > 22) {
          const my = (d.y1 + d.y2) / 2;
          p.push(
            `<rect x="${x - labelW / 2}" y="${my - 9}" ` +
              `width="${labelW}" height="18" rx="4" fill="#ef4444"/>`,
          );
          p.push(
            `<text x="${x}" y="${my}" dy="0.35em" text-anchor="middle" ` +
              `fill="#fff" font-size="10" ` +
              `font-family="Inter,system-ui,sans-serif" font-weight="600">` +
              `${v}</text>`,
          );
        }
      }
    }

    this.svg.innerHTML = p.join("");
  }
}
