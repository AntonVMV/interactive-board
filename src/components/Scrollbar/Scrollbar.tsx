import React, { HTMLAttributes, useRef, useState } from "react";
import { canvasOutOfBounds } from "../../heplers/helpers";
import { useAppDispatch, useAppSelector } from "../../hooks/storeHooks";
import { useEventListener } from "../../hooks/useEventListener";
import { setOffset } from "../../store/slices/toolsSlice";

import styles from "./Scrollbar.module.css";

interface ScrollbarProps extends HTMLAttributes<HTMLDivElement> {
  canvHeight: number;
  canvWidth: number;
  offsetHeight: number;
  offsetWidth: number;
}

export const Scrollbar: React.FC<ScrollbarProps> = ({
  canvHeight,
  canvWidth,
  offsetHeight,
  offsetWidth,
  ...props
}) => {
  const { canvasOffset, canvasScale } = useAppSelector(
    (state) => state.canvasSlice
  );
  const [isScrollPressed, setScrollPressed] = useState<boolean>(false);
  const [activeAxis, setActiveAxis] = useState<"x" | "y">();
  const ref = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();

  const scrollMoveX = (e: Event) => {
    e.preventDefault();
    if (!isScrollPressed || !(e instanceof MouseEvent)) {
      return;
    }

    const overflowX = canvWidth - canvWidth * canvasScale;
    const overflowY = canvHeight - canvHeight * canvasScale;

    let modifierX = overflowX / (offsetWidth - offsetWidth / canvasScale);
    let modifierY = overflowY / (offsetHeight - offsetHeight / canvasScale);

    if (activeAxis === "x") {
      modifierY = 0;
    } else {
      modifierX = 0;
    }

    const calcOffsetX = canvasOutOfBounds(
      canvasOffset.x,
      e.movementX * modifierX,
      canvasScale,
      canvWidth
    );
    const calcOffsetY = canvasOutOfBounds(
      canvasOffset.y,
      e.movementY * modifierY,
      canvasScale,
      canvHeight
    );

    dispatch(setOffset({ x: calcOffsetX, y: calcOffsetY }));
  };

  const scrollEnd = () => {
    setScrollPressed(false);
  };

  useEventListener({
    eventName: "mouseup",
    handler: scrollEnd,
  });

  useEventListener({
    eventName: "mousemove",
    handler: scrollMoveX,
  });

  const calculateScrollbar = () => {
    const percentX = canvasOffset.x / (canvWidth * canvasScale - canvWidth);
    const percentY = canvasOffset.y / (canvHeight * canvasScale - canvHeight);
    const size = 100 / canvasScale;
    const left = (100 - size) * Math.abs(percentX) || 0;
    const top = (100 - size) * Math.abs(percentY) || 0;

    return { x: left, y: top };
  };

  return (
    <div ref={ref} className={styles.scroll_container} {...props}>
      <div
        className={styles.scroll_bottom}
        onMouseDown={() => {
          setActiveAxis("x");
          setScrollPressed(true);
        }}
        style={{
          width: `${100 / canvasScale}%`,
          left: `${calculateScrollbar().x}%`,
        }}
      ></div>
      <div
        className={styles.scroll_right}
        onMouseDown={() => {
          setActiveAxis("y");
          setScrollPressed(true);
        }}
        style={{
          height: `${100 / canvasScale}%`,
          top: `${calculateScrollbar().y}%`,
        }}
      ></div>
    </div>
  );
};
