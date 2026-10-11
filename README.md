# Adaptive Layout Engine for Multi-Surface Ads

A TypeScript-based layout engine that adapts a single advertisement design to different screen sizes and display formats.

Instead of creating separate layouts for every device, the engine uses surface dimensions and element priorities to calculate where each element should appear, resize it when needed, and hide lower-priority content when space is limited.

## Features

- Define an advertisement once and reuse it across different display sizes.
- Automatically calculate element positions and dimensions.
- Resize elements when the available space is limited.
- Prioritize important content such as headlines and product images.
- Detect overlapping elements and prevent content from going outside the display boundaries.
- Validate resolved layouts and report errors.
- Support new display dimensions without adding device-specific layout conditions.
- View the resolved layout and debugging information through a React interface.
- Run automated tests with Vitest.

## Supported Display Formats

| Display | Dimensions |
|---|---|
| Mobile Portrait | 320 × 480 |
| Mobile Landscape | 480 × 320 |
| Broadcast Lower Third | 1920 × 250 |
| Square Kiosk | 1080 × 1080 |
| Test Banner | 600 × 180 |

## How It Works

1. **Define the advertisement:** Specify the content, element type, role, and priority.
2. **Choose a display surface:** Provide its width, height, margins, and spacing constraints.
3. **Resolve the layout:** The engine attempts to place elements at their preferred sizes, reducing their sizes or hiding lower-priority elements when necessary.
4. **Validate the result:** Check for overlapping elements, invalid dimensions, and content outside the permitted area.
5. **Render the layout:** The React interface displays the result and its validation status.

## Tech Stack

- React
- TypeScript
- Vite
- Vitest
- CSS

## Getting Started

### Prerequisites

Install Node.js and npm before running the project.

### Installation

Clone the repository:

```bash
git clone https://github.com/keathansingh/adaptive-layout-engine.git
```

Navigate to the project directory:

```bash
cd adaptive-layout-engine
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL provided by Vite.

## Build and Testing

Create a production build:

```bash
npm run build
```

Run the automated tests:

```bash
npx vitest run
```

The tests cover layout resolution, boundary constraints, collision prevention, and support for an additional display size.

## Design Approach

The main idea behind this project is to separate layout decisions from rendering. The TypeScript engine handles placement and validation, while React displays the resolved result.

This makes the layout logic easier to test and maintain, and allows the same engine to be extended for other rendering environments in the future.

## Future Improvements

- More advanced element-packing algorithms.
- Text measurement and minimum font-size constraints.
- Accessibility and contrast validation.
- Additional layout strategies and alignment rules.
- Smooth transitions between different display sizes.

## Author

**Keathan Singh**

GitHub: https://github.com/keathansingh
