import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from './context/AuthContext';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ProblemDetail from './pages/ProblemDetail';
import ProblemsPage from './pages/ProblemsPage';
import ProfilePage from './pages/ProfilePage';
import NotesPage from './pages/NotesPage';
import ContestsPage from './pages/ContestsPage';
import CreateContestPage from './pages/CreateContestPage';
import ContestDetailPage from './pages/ContestDetailPage';
import Navbar from './components/Navbar';
import Loader from './components/Loader';

function App() {
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);

  
  
  const ProtectedRoute = ({ children, adminOnly = false }) => {
    if (!user) return <Navigate to="/login" />;
    if (adminOnly && user.role !== 'Admin') return <Navigate to="/" />;
    return children;
  };

  if (isLoading) {
    return <Loader onComplete={() => setIsLoading(false)} />;
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex flex-col">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
            <Route 
              path="/notes" 
              element={
                <ProtectedRoute>
                  <NotesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/problems" 
              element={
                <ProtectedRoute>
                  <ProblemsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/problem/:id" 
              element={
                <ProtectedRoute>
                  <ProblemDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/contests" 
              element={
                <ProtectedRoute>
                  <ContestsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/contests/create" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <CreateContestPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/contests/:id" 
              element={
                <ProtectedRoute>
                  <ContestDetailPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
