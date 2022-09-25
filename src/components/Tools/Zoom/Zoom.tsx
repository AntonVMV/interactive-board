import { useAppDispatch, useAppSelector } from "../../../hooks/storeHooks";
import { useEventListener } from "../../../hooks/useEventListener";
import { setOffset, setScale } from "../../../store/slices/toolsSlice";
import { canvasOutOfBounds } from "../../../heplers/helpers";
import { ICanvasProps } from "../toolsTypes";
import styles from "./Zoom.module.css";

const wheelSens = 1000;

export const Zoom: React.FC<ICanvasProps> = ({ canvas, ctx }) => {
  const { canvasScale, canvasOffset } = useAppSelector(
    (state) => state.canvasSlice
  );

  const dispatch = useAppDispatch();

  const zoomHandler = (event: Event) => {
    if (!ctx || !(event instanceof WheelEvent)) return;

    if (
      canvasScale - event.deltaY / 1000 < 1 ||
      canvasScale - event.deltaY / 1000 > 10
    ) {
      return;
    }

    const offsetDeltaX = (ctx.canvas.width * event.deltaY) / wheelSens / 2;
    const offsetDeltaY = (ctx.canvas.height * event.deltaY) / wheelSens / 2;

    const scaleRate = canvasScale - event.deltaY / 1000;

    const calcOffsetX = canvasOutOfBounds(
      canvasOffset.x,
      offsetDeltaX,
      scaleRate,
      ctx.canvas.width
    );
    const calcOffsetY = canvasOutOfBounds(
      canvasOffset.y,
      offsetDeltaY,
      scaleRate,
      ctx.canvas.height
    );

    dispatch(setOffset({ x: calcOffsetX, y: calcOffsetY }));

    dispatch(setScale(scaleRate));
  };

  useEventListener({
    eventName: "wheel",
    handler: zoomHandler,
    element: canvas,
  });

  return <div className={styles.zoom}>Scale: {canvasScale}</div>;
};
