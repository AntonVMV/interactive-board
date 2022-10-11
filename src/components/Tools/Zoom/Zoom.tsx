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

    // event.wheel.deltaY on different screens may have different values ( 100, 125... etc)
    // To prevent errors in the calculations, we make the zoom value constant and equal to 125
    let zoomConstant;

    if (event.deltaY < 0) {
      zoomConstant = -125;
    } else {
      zoomConstant = 125;
    }

    if (
      canvasScale - zoomConstant / 1000 < 1 ||
      canvasScale - zoomConstant / 1000 > 10
    ) {
      return;
    }

    const offsetDeltaX = (ctx.canvas.width * zoomConstant) / wheelSens / 2;
    const offsetDeltaY = (ctx.canvas.height * zoomConstant) / wheelSens / 2;

    const scaleRate = canvasScale - zoomConstant / 1000;

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
