import type { AdElement, AdSpec } from "./specs";
import type { SurfaceProfile } from "./surfaces";

export interface ResolvedElement {
  id: string;
  type: AdElement["type"];
  role: AdElement["role"];
  content: string;

  x: number;
  y: number;
  width: number;
  height: number;

  visible: boolean;
  reason: string;
}

export interface ResolvedLayout {
  surfaceId: string;
  width: number;
  height: number;
  elements: ResolvedElement[];
}

/*
 * Decide the preferred size of an element.
 *
 * The size is based on the available surface dimensions,
 * element type, and element role.
 */
function getPreferredSize(
  element: AdElement,
  surface: SurfaceProfile,
  availableWidth: number,
  availableHeight: number
) {
  const aspectRatio = surface.width / surface.height;

  const isWideSurface = aspectRatio >= 2;
  const isCompactSurface = availableHeight < 300;

  if (element.role === "hero") {
    const size = isWideSurface
      ? Math.min(180, availableHeight * 0.7)
      : Math.min(
          availableWidth * 0.45,
          availableHeight * 0.45
        );

    return {
      width: size,
      height: element.aspectRatio
        ? size / element.aspectRatio
        : size,
    };
  }

  if (element.role === "branding") {
    const width = Math.min(
      140,
      availableWidth * 0.25
    );

    return {
      width,
      height: element.aspectRatio
        ? width / element.aspectRatio
        : 40,
    };
  }

  if (element.type === "button") {
    return {
      width: Math.min(
        140,
        availableWidth * 0.3
      ),
      height: isCompactSurface ? 36 : 44,
    };
  }

  if (element.role === "primary") {
    return {
      width: Math.min(
        availableWidth * 0.8,
        500
      ),
      height: isCompactSurface ? 36 : 60,
    };
  }

  return {
    width: Math.min(
      availableWidth * 0.6,
      300
    ),
    height: isCompactSurface ? 30 : 40,
  };
}

/*
 * Check whether two rectangular elements overlap.
 */
function overlaps(
  a: ResolvedElement,
  b: {
    x: number;
    y: number;
    width: number;
    height: number;
  }
) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/*
 * Check whether a rectangle is completely inside
 * the allowed surface area.
 */
function fitsInsideSurface(
  x: number,
  y: number,
  width: number,
  height: number,
  surface: SurfaceProfile
) {
  const margin = surface.minMargin;

  return (
    x >= margin &&
    y >= margin &&
    x + width <= surface.width - margin &&
    y + height <= surface.height - margin
  );
}

/*
 * Find a position where the new element does not overlap
 * any already placed element.
 */
function findPosition(
  width: number,
  height: number,
  surface: SurfaceProfile,
  placedElements: ResolvedElement[]
) {
  const margin = surface.minMargin;
  const gap = surface.gap;

  /*
   * Generate candidate positions around
   * already placed elements.
   */
  const candidates = [
    {
      x: margin,
      y: margin,
    },
  ];

  for (const element of placedElements) {
    candidates.push(
      {
        x: element.x + element.width + gap,
        y: element.y,
      },
      {
        x: element.x,
        y: element.y + element.height + gap,
      }
    );
  }

  /*
   * Remove duplicate candidate positions.
   */
  const uniqueCandidates = candidates.filter(
    (candidate, index, array) =>
      index ===
      array.findIndex(
        (item) =>
          item.x === candidate.x &&
          item.y === candidate.y
      )
  );

  /*
   * Prefer positions that are:
   * 1. Inside the surface
   * 2. Not overlapping
   * 3. Higher on the surface
   * 4. Further left when positions have the same height
   */
  uniqueCandidates.sort((a, b) => {
    if (a.y !== b.y) {
      return a.y - b.y;
    }

    return a.x - b.x;
  });

  for (const candidate of uniqueCandidates) {
    const inside = fitsInsideSurface(
      candidate.x,
      candidate.y,
      width,
      height,
      surface
    );

    if (!inside) {
      continue;
    }

    const collision = placedElements.some(
      (element) =>
        overlaps(element, {
          x: candidate.x,
          y: candidate.y,
          width,
          height,
        })
    );

    if (!collision) {
      return candidate;
    }
  }

  return null;
}

