import { describe, expect, it } from "vitest";

import {
  resolveLayout
} from "./resolver";
import {validateLayout }from "./validator";

import { adSpec } from "./specs";
import { surfaces } from "./surfaces";

describe("Adaptive Layout Resolver", () => {
  it("resolves all configured surfaces", () => {
    for (const surface of surfaces) {
      const layout = resolveLayout(
        adSpec,
        surface
      );

      expect(layout.surfaceId).toBe(
        surface.id
      );

      expect(layout.width).toBe(
        surface.width
      );

      expect(layout.height).toBe(
        surface.height
      );
    }
  });

  it("keeps visible elements inside the surface", () => {
    for (const surface of surfaces) {
      const layout = resolveLayout(
        adSpec,
        surface
      );

      const validation = validateLayout(
        layout,
        surface
      );

      expect(validation.valid).toBe(true);
    }
  });

  it("does not create overlapping elements", () => {
    for (const surface of surfaces) {
      const layout = resolveLayout(
        adSpec,
        surface
      );

      const visibleElements =
        layout.elements.filter(
          (element) => element.visible
        );

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

          const overlap =
            first.x <
              second.x + second.width &&
            first.x + first.width >
              second.x &&
            first.y <
              second.y + second.height &&
            first.y + first.height >
              second.y;

          expect(overlap).toBe(false);
        }
      }
    }
  });

  it("supports the unknown test surface", () => {
    const testSurface = surfaces.find(
      (surface) =>
        surface.id === "test-banner"
    );

    expect(testSurface).toBeDefined();

    const layout = resolveLayout(
      adSpec,
      testSurface!
    );

    const validation = validateLayout(
      layout,
      testSurface!
    );

    expect(validation.valid).toBe(true);
  });
});