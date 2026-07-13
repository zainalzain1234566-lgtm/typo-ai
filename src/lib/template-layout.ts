import type { CarouselSize, Placement } from "./types";

export function templateLayoutProfile(size: CarouselSize) {
  if (size === "1080x1920") return {
    isStory: true,
    isPortrait: false,
    paddingX: 84,
    paddingY: 150,
    contentMaxWidth: 900,
    decorScale: 1.2,
    typeScale: 1.3,
    rotationScale: 0.55,
    magazineColumns: 1,
  };
  if (size === "1080x1350") return {
    isStory: false,
    isPortrait: true,
    paddingX: 76,
    paddingY: 92,
    contentMaxWidth: 860,
    decorScale: 1.08,
    typeScale: 1.12,
    rotationScale: 0.8,
    magazineColumns: 2,
  };
  return {
    isStory: false,
    isPortrait: false,
    paddingX: 70,
    paddingY: 60,
    contentMaxWidth: 820,
    decorScale: 1,
    typeScale: 1,
    rotationScale: 1,
    magazineColumns: 2,
  };
}

export function oppositeHorizontalPlacement(placement: Placement): Placement {
  return placement.endsWith("right")
    ? placement.replace("right", "left") as Placement
    : placement.replace("left", "right") as Placement;
}