/*
 * Create a hidden element with an explanation.
 */
function hideElement(
  element: AdElement,
  reason: string
): ResolvedElement {
  return {
    id: element.id,
    type: element.type,
    role: element.role,
    content: element.content,

    x: 0,
    y: 0,
    width: 0,
    height: 0,

    visible: false,
    reason,
  };
}

/*
 * The main adaptive layout resolver.
 *
 * The algorithm:
 *
 * 1. Sort elements by priority.
 * 2. Give higher-priority elements placement preference.
 * 3. Try the preferred size.
 * 4. If it doesn't fit, gradually shrink it.
 * 5. If it still cannot fit, hide lower-priority elements.
 * 6. Never allow overlap or out-of-bounds placement.
 */
export function resolveLayout(
  spec: AdSpec,
  surface: SurfaceProfile
): ResolvedLayout {
  const margin = surface.minMargin;

  const availableWidth =
    surface.width - margin * 2;

  const availableHeight =
    surface.height - margin * 2;

  /*
   * Lower number = higher importance.
   */
  const sortedElements = [...spec.elements].sort(
    (a, b) => a.priority - b.priority
  );

  const resolved: ResolvedElement[] = [];

  for (const element of sortedElements) {
    const preferredSize = getPreferredSize(
      element,
      surface,
      availableWidth,
      availableHeight
    );

    /*
     * Never allow the preferred size to exceed
     * the available surface.
     */
    const originalWidth = Math.min(
      preferredSize.width,
      availableWidth
    );

    const originalHeight = Math.min(
      preferredSize.height,
      availableHeight
    );

    /*
     * First try the preferred size.
     */
    let position = findPosition(
      originalWidth,
      originalHeight,
      surface,
      resolved.filter((item) => item.visible)
    );

    if (position) {
      resolved.push({
        id: element.id,
        type: element.type,
        role: element.role,
        content: element.content,

        x: position.x,
        y: position.y,
        width: originalWidth,
        height: originalHeight,

        visible: true,
        reason:
          "Element fits at its preferred size.",
      });

      continue;
    }

    /*
     * If the preferred size doesn't fit,
     * try progressively smaller versions.
     */
    const shrinkFactors = [
      0.85,
      0.7,
      0.55,
      0.4,
    ];

    let placed = false;

    for (const factor of shrinkFactors) {
      const width =
        originalWidth * factor;

      const height =
        originalHeight * factor;

      position = findPosition(
        width,
        height,
        surface,
        resolved.filter(
          (item) => item.visible
        )
      );

      if (position) {
        resolved.push({
          id: element.id,
          type: element.type,
          role: element.role,
          content: element.content,

          x: position.x,
          y: position.y,
          width,
          height,

          visible: true,
          reason:
            `Element was reduced to ${Math.round(
              factor * 100
            )}% of its preferred size to fit the surface.`,
        });

        placed = true;
        break;
      }
    }

    if (placed) {
      continue;
    }

    /*
     * If the element still cannot fit,
     * remove it only when it is lower priority.
     */
    if (element.priority >= 3) {
      resolved.push(
        hideElement(
          element,
          "Element was hidden because there was not enough space after higher-priority elements were placed."
        )
      );

      continue;
    }

    /*
     * Important elements should be protected,
     * but if there is physically no valid position,
     * they must still be hidden rather than causing
     * overlap or clipping.
     */
    resolved.push(
      hideElement(
        element,
        "Element could not be placed without overlap or going outside the surface."
      )
    );
  }

  return {
    surfaceId: surface.id,
    width: surface.width,
    height: surface.height,
    elements: resolved,
  };
  
}
