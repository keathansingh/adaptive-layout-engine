# Adaptive Layout Engine for Multi-Surface Ads

A TypeScript-based adaptive layout engine that takes a single advertisement specification and automatically resolves it for different display surfaces with different dimensions and constraints.

The system uses a constraint-resolution algorithm instead of hardcoded layouts or CSS media-query-based positioning.

---

## Overview

Modern advertisements may need to run across many different surfaces such as:

- Mobile portrait displays
- Mobile landscape displays
- Broadcast graphics
- Square kiosks
- Unknown or newly introduced display sizes

Creating a separate layout for every surface is difficult to maintain.

This project solves that problem by defining the advertisement once and allowing a TypeScript constraint-resolution engine to determine:

- Element positions
- Element sizes
- Element visibility
- Priority-based degradation
- Collision-free placement
- Boundary-safe placement

The same advertisement specification is therefore reusable across multiple surfaces.

---

## Key Features

- Single advertisement specification
- Adaptive layout resolution
- Priority-based element placement
- Automatic element resizing
- Priority-based degradation
- Collision detection
- Surface boundary checking
- Layout validation
- Support for unknown surfaces
- Automated tests using Vitest
- Debug information showing resolved positions and sizes
- React-based demonstration interface
- No hardcoded per-surface layout branches

---

## Supported Surfaces

The project currently demonstrates the advertisement on five surfaces.

| Surface | Dimensions |
|---|---:|
| Mobile Portrait | 320 × 480 |
| Mobile Landscape | 480 × 320 |
| Broadcast Lower Third | 1920 × 250 |
| Square Kiosk | 1080 × 1080 |
| Test Banner | 600 × 180 |

The fifth surface, `Test Banner`, demonstrates that the resolver can handle a new surface without requiring a special-case condition in the layout algorithm.

---

## Advertisement Specification

The advertisement is defined once using a TypeScript data structure.

The current advertisement contains:

| Element | Type | Role | Priority |
|---|---|---|---:|
| Headline | Text | Primary | 1 |
| Product Image | Image | Hero | 1 |
| CTA | Button | Action | 2 |
| Price | Text | Secondary | 2 |
| Logo | Image | Branding | 3 |

Lower priority numbers represent more important elements.

