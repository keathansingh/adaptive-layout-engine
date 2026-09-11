import { useMemo, useState } from "react";
import "./App.css";

import { adSpec } from "./specs";
import { surfaces } from "./surfaces";
import {
  resolveLayout
} from "./resolver";

import{
  validateLayout
}from "./validator";

function App() {
  const [surfaceId, setSurfaceId] = useState(
    surfaces[0].id
  );

  const surface =
    surfaces.find(
      (item) => item.id === surfaceId
    ) ?? surfaces[0];

  // The TypeScript resolver decides the actual layout.
  const layout = useMemo(
    () => resolveLayout(adSpec, surface),
    [surface]
  );

  // Validate the resolved layout.
  const validation = useMemo(
    () => validateLayout(layout, surface),
    [layout, surface]
  );

  return (
    <div className="app">
      <header className="header">
        <h1>Adaptive Layout Engine</h1>
        <p>Multi-Surface Advertisement</p>
      </header>

      <main className="main">
        <div className="controls">
          <label htmlFor="surface-select">
            Select Surface
          </label>

          <select
            id="surface-select"
            value={surfaceId}
            onChange={(event) =>
              setSurfaceId(event.target.value)
            }
          >
            {surfaces.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.name} — {item.width} ×{" "}
                {item.height}
              </option>
            ))}
          </select>
        </div>

        <div className="surface-info">
          <div>
            <strong>{surface.name}</strong>
          </div>

          <div>
            {surface.width} × {surface.height}px
          </div>
        </div>

        {/* Layout validation result */}
        <div
          className={`validation-status ${
            validation.valid
              ? "valid"
              : "invalid"
          }`}
        >
          <strong>
            Layout Status:{" "}
            {validation.valid
              ? "✓ Valid"
              : "✗ Invalid"}
          </strong>

          {validation.valid ? (
            <span>
              No overlap or clipping detected.
            </span>
          ) : (
            <div>
              {validation.errors.map(
                (error, index) => (
                  <div key={index}>
                    {error}
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Advertisement surface */}
        <div
          className="ad-surface"
          style={{
            aspectRatio: `${layout.width} / ${layout.height}`,
          }}
        >
          {layout.elements.map((element) => {
            if (!element.visible) {
              return null;
            }

            return (
              <div
                key={element.id}
                className={`ad-element ${element.type} ${element.role}`}
                style={{
                  left: `${
                    (element.x / layout.width) *
                    100
                  }%`,
                  top: `${
                    (element.y / layout.height) *
                    100
                  }%`,
                  width: `${
                    (element.width /
                      layout.width) *
                    100
                  }%`,
                  height: `${
                    (element.height /
                      layout.height) *
                    100
                  }%`,
                }}
              >
                {element.type === "image" &&
                element.role === "hero" ? (
                  <img
                    src={element.content}
                    alt="Product"
                  />
                ) : (
                  <span>{element.content}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Resolver debugging information */}
        <section className="layout-debug">
          <h2>Resolved Layout</h2>

          {layout.elements.map((element) => (
            <div
              className={`debug-item ${
                element.visible
                  ? "visible"
                  : "hidden"
              }`}
              key={element.id}
            >
              <div>
                <strong>{element.id}</strong>
              </div>

              <div>
                Status:{" "}
                {element.visible
                  ? "Visible"
                  : "Hidden"}
              </div>

              <div>
                Position: (
                {Math.round(element.x)},{" "}
                {Math.round(element.y)})
              </div>

              <div>
                Size:{" "}
                {Math.round(element.width)} ×{" "}
                {Math.round(element.height)}
              </div>

              <div>
                {element.reason}
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

export default App;