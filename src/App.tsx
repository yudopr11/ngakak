import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import BillSplitter from './components/BillSplitter';
import Login from './components/Login';
import Navbar from './components/Navbar';
import { isAuthenticated } from './services/auth';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = isAuthenticated();
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Router>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <div className="min-h-screen bg-gray-900">
                <Navbar />
                <BillSplitter />
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
} 