import { createRoot } from "react-dom/client";
import "./styles.css";
import MainPage from "./pages/MainPage";

function App() {
  return (
    <main className="container w-full h-full">
      <MainPage />
    </main>
  );
}

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<App />);
