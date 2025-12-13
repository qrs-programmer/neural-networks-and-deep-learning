import { useRef, useEffect } from "react";

type DigitCanvasProps = {
  onSubmit?: (pixels: number[]) => void;
};

export default function DigitCanvas({ onSubmit }: DigitCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef<boolean>(false);

  const CANVAS_SIZE = 280;
  const SCALE_SIZE = 28;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // White background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    ctx.strokeStyle = "black";
    ctx.lineWidth = 20;
    ctx.lineCap = "round";
  }, []);

  const getPosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    isDrawing.current = true;
    const { x, y } = getPosition(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getPosition(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  };

  // Adapt the canvas data to match input for NN
  const getPixelData = (): number[] => {
    const canvas = canvasRef.current;
    if (!canvas) return [];

    const smallCanvas = document.createElement("canvas");
    smallCanvas.width = SCALE_SIZE;
    smallCanvas.height = SCALE_SIZE;

    const sctx = smallCanvas.getContext("2d");
    if (!sctx) return [];

    sctx.drawImage(canvas, 0, 0, SCALE_SIZE, SCALE_SIZE);

    const imageData = sctx.getImageData(0, 0, SCALE_SIZE, SCALE_SIZE);
    const data = imageData.data;

    const pixels: number[] = [];

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const gray = (r + g + b) / 3;
      pixels.push(1 - gray / 255);
    }

    return pixels;
  };

  const handleSubmit = () => {
    const pixels = getPixelData();
    onSubmit?.(pixels);
  };

  return (
    <div>
      <canvas
        style={{ border: "1px solid #000000" }}
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />

      <div>
        <button onClick={clearCanvas}>Clear</button>
        <button onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
}
