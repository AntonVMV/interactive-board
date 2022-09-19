import { useEffect, useState, useRef, useCallback } from "react";

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

  //Draw elements
  useEffect(() => {
    if (!ctx) {
      return;
    }

    const storedTransform = ctx.getTransform();
    ctx.canvas.width = 900;
    ctx.setTransform(storedTransform);

    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.rect(100, 100, 300, 150);
    ctx.stroke();
  }, [ctx, offset]);

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
      const lastMousePos = mouseLastPosition;
      const currentMousePos = { x: event.pageX, y: event.pageY };
      setMouseLastPosition(currentMousePos);

      const diff = {
        x: currentMousePos.x - lastMousePos.x,
        y: currentMousePos.y - lastMousePos.y,
      };
      setOffset((prev) => {
        return { x: prev.x + diff.x, y: prev.y + diff.y };
      });
    },
    [mouseLastPosition]
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

  //Move, when offset changes
  useEffect(() => {
    if (!ctx) {
      return;
    }

    ctx.translate(offset.x - lastOffset.x, offset.y - lastOffset.y);
  }, [offset, ctx, lastOffset]);

  // useEventListener({
  //   eventName: "mousemove",
  //   handler: moveHandler,
  // });

  // const moveHandler = (event: MouseEvent) => {
  //   const last = mouseDownPosition.x;
  //   console.log(last);
  // };

  // const startMoving = (event: React.MouseEvent<HTMLCanvasElement>) => {
  //   setMouseDownPosition({ x: event.pageX, y: event.pageY });
  // };

  return (
    <>
      <div>
        <div>
          <p>Offset</p>
          <p>x: {offset.x}</p>
          <p>y: {offset.y}</p>
        </div>
      </div>
      <canvas
        ref={canvas}
        onMouseDown={startMoving}
        onMouseUp={stopMoving}
      ></canvas>
    </>
  );
};