```text
Priority 1 → Most important
Priority 2 → Secondary
Priority 3 → Optional

Architecture

The project separates advertisement definition, surface constraints, layout resolution, validation, and rendering.

                 Advertisement Specification
                            |
                            v
                       specs.ts
                            |
                            v
                 +---------------------+
                 |   Layout Resolver   |
                 |     resolver.ts     |
                 +---------------------+
                            |
                            v
                    Resolved Layout
                            |
                            v
                 +---------------------+
                 |  Layout Validator   |
                 |    validator.ts     |
                 +---------------------+
                            |
                            v
                    Valid / Invalid
                            |
                            v
                       App.tsx
                            |
                            v
                       Browser UI

Project Structure
adaptive-layout-assignment/
│
├── src/
│   ├── App.tsx
│   ├── App.css
│   ├── specs.ts
│   ├── surfaces.ts
│   ├── resolver.ts
│   ├── validator.ts
│   └── resolver.test.ts
│
├── public/
│
├── ARCHITECTURE.md
├── README.md
├── package.json
├── tsconfig.app.json
├── tsconfig.json
└── vite.config.ts
specs.ts

Defines the advertisement specification.

It contains:

Element type
Element role
Priority
Content
Optional aspect ratio

The advertisement specification does not depend on any particular surface.

surfaces.ts

Defines the constraints of each surface.

Each surface contains:

{
  id: string;
  name: string;
  width: number;
  height: number;
  minMargin: number;
  gap: number;
}

The resolver uses these dimensions and constraints to calculate the layout.

resolver.ts

Contains the core adaptive layout algorithm.

The resolver converts:

AdSpec + SurfaceProfile

into:

ResolvedLayout

The resolver is independent of React rendering.

validator.ts

Independently validates the resolved layout.

It checks:

Elements stay inside the allowed surface area
Elements have valid dimensions
Visible elements do not overlap

This keeps layout decision-making separate from layout verification.

App.tsx

Provides the demonstration interface.

It:

Allows the user to select a surface.
Passes the selected surface to the resolver.
Receives the resolved layout.
Renders the visible elements.
Runs the layout validator.
Displays the validation result.
Displays debugging information.
resolver.test.ts

Contains automated tests using Vitest.

The tests verify that the resolver:

Works for all configured surfaces
Keeps elements inside the surface
Prevents overlapping elements
Supports the unknown Test Banner surface
Constraint Resolution Algorithm

The resolver follows a priority-driven process.

                 Advertisement Elements
                          |
                          v
                  Sort by Priority
                          |
                          v
                  Calculate Preferred Size
                          |
                          v
                  Try Preferred Position
                          |
                    +-----+-----+
                    |           |
                  Fits       Does not fit
                    |           |
                    v           v
                 Place       Reduce Size
                                |
                          +-----+-----+
                          |           |
                        Fits       Still fails
                          |           |
                          v           v
                       Place     Try smaller size
                                      |
                                      v
                              Cannot be placed
                                      |
                                      v
                         Hide lower-priority element
Priority-Based Degradation

The resolver gives important elements placement preference.

For example:

Priority 1
Headline
Product Image

Priority 2
CTA
Price

Priority 3
Branding

When the available space becomes limited, the resolver attempts to:

Preserve important elements.
Place elements at their preferred size.
Reduce element size if necessary.
Hide lower-priority elements when no valid placement remains.

This prevents optional content from causing important content to be clipped or overlapped.

Collision Detection

Each resolved element is represented as a rectangle:

(x, y, width, height)

Before placing a new element, the resolver checks whether its rectangle overlaps any already placed visible element.

This ensures that two visible elements cannot occupy the same area.

Boundary Constraints

Every visible element must remain inside the surface's safe area.

The resolver respects:

x >= margin
y >= margin

x + width <= surface.width - margin
y + height <= surface.height - margin

If an element cannot satisfy the constraints, the resolver attempts to reduce its size.

If it still cannot be placed, the element may be hidden according to its priority.

Automatic Resizing

The resolver first attempts to place an element at its preferred size.

If that size cannot be placed, it progressively tries smaller sizes:

100%
 ↓
85%
 ↓
70%
 ↓
55%
 ↓
40%

This allows elements to adapt to constrained surfaces instead of immediately disappearing.

Unknown Surface Support

The resolver does not contain special-case logic such as:

if (surface.id === "mobile-portrait") {
  // special layout
}

if (surface.id === "test-banner") {
  // another special layout
}

Instead, the algorithm uses surface properties such as:

Width
Height
Margin
Gap
Aspect ratio

For example, the following surface can be passed directly to the resolver:

const surface = {
  id: "test-banner",
  name: "Test Banner",
  width: 600,
  height: 180,
  minMargin: 20,
  gap: 12,
};

The same resolution algorithm determines the resulting layout.

This demonstrates that new surfaces can be introduced without modifying the core resolver.

Layout Validation

After the resolver produces a layout, the validator independently checks the result.

The UI displays:

Layout Status: ✓ Valid
No overlap or clipping detected.

If an invalid layout is detected, the validator returns the specific errors.

This provides an additional safety layer between the layout algorithm and rendering.

Automated Testing

Vitest is used for automated testing.

Run:

npx vitest run

The current test suite verifies:

1. Surface Resolution

All configured surfaces can be processed by the resolver.

2. Boundary Safety

Visible elements remain inside the allowed surface area.

3. Collision Safety

Visible elements do not overlap.

4. Unknown Surface Support

The resolver successfully handles the Test Banner surface.

Expected result:

Test Files  1 passed
Tests       4 passed
Running the Project
Install dependencies
npm install
Start development server
npm run dev

Vite will provide a local development URL.

Build the project
npm run build
Run automated tests
npx vitest run
Technology Stack
React
TypeScript
Vite
Vitest
CSS

The core constraint-resolution algorithm is implemented in plain TypeScript.

CSS is used for visual presentation and rendering, but the layout decisions are made by the TypeScript resolver.

Design Decisions
Why TypeScript?

TypeScript provides:

Strong typing
Clear data structures
Better maintainability
Easier debugging
Safer layout calculations
Why separate the resolver and renderer?

The resolver is responsible for making layout decisions.

The renderer is responsible for displaying those decisions.

This separation makes it possible to replace the UI renderer later with:

Canvas
SVG
Native application rendering
Video/broadcast rendering

without rewriting the core constraint engine.

Why use priorities?

Not every advertisement element is equally important.

For example, a headline and product image may be more important than branding.

Priorities allow the system to make controlled decisions when the available space becomes constrained.

Why use validation?

A resolver may contain bugs or unexpected edge cases.

The validator provides an independent safety check to ensure the final layout does not contain:

Overlapping elements
Out-of-bounds elements
Invalid dimensions
Limitations

The current implementation uses a relatively simple rectangle-based placement strategy.

Potential improvements include:

More advanced packing algorithms
Text measurement
Minimum readable font sizes
Better semantic grouping
Improved visual hierarchy
Animation between layout states
More sophisticated responsive positioning
Future Improvements

Possible future extensions include:

Broadcast Safe Areas
Support additional safe-area constraints for broadcast graphics.
Print Constraints

Support:

Bleed
Trim
Safe zones
Accessibility

Add constraints such as:

Minimum font size
Contrast requirements
Touch target sizes
Accessibility metadata
Text Measurement

Measure actual text width and height before placing text elements.

Canvas Renderer:

Add a canvas-based renderer for more precise graphical output.

Advanced Layout Strategies

Support additional strategies such as:

Grid layouts
Flex-style layouts
Alignment constraints
Anchoring
Relative positioning
Smooth Transitions

Animate elements when transitioning between surface sizes.

AI Assistance Disclosure:

AI tools were used during development for assistance with:

Project structure
TypeScript implementation guidance
Debugging
Test development
Documentation
Code explanations

The final implementation was reviewed, tested, and integrated manually.

The core project decisions, requirements, testing, and final validation were performed as part of the project development process.
