import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useAppSelector } from "../../hooks/storeHooks";
import { Pan } from "../Tools/Pan/Pan";
import { Scrollbar } from "../Scrollbar/Scrollbar";
import { Zoom } from "../Tools/Zoom/Zoom";
import styles from "./Canvas.module.css";

type Coords = {
  x: number;
  y: number;
};

const initCoords = {
  x: 0,
  y: 0,
};

export const Canvas: React.FC = () => {
  const { canvasScale, canvasOffset } = useAppSelector(
    (state) => state.canvasSlice
  );
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const lastOffsetRef = useRef<Coords>(initCoords);

  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    lastOffsetRef.current = canvasOffset;
  }, [canvasOffset]);

  //Get canvas context
  useEffect(() => {
    if (canvas.current) {
      setCtx(canvas.current.getContext("2d"));
      canvas.current.width = 1920;
      canvas.current.height = 1080;
    }
  }, []);

  //Transform, when offset or zoom changes
  useLayoutEffect(() => {
    if (!ctx) {
      return;
    }
    const { b, c, e, f } = ctx.getTransform();

    ctx.setTransform(
      canvasScale,
      b,
      c,
      canvasScale,
      e + canvasOffset.x - lastOffsetRef.current.x,
      f + canvasOffset.y - lastOffsetRef.current.y
    );
  }, [canvasOffset, ctx, canvasScale]);

  //Draw elements
  useEffect(() => {
    if (!ctx) {
      return;
    }

    const storedTransform = ctx.getTransform();
    ctx.canvas.width = 1920;
    ctx.setTransform(storedTransform);

    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.rect(100, 100, 300, 150);
    ctx.stroke();
  }, [ctx, canvasOffset, canvasScale]);

  return (
    <>
      <div className={styles.container}>
        <canvas ref={canvas}></canvas>
        {ctx && (
          <Scrollbar
            canvHeight={ctx.canvas.height}
            canvWidth={ctx.canvas.width}
            offsetWidth={ctx.canvas.offsetWidth}
            offsetHeight={ctx.canvas.offsetHeight}
            style={{ opacity: canvasScale > 1 ? 1 : 0 }}
          />
        )}
      </div>
      <Pan canvas={canvas} ctx={ctx} />
      <Zoom canvas={canvas} ctx={ctx} />
    </>
  );
};
