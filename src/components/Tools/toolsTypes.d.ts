export interface ICanvasProps {
  canvas: React.RefObject<HTMLCanvasElement>;
  ctx: CanvasRenderingContext2D | null;
}
