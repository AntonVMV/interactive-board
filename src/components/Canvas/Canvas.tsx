import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
import { useEventListener } from "../../hooks/useEventListener";

type Coords = {
  x: number;
  y: number;
};

const initCoords = {
  x: 0,
  y: 0,
};

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

  //Zoom when scale state changes
  // useEffect(() => {
  //   if (!ctx) return;

  //   console.log(scale);

  //   const { b, c, e, f } = ctx.getTransform();
  //   ctx.setTransform(scale, b, c, scale, e, f);
  // }, [scale, ctx]);

  //Transform, when offset or zoom changes
  useEffect(() => {
    if (!ctx) {
      return;
    }

    console.log(offset.x - lastOffset.x);

    ctx.translate(offset.x - lastOffset.x, offset.y - lastOffset.y);

    const { b, c, e, f } = ctx.getTransform();

    ctx.setTransform(scale, b, c, scale, e, f);
  }, [offset, ctx, lastOffset, scale]);

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

  const startMoving = ({
    pageX,
    pageY,
  }: React.MouseEvent<HTMLCanvasElement>) => {
    setIsPressed(true);
    setMouseLastPosition({ x: pageX, y: pageY });
  };

  const stopMoving = () => {
    setIsPressed(false);
  };

  const moveHandler = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();

      if (!ctx) return;

      const lastMousePos = mouseLastPosition;
      const currentMousePos = { x: event.pageX, y: event.pageY };
      setMouseLastPosition(currentMousePos);

      const diff = {
        x: (currentMousePos.x - lastMousePos.x) / scale,
        y: (currentMousePos.y - lastMousePos.y) / scale,
      };

      setOffset((prev) => {
        const coords = { x: 0, y: 0 };

        //Check that we are not moving outside the canvas.
        //If we have a canvas width of 900 pixels, then at zoom x2,
        //the maximum offset along the x axis should not be more than 900 pixels
        if (prev.x + diff.x > 0) {
          coords.x = 0;
        } else if (
          prev.x + diff.x <
          ctx.canvas.width - ctx.canvas.width * scale
        ) {
          coords.x = ctx.canvas.width - ctx.canvas.width * scale;
        } else {
          coords.x = prev.x + diff.x;
        }

        if (prev.y + diff.y > 0) {
          coords.y = 0;
        } else if (
          prev.y + diff.y <
          ctx.canvas.height - ctx.canvas.height * scale
        ) {
          coords.y = ctx.canvas.height - ctx.canvas.height * scale;
        } else {
          coords.y = prev.y + diff.y;
        }

        return { x: coords.x, y: coords.y };
      });
    },
    [mouseLastPosition, ctx, scale]
  );

  useEffect(() => {
    if (!isPressed) {
      return;
    }

    document.addEventListener("mousemove", moveHandler);
    return () => {
      document.removeEventListener("mousemove", moveHandler);
    };
  }, [isPressed, mouseLastPosition, moveHandler]);

  const zoomHandler = (event: React.WheelEvent) => {
    if (!ctx) return;

    if (scale - event.deltaY / 1000 < 1 || scale - event.deltaY / 1000 > 10) {
      return;
    }

    setOffset((prev) => ({
      x: prev.x + (ctx.canvas.width * event.deltaY) / 1000 / 2,
      y: prev.y + (ctx.canvas.height * event.deltaY) / 1000 / 2,
    }));

    setScale(scale - event.deltaY / 1000);
  };

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
      <canvas
        ref={canvas}
        onMouseDown={startMoving}
        onMouseUp={stopMoving}
        onWheel={zoomHandler}
      ></canvas>
    </>
  );
};
