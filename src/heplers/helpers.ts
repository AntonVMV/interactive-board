import { RefObject } from "react";

export const getRefElement = <T>(
  element?: RefObject<Element> | T
): Element | T | undefined | null => {
  if (element && "current" in element) {
    return element.current;
  }

  return element;
};

//This function will check if the canvas goes out of bounds when we move or zoom viewport
//and the figures placed on the canvas were located correctly.
export function canvasOutOfBounds(
  position: number,
  offset: number,
  scale: number,
  size: number
): number {
  let newOffset;

  if (position + offset > 0) {
    newOffset = 0;
  } else if (position + offset < size - size * scale) {
    newOffset = size - size * scale;
  } else {
    newOffset = position + offset;
  }

  return newOffset;
}
