import { Navigate, Route, Routes } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import LibraryPage from "./pages/LibraryPage";
import LettersPage from "./pages/LettersPage";
import LearnPage from "./pages/LearnPage";

function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/letters" element={<LettersPage />} />
        <Route path="/learn/:letterKey" element={<LearnPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
