import React, { useEffect, useState, useRef } from "react";
import { useEventListener } from "../../hooks/useEventListener";

type Coords = {
  x: number;
  y: number;
};

const initCoords = {
  x: 0,
  y: 0,
};

//This function will check if the canvas goes out of bounds when we move or zoom viewport
//and the figures placed on the canvas were located correctly.
function canvasOutOfBounds(
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

export const Canvas: React.FC = () => {
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [offset, setOffset] = useState<Coords>(initCoords);
  const [isPressed, setIsPressed] = useState<boolean>(false);
  const [mouseLastPosition, setMouseLastPosition] =
    useState<Coords>(initCoords);
  const [lastOffset, setLastOffset] = useState<Coords>(initCoords);
  const [scale, setScale] = useState<number>(1);

  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setLastOffset(offset);
  }, [offset]);

  //Get canvas context
  useEffect(() => {
    if (canvas.current) {
      setCtx(canvas.current.getContext("2d"));
      canvas.current.width = 900;
      canvas.current.height = 600;
    }
  }, []);

  //Transform, when offset or zoom changes
  useEffect(() => {
    if (!ctx) {
      return;
    }
    const { b, c, e, f } = ctx.getTransform();

    ctx.setTransform(
      scale,
      b,
      c,
      scale,
      e + offset.x - lastOffset.x,
      f + offset.y - lastOffset.y
    );
  }, [offset, ctx, scale, lastOffset]);

  //Draw elements
  useEffect(() => {
    if (!ctx) {
      return;
    }

    const storedTransform = ctx.getTransform();
    console.log(storedTransform);

    ctx.canvas.width = 900;
    ctx.setTransform(storedTransform);

    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.rect(100, 100, 300, 150);
    ctx.stroke();
  }, [ctx, offset, scale]);

  const startMoving = (event: Event) => {
    if (!(event instanceof MouseEvent)) return;
    setIsPressed(true);
    setMouseLastPosition({ x: event.pageX, y: event.pageY });
  };

  const stopMoving = () => {
    setIsPressed(false);
  };

  const moveHandler = (event: Event) => {
    event.preventDefault();

    if (!ctx || !isPressed || !(event instanceof MouseEvent)) return;

    const lastMousePos = mouseLastPosition;
    const currentMousePos = { x: event.pageX, y: event.pageY };
    setMouseLastPosition(currentMousePos);

    const diff = {
      x: currentMousePos.x - lastMousePos.x,
      y: currentMousePos.y - lastMousePos.y,
    };

    const calcOffsetX = canvasOutOfBounds(
      offset.x,
      diff.x,
      scale,
      ctx.canvas.width
    );
    const calcOffsetY = canvasOutOfBounds(
      offset.y,
      diff.y,
      scale,
      ctx.canvas.height
    );

    setOffset({ x: calcOffsetX, y: calcOffsetY });
  };

  const zoomHandler = (event: Event) => {
    if (!ctx || !(event instanceof WheelEvent)) return;

    if (scale - event.deltaY / 1000 < 1 || scale - event.deltaY / 1000 > 10) {
      return;
    }

    const offsetDeltaX = (ctx.canvas.width * event.deltaY) / 1000 / 2;
    const offsetDeltaY = (ctx.canvas.height * event.deltaY) / 1000 / 2;

    const scaleRate = scale - event.deltaY / 1000;

    const calcOffsetX = canvasOutOfBounds(
      offset.x,
      offsetDeltaX,
      scaleRate,
      ctx.canvas.width
    );
    const calcOffsetY = canvasOutOfBounds(
      offset.y,
      offsetDeltaY,
      scaleRate,
      ctx.canvas.height
    );

    setOffset({ x: calcOffsetX, y: calcOffsetY });

    setScale(scaleRate);
  };

  useEventListener({
    eventName: "wheel",
    handler: zoomHandler,
    element: canvas,
  });

  useEventListener({
    eventName: "mousemove",
    handler: moveHandler,
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
    <>
      <div>
        <div>
          <p>Offset</p>
          <p>x: {offset.x}</p>
          <p>y: {offset.y}</p>
          <p>Scale: {scale}</p>
        </div>
      </div>
      <canvas ref={canvas} onMouseUp={stopMoving}></canvas>
    </>
  );
};
