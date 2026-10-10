import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import ToastContainer from './components/ui/ToastContainer';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import StudyPlanner from './pages/StudyPlanner';
import DSAPractice from './pages/DSAPractice';
import MarkdownFocus from './pages/MarkdownFocus';
import VoiceAssistant from './pages/VoiceAssistant';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Application Workspace */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="study-planner" element={<StudyPlanner />} />
              <Route path="dsa-practice" element={<DSAPractice />} />
              <Route path="markdown-focus" element={<MarkdownFocus />} />
              <Route path="voice-assistant" element={<VoiceAssistant />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Catch-all redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
        <ToastContainer />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
