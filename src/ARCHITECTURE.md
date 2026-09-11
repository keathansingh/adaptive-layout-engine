# Architecture — Adaptive Layout Engine

## 1. Overview

The Adaptive Layout Engine separates advertisement definition, surface constraints, layout resolution, validation, and rendering.

The main goal is to use one advertisement specification and automatically resolve it for different surface dimensions.

The layout algorithm does not contain special-case branches for individual surface IDs.

---

## 2. Architecture Flow

```text
                    Advertisement Specification
                              |
                              v
                         specs.ts
                              |
                              v
                    +-------------------+
                    |  Layout Resolver  |
                    |   resolver.ts     |
                    +-------------------+
                              |
                              v
                       Resolved Layout
                              |
                              v
                    +-------------------+
                    | Layout Validator  |
                    |  validator.ts     |
                    +-------------------+
                              |
                              v
                       Valid / Invalid
                              |
                              v
                         App.tsx
                              |
                              v
                         Browser UI
                         3. Main Modules
specs.ts

Defines the advertisement structure.

It contains:

Advertisement elements
Element types
Element roles
Priority values
Content
Optional image aspect ratios

Example roles include:

primary
hero
action
branding
secondary

The advertisement specification is independent of the target surface.

surfaces.ts

Defines the constraints of each display surface.

Each surface contains:

width
height
minMargin
gap

The resolver uses these values instead of depending on hardcoded surface names.

Configured surfaces include:

Mobile Portrait — 320 × 480
Mobile Landscape — 480 × 320
Broadcast Lower Third — 1920 × 250
Square Kiosk — 1080 × 1080
Test Banner — 600 × 180
resolver.ts

This is the core of the system.

The resolver converts:

AdSpec + SurfaceProfile

into:

ResolvedLayout

The algorithm:

Sorts elements by priority.
Calculates a preferred size for each element.
Attempts to place the element at its preferred size.
Checks whether the element stays inside the allowed surface.
Checks for collisions with already placed elements.
Gradually reduces the element size when necessary.
Hides lower-priority elements when there is not enough space.
Prevents overlap and clipping.

Higher-priority elements receive placement preference.

4. Priority-Based Degradation

The system uses numeric priorities.

Priority 1 → Most important
Priority 2 → Secondary
Priority 3 → Optional

When space becomes limited, the resolver attempts to preserve important content.

The degradation strategy is:

Preferred size
      |
      v
Try placement
      |
      +---- Fits ----> Keep element
      |
      v
Reduce size
      |
      +---- Fits ----> Keep reduced element
      |
      v
Try further reduction
      |
      v
Cannot fit
      |
      v
Hide lower-priority element

This prevents low-priority elements from causing clipping or overlap.

5. Collision Detection

The resolver represents every element as a rectangle:

(x, y, width, height)

Before placing a new element, the resolver checks whether its rectangle overlaps any previously placed element.

This ensures that visible elements do not occupy the same space.

6. Surface Boundary Checking

Every visible element must remain inside the safe area defined by the surface margin.

The valid region is:

margin ≤ x
margin ≤ y

x + width ≤ surface.width - margin
y + height ≤ surface.height - margin

If an element cannot satisfy these constraints, the resolver reduces or removes it rather than allowing clipping.

7. Validation

validator.ts independently validates the resolved layout.

The validator checks:

Elements remain inside the surface.
Visible elements do not overlap.
Element dimensions are valid.
The final layout satisfies the surface constraints.

This separation allows the resolver to make decisions while the validator independently verifies the result.

8. Rendering

App.tsx is responsible for presentation.

It:

Allows the user to select a surface.
Passes the selected surface to the resolver.
Receives the resolved layout.
Renders visible elements.
Displays validation status.
Displays debugging information about positions and sizes.

The React UI does not contain the layout algorithm.

This keeps the constraint-resolution logic independent from the rendering layer.

9. Unknown Surface Support

The resolver does not depend on specific surface IDs.

For example:

600 × 180

can be passed to the same resolver without adding a new condition such as:

if (surface.id === "test-banner") {
    ...
}

The resolver derives its decisions from the surface dimensions and constraints.

This allows the system to support new display surfaces without modifying the core algorithm.

10. Testing

Vitest is used for automated testing.

The test suite verifies:

All configured surfaces can be resolved.
Visible elements remain inside the surface.
Elements do not overlap.
Unknown surfaces are supported.

Current test coverage demonstrates that the resolver works across both configured and previously unknown surface dimensions.

11. Technology Stack
React
TypeScript
Vite
Vitest
CSS

The layout engine itself is implemented using plain TypeScript rather than relying on CSS media queries for the constraint-resolution logic.

12. Future Extensions

The architecture can be extended with:

Safe areas for broadcast graphics
Print bleed and trim constraints
Minimum readable font sizes
Accessibility constraints
Text measurement
More sophisticated layout strategies
Canvas-based rendering
Additional element types
Animation and smooth transitions
Custom user-defined surfaces

These extensions can be added without changing the basic separation between specification, resolution, validation, and rendering.


### 3. Save it

Then run:

```bash
npm run build

And:

npx vitest run

We should get:

✓ built
Test Files  1 passed
Tests       4 passed