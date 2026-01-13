import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider"
import Signup from "./pages/public/signup/Signup";
import Login from "./pages/public/login/Login";
import HomePage from "./pages/private/HomePage/HomePage";
import StudyTeams from "@/pages/private/Teams/StudyTeams";
import SharedResources from "./pages/private/SharedResources/SharedResources";
import TrackProgress from "./pages/private/TrackProgress/TrackProgress";
import Friends from "./pages/private/Friends/Friends";
import Settings from "./pages/private/Settings/Settings";
import AddFriends from "./pages/private/AddFriends/AddFriends";
import EditAccountInfo from "./pages/private/EditAccountInfo/EditAccountInfo";
import PrivateRoutes from "./utils/PrivateRoutes";
import AuthRoutes from "./utils/AuthRoutes";
import TeamPage from "./pages/private/Teams/TeamPage";
import SolveQuiz from "./pages/private/Teams/TeamPageComponents/SolveQuiz";
import CreateQuiz from "./pages/private/Teams/TeamPageComponents/CreateQuiz";
import PrivateCallPage from "./pages/private/Calls/PrivateCallPage";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          {/* Default route */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Auth routes */}
          <Route element={<AuthRoutes defaultRoute="/home" />}>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Private routes */}
          <Route element={<PrivateRoutes defaultRoute="/login" />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/study-teams" element={<StudyTeams />} />
            <Route path="/shared-resources" element={<SharedResources />} />
            <Route path="/statistics" element={<TrackProgress />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/add-friends" element={<AddFriends />} />
            <Route path="/edit-account-info" element={<EditAccountInfo />} />
            <Route path="/teams/:teamId" element={<TeamPage />} />
            <Route path="/teams/:teamId/quizzes/create" element={<CreateQuiz />} />
            <Route path="/teams/:teamId/quizzes/:quizId/solve" element={<SolveQuiz />} />
            <Route path="/private-call/:roomId" element={<PrivateCallPage />} />
          </Route>

        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App