export interface SurfaceProfile {
  id: string;
  name: string;
  width: number;
  height: number;
  minMargin: number;
  gap: number;
}

export const surfaces: SurfaceProfile[] = [
  {
    id: "mobile-portrait",
    name: "Mobile Portrait",
    width: 320,
    height: 480,
    minMargin: 16,
    gap: 12,
  },
  {
    id: "mobile-landscape",
    name: "Mobile Landscape",
    width: 480,
    height: 320,
    minMargin: 16,
    gap: 12,
  },
  {
    id: "broadcast-lower-third",
    name: "Broadcast Lower Third",
    width: 1920,
    height: 250,
    minMargin: 40,
    gap: 24,
  },
  {
    id: "square-kiosk",
    name: "Square Kiosk",
    width: 1080,
    height: 1080,
    minMargin: 40,
    gap: 24,
  },
  {
    id: "test-banner",
    name: "Test Banner",
    width: 600,
    height: 180,
    minMargin: 16,
    gap: 12,
  },
];
