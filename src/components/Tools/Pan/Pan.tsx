import React, { useRef, useState } from "react";
import { useAppSelector, useAppDispatch } from "../../../hooks/storeHooks";
import { useEventListener } from "../../../hooks/useEventListener";
import { Coords } from "../../../types";
import { setOffset } from "../../../store/slices/toolsSlice";
import { canvasOutOfBounds } from "../../../heplers/helpers";
import { ICanvasProps } from "../toolsTypes";
import styles from "./Pan.module.css";

export const Pan: React.FC<ICanvasProps> = ({ canvas, ctx }) => {
  const [isPressed, setIsPressed] = useState<boolean>(false);
  const { canvasScale, canvasOffset } = useAppSelector(
    (state) => state.canvasSlice
  );

  const dispatch = useAppDispatch();

  const startMoving = (event: Event) => {
    if (!ctx || !(event instanceof MouseEvent)) return;
    setIsPressed(true);
  };

  const stopMoving = () => {
    setIsPressed(false);
  };

  const moveHandler = (event: Event) => {
    event.preventDefault();

    if (!ctx || !(event instanceof MouseEvent)) return;

    const calcOffsetX = canvasOutOfBounds(
      canvasOffset.x,
      event.movementX,
      canvasScale,
      ctx.canvas.width
    );
    const calcOffsetY = canvasOutOfBounds(
      canvasOffset.y,
      event.movementY,
      canvasScale,
      ctx.canvas.height
    );

    dispatch(setOffset({ x: calcOffsetX, y: calcOffsetY }));
  };

  useEventListener({
    eventName: "mousemove",
    handler: (e) => {
      if (!isPressed) return;
      moveHandler(e);
    },
  });

  useEventListener({
    eventName: "mousedown",
    handler: startMoving,
    element: canvas,
  });

  useEventListener({
    eventName: "mouseup",
    handler: stopMoving,
  });

  return (
    <div className={styles.pan}>
      <p>OFFSET</p>
      <p>X: {canvasOffset.x}</p>
      <p>Y: {canvasOffset.y}</p>
    </div>
  );
};
