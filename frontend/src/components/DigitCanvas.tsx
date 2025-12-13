import { useRef, useEffect, useState } from "react";

export default function DigitCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef<boolean>(false);
  const [predictedDigit, setPredictedDigit] = useState(-1);
  const CANVAS_SIZE = 280;
  const SCALE_SIZE = 28;

  const handleSubmit = async () => {
    const pixels = getPixelData();

    try {
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pixels }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setPredictedDigit(data.digit);
    } catch (error) {
      console.error("Error fetching prediction:", error);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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

  return (
    <div>
      <div>
        <p>The digit is: {predictedDigit}</p>
      </div>
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
