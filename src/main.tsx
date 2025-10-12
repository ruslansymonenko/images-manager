import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import "./styles.css";
import { Layout } from "./components";
import { WorkspaceProvider } from "./contexts/WorkspaceContext";
import { ImageProvider } from "./contexts/ImageContext";
import MainPage from "./pages/MainPage";
import WorkspacePage from "./pages/WorkspacePage";
import GalleryPage from "./pages/GalleryPage";
import ImageDetailsPage from "./pages/ImageDetailsPage";
import TagsPage from "./pages/TagsPage";
import ConnectionsPage from "./pages/ConnectionsPage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
    <WorkspaceProvider>
      <ImageProvider>
        <HashRouter>
          <Routes>
            {/* Main page */}
            <Route path="/" element={<MainPage />} />

            {/* All other pages */}
            <Route path="/" element={<Layout />}>
              <Route path="workspace" element={<WorkspacePage />} />
              <Route path="gallery" element={<GalleryPage />} />
              <Route
                path="gallery/image/:imagePath"
                element={<ImageDetailsPage />}
              />
              <Route path="tags" element={<TagsPage />} />
              <Route path="connections" element={<ConnectionsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </HashRouter>
      </ImageProvider>
    </WorkspaceProvider>
  );
}

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<App />);
