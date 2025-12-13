import "./App.css";
import DigitCanvas from "./components/DigitCanvas";

function App() {
  const handleDigitSubmit = (pixels: number[]) => {
    console.log(pixels.length);
    console.log(pixels);
    fetch("http://localhost:8000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pixels }),
    });
  };
  return (
    <div>
      <h1>Digit Recognizer</h1>
      <DigitCanvas onSubmit={handleDigitSubmit} />
    </div>
  );
}

export default App;
