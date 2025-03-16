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
      <Toaster position="top-right" 
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #475569'
          },
          success: {
            iconTheme: {
              primary: '#30BDF2',
              secondary: '#1e293b',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#1e293b',
            },
          },
        }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
                <Navbar />
                <div className="container mx-auto py-4"></div>
                <BillSplitter />
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
} 