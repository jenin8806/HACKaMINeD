import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import { LandingPage } from "./components/LandingPage";
import { Dashboard } from "./components/Dashboard";
import { MyProjects } from "./components/MyProjects";
import { ProjectDetail } from "./components/ProjectDetail";
import { EpisodesList } from "./components/EpisodesList";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";
import { UserProvider } from "./contexts/UserContext";
import { TheVboxLoader } from "./components/TheVboxLoader";

export default function App() {
  const [loaderDone, setLoaderDone] = useState(false);

  return (
    <UserProvider>
      {!loaderDone && <TheVboxLoader onComplete={() => setLoaderDone(true)} />}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<MyProjects />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/project/:id/episodes" element={<EpisodesList />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}
