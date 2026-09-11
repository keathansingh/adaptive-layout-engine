import type { ResolvedElement, ResolvedLayout } from "./resolver";
import type { SurfaceProfile } from "./surfaces";

export interface LayoutValidation {
  valid: boolean;
  errors: string[];
}

/*
 * Check whether two rectangular elements overlap.
 */
function overlaps(
  a: ResolvedElement,
  b: ResolvedElement
): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/*
 * Check whether an element is completely inside
 * the allowed surface area.
 */
function fitsInsideSurface(
  element: ResolvedElement,
  surface: SurfaceProfile
): boolean {
  const margin = surface.minMargin;

  return (
    element.x >= margin &&
    element.y >= margin &&
    element.x + element.width <=
      surface.width - margin &&
    element.y + element.height <=
      surface.height - margin
  );
}

/*
 * Validate the final resolved layout.
 *
 * Checks:
 * 1. Elements stay inside the surface.
 * 2. Elements have valid dimensions.
 * 3. Visible elements do not overlap.
 */
export function validateLayout(
  layout: ResolvedLayout,
  surface: SurfaceProfile
): LayoutValidation {
  const errors: string[] = [];

  const visibleElements =
    layout.elements.filter(
      (element) => element.visible
    );

  /*
   * Validate individual elements.
   */
  for (const element of visibleElements) {
    if (
      element.width <= 0 ||
      element.height <= 0
    ) {
      errors.push(
        `${element.id} has an invalid size.`
      );
    }

    if (
      !fitsInsideSurface(
        element,
        surface
      )
    ) {
      errors.push(
        `${element.id} is outside the allowed surface area.`
      );
    }
  }

  /*
   * Validate element pairs for overlap.
   */
  for (
    let i = 0;
    i < visibleElements.length;
    i++
  ) {
    for (
      let j = i + 1;
      j < visibleElements.length;
      j++
    ) {
      const first =
        visibleElements[i];

      const second =
        visibleElements[j];

      if (
        overlaps(first, second)
      ) {
        errors.push(
          `${first.id} overlaps ${second.id}.`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}