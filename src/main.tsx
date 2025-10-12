import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import "./styles.css";
import { Layout } from "./components";
import MainPage from "./pages/MainPage";
import WorkspacePage from "./pages/WorkspacePage";
import GalleryPage from "./pages/GalleryPage";
import TagsPage from "./pages/TagsPage";
import ConnectionsPage from "./pages/ConnectionsPage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Main page without navbar */}
        <Route path="/" element={<MainPage />} />

        {/* All other pages with navbar through Layout */}
        <Route path="/" element={<Layout />}>
          <Route path="workspace" element={<WorkspacePage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="tags" element={<TagsPage />} />
          <Route path="connections" element={<ConnectionsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<App />);
